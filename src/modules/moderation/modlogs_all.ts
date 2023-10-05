import { fetchWithCache } from '$lib/cache';
import { prisma } from '$lib/db';
import { emojis } from '$lib/env';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { avatar } from '$lib/functions/avatar';
import { formatUsername } from '$lib/functions/formatUsername';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { getAllLanguages, t } from '$lib/language';
import { renderLowBudgetMessage } from '$lib/timeouts/handleReminder';
import {
  ModerationStrikeTypes,
  ModerationEntry as NewModerationEntry,
  OldModerationStrikes,
} from '@prisma/client';
import { dateToSnowflake, snowflakeToDate, timestampMention } from '@purplet/utils';
import dayjs from 'dayjs';
import dedent from 'dedent';
import { MessageFlags, PermissionFlagsBits } from 'discord-api-types/v10';
import {
  ButtonInteraction,
  Interaction,
  MessageOptions,
  ModalSubmitInteraction,
  SelectMenuInteraction,
  TextInputComponent,
} from 'discord.js';
import {
  ButtonComponent,
  ChatCommand,
  ModalComponent,
  SelectMenuComponent,
  components,
  row,
} from 'purplet';
import {
  ChannelModerationActions,
  ModerationAction,
  ModerationColors,
  moderationVerbStrings,
} from './_base';

export type ModerationEntry = NewModerationEntry & { oldId?: string };

async function getAllEntries(this: Interaction, filterTargetId?: string) {
  const oldData = (
    await fetchWithCache(
      `strikes:${this.guildId}`,
      () =>
        prisma.oldModerationStrikes.findMany({
          where: { serverId: this.guild.id },
          orderBy: {
            createdAt: 'desc',
          },
        }),
      !(
        this instanceof ButtonInteraction &&
        !this.component.label &&
        this.component.style === 'PRIMARY'
      ),
    )
  ).map((e) => formatOldModEntry(e));

  const data = [
    ...(await fetchWithCache(
      `mod_history:${this.guildId}`,
      () =>
        prisma.moderationEntry.findMany({
          where: { guildId: this.guild.id },
          orderBy: {
            id: 'desc',
          },
        }),
      !(
        this instanceof ButtonInteraction &&
        !this.component.label &&
        this.component.style === 'PRIMARY'
      ),
    )),
    ...oldData,
  ].filter((a) => (filterTargetId ? a.targetId === filterTargetId : a));

  return data;
}

function formatOldModEntry(entry: OldModerationStrikes): ModerationEntry {
  const enumConvert: Record<ModerationStrikeTypes, ModerationAction> = {
    BAN: ModerationAction.UserBan,
    CLEAR: ModerationAction.ChannelMessageClear,
    KICK: ModerationAction.UserKick,
    REPORT: ModerationAction.UserReport,
    TEMPBAN: ModerationAction.UserTemporaryBan,
    TIMEOUT: ModerationAction.UserTimeout,
    WARN: ModerationAction.UserWarn,
  };

  return {
    id: dateToSnowflake(entry.createdAt),
    reason: entry.reason,
    targetId: entry.targetId,
    type: enumConvert[entry.type],
    userId: entry.moderatorId,
    guildId: entry.serverId,
    endDate: entry.expiresAt,
    details: entry.details,
    oldId: entry.id,
  };
}

interface PageBtnProps {
  page: number;
  uId?: string;
  s?: boolean;
}

export default ChatCommand({
  name: 'modlogs all',
  description: t('en-US', 'modlogs_all.description'),
  descriptionLocalizations: getAllLanguages('modlogs_all.description'),
  allowInDMs: false,
  async handle() {
    if (!hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
      return CRBTError(
        this,
        t(this, 'ERROR_MISSING_PERMISSIONS').replace('{PERMISSIONS}', 'Manage Server'),
      );
    }

    await this.deferReply({
      ephemeral: true,
    });

    const res = await renderModlogs.call(this);

    await this.editReply(res);
  },
});

export function renderEntry(entry: ModerationEntry, locale: string, entries: ModerationEntry[]) {
  const action = t(locale, moderationVerbStrings[entry.type]);
  const expires =
    Date.now() < (entry.endDate?.getTime() ?? 0)
      ? `(Expires ${timestampMention(entry.endDate, 'R')}) `
      : '';
  const unlockedOn =
    entry.type === ModerationAction.ChannelLock && entry.endDate
      ? `(${t(locale, 'MOD_VERB_UNLOCK')} ${timestampMention(entry.endDate, 'R')}) `
      : '';
  const reason = `**${t(
    locale,
    entry.type === ModerationAction.UserReport ? 'DESCRIPTION' : 'REASON',
  )}:** ${
    entry.details ? `[${t(locale, 'MESSAGE_FROM_USER')}]` : entry.reason ?? `*${t(locale, 'NONE')}*`
  }`;
  const target = !ChannelModerationActions.includes(entry.type)
    ? `<@${entry.targetId}>`
    : `<#${entry.targetId}>`;

  return {
    name: `${entries.indexOf(entry) + 1}. ${timestampMention(
      snowflakeToDate(entry.id),
      'f',
    )} • ${action} ${expires}${unlockedOn}`,
    value: dedent`
    <@${entry.userId}> ${t(locale, `MOD_VERB_${moderationVerbStrings[entry.type]}` as any, {
      target: '',
    }).toLocaleLowerCase(locale)} ${target}
    ${reason}
    `,
  };
}

export async function renderModlogs(
  this: Interaction,
  page: number = 0,
  filters?: {
    uId?: string;
  },
) {
  const user = filters?.uId ? this.client.users.cache.get(filters?.uId) : null;

  const data = await getAllEntries.call(this, filters?.uId);

  const results = data
    // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(page * 5, page * 5 + 5);
  const pages = Math.ceil(data.length / 5);

  return {
    embeds: [
      {
        author: user
          ? {
              name: `${formatUsername(user)} - ${t(this, 'MODERATION_LOGS_VIEW_TITLE', {
                SERVER: this.guild.name,
              })}`,
              iconURL: avatar(user),
            }
          : {
              name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
                SERVER: this.guild.name,
              }),
              iconURL: this.guild.iconURL(),
            },
        description: !data || data.length === 0 ? t(this, 'MODERATION_LOGS_VIEW_EMPTY') : '',
        fields: results.map((entry) => renderEntry(entry, this.locale, data)),
        footer: {
          text: `${t(this, 'MODERATION_LOGS_ENTRIES_TOTAL', {
            entries: data.length,
          })} • ${t(this, 'PAGINATION_PAGE_OUT_OF', {
            page: page + 1,
            pages,
          })}`,
        },
        color: await getColor(user ?? this.guild),
      },
    ],
    components: components(
      row(
        new ModEntrySelectMenu({ page, uId: filters?.uId })
          .setPlaceholder(t(this, 'MODERATION_LOGS_VIEW_SELECT_MENU_PLACEHOLDER'))
          .setOptions(
            !data || data.length === 0
              ? [{ label: 'h', value: 'h' }]
              : results.map((s, i) => ({
                  label: t(this, 'ENTRY_NO', { number: data.indexOf(s) + 1 }),
                  description: `${dayjs(snowflakeToDate(s.id)).format('YYYY-MM-DD')} • ${t(
                    this.guildLocale,
                    moderationVerbStrings[s.type],
                  )}`,
                  value: s.id,
                })),
          )
          .setDisabled(data.length === 0),
      ),
      row(
        // new ShowFiltersBtn().setStyle('SECONDARY').setLabel('Show Filters'),
        new GoToPage({ page: 0, uId: user?.id, s: false })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_first)
          .setDisabled(page <= 0),
        new GoToPage({ page: page - 1, uId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.left_arrow)
          .setDisabled(page <= 0),
        new GoToPage({ page: page + 1, uId: user?.id })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.right_arrow)
          .setDisabled(page >= pages - 1),
        new GoToPage({ page: pages - 1, uId: user?.id, s: true })
          .setStyle('PRIMARY')
          .setEmoji(emojis.buttons.skip_last)
          .setDisabled(page >= pages - 1),
      ),
    ),
    flags: MessageFlags.Ephemeral,
  };
}

export const GoToPage = ButtonComponent({
  async handle({ page, uId }: PageBtnProps) {
    this.update(await renderModlogs.call(this, page, { uId }));
  },
});

export const ModEntrySelectMenu = SelectMenuComponent({
  async handle({ page, uId }: PageBtnProps) {
    return this.update(await renderModEntryPage.call(this, this.values[0], { page, uId }));
  },
});

async function renderModEntryPage(
  this: SelectMenuInteraction | ModalSubmitInteraction | ButtonInteraction,
  sId: string,
  { page, uId }: PageBtnProps,
) {
  const data = await getAllEntries.call(this, uId);

  // .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const entry: ModerationEntry = data.find(({ id }) => id === sId);
  let lowBudgetMessage: MessageOptions['embeds'];

  if (entry.details) {
    const target = await this.client.users.fetch(entry.targetId);

    lowBudgetMessage = renderLowBudgetMessage({
      details: JSON.parse(entry.details),
      channel: this.channel,
      guild: this.guild,
      author: target,
    });
  }

  return {
    embeds: [
      {
        author: {
          name: t(this, 'MODERATION_LOGS_VIEW_TITLE', {
            SERVER: this.guild.name,
          }),
          icon_url: this.guild.iconURL(),
        },
        title: `${t(this, 'ENTRY_NO', {
          number: data.indexOf(entry) + 1,
        })} • ${t(this, moderationVerbStrings[entry.type])}`,
        fields: [
          {
            name: t(this, entry.type === ModerationAction.UserReport ? 'DESCRIPTION' : 'REASON'),
            value: entry.reason ?? `*${t(this, 'NONE')}*`,
          },
          {
            name: t(this, entry.type === ModerationAction.UserReport ? 'REPORTED_BY' : 'MODERATOR'),
            value: `<@${entry.userId}>`,
            inline: true,
          },
          ...(ChannelModerationActions.includes(entry.type)
            ? [
                {
                  name: t(this, 'CHANNEL'),
                  value: `<#${entry.targetId}>`,
                  inline: true,
                },
              ]
            : [
                {
                  name: t(this, 'USER'),
                  value: `<@${entry.targetId}>`,
                  inline: true,
                },
              ]),
          ...(entry.endDate
            ? [
                {
                  name: t(
                    this,
                    entry.type === ModerationAction.ChannelLock ? 'MOD_VERB_UNLOCK' : 'END_DATE',
                  ),
                  value: `${timestampMention(entry.endDate)} • ${timestampMention(
                    entry.endDate,
                    'R',
                  )}`,
                },
              ]
            : []),
        ],
        color:
          entry.type === ModerationAction.UserReport
            ? await getColor(this.guild)
            : ModerationColors[entry.type],
      },
      ...(lowBudgetMessage ? lowBudgetMessage : []),
    ],
    components: components(
      row(
        new GoToPage({ page, uId }).setEmoji(emojis.buttons.left_arrow).setStyle('SECONDARY'),
        ...(hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator)
          ? [
              ...(entry.type === ModerationAction.UserReport
                ? []
                : [
                    new EditButton({
                      sId,
                      page,
                      uId,
                      old: !!entry.oldId,
                    })
                      .setEmoji(emojis.buttons.pencil)
                      .setLabel(t(this, 'EDIT'))
                      .setStyle('PRIMARY'),
                  ]),
              new DeleteButton({ sId: entry.oldId ?? entry.id, page, uId, old: !!entry.oldId })
                .setEmoji(emojis.buttons.trash_bin)
                .setLabel(t(this, 'DELETE'))
                .setStyle('DANGER'),
            ]
          : []),
      ),
    ),
    flags: MessageFlags.Ephemeral,
  };
}

export const EditButton = ButtonComponent({
  async handle({ sId, uId, old, page }: PageBtnProps & { sId: string; old: boolean }) {
    const entry = (await getAllEntries.call(this)).find(({ id }) => id === sId);

    await this.showModal(
      new EditModal({ page, uId, sId, old })
        .setTitle(`${t(this, 'ENTRY')} - ${t(this, 'EDIT')}`)
        .setComponents(
          row(
            new TextInputComponent()
              .setLabel(t(this, 'REASON'))
              .setValue(entry.reason ?? '')
              .setCustomId('reason')
              .setMaxLength(256)
              .setStyle('PARAGRAPH')
              .setRequired(true),
          ),
        ),
    );
  },
});

export const EditModal = ModalComponent({
  async handle({ sId, uId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
    const reason = this.fields.getTextInputValue('reason');

    if (old) {
      await prisma.oldModerationStrikes.update({
        where: { id: sId },
        data: { reason },
      });

      await fetchWithCache(
        `strikes:${this.guildId}`,
        () =>
          prisma.oldModerationStrikes.findMany({
            where: { serverId: this.guildId },
          }),
        true,
      );
    } else {
      await prisma.moderationEntry.update({
        where: { id: sId },
        data: { reason },
      });

      await fetchWithCache(
        `mod_history:${this.guildId}`,
        () =>
          prisma.moderationEntry.findMany({
            where: { guildId: this.guildId },
          }),
        true,
      );
    }

    await this.update(await renderModEntryPage.call(this, sId, { uId, page }));
  },
});

export const DeleteButton = ButtonComponent({
  async handle({ sId, uId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
    const embed = this.message.embeds[0];

    await this.update({
      embeds: [
        {
          ...embed,
          author: {
            name: t(this, 'DELETE_CONFIRMATION_TITLE'),
          },
        },
      ],
      components: components(
        row(
          new ConfirmDeleteButton({ uId, sId, page, old })
            .setLabel(t(this, 'CONFIRM'))
            .setStyle('DANGER'),
          new GoToPage({ page: 0, uId }).setLabel(t(this, 'CANCEL')).setStyle('SECONDARY'),
        ),
      ),
    });
  },
});

export const ConfirmDeleteButton = ButtonComponent({
  async handle({ sId, uId, page, old }: PageBtnProps & { sId: string; old: boolean }) {
    try {
      if (old) {
        await prisma.oldModerationStrikes.delete({ where: { id: sId } });

        await fetchWithCache(
          `strikes:${this.guildId}`,
          () =>
            prisma.oldModerationStrikes.findMany({
              where: { serverId: this.guildId },
            }),
          true,
        );
      } else {
        await prisma.moderationEntry.delete({ where: { id: sId } });

        await fetchWithCache(
          `mod_history:${this.guildId}`,
          () =>
            prisma.moderationEntry.findMany({
              where: { guildId: this.guildId },
            }),
          true,
        );
      }

      await this.update(await renderModlogs.call(this, page, { uId }));
    } catch (e) {
      UnknownError(this, e);
    }
  },
});
