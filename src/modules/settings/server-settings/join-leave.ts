import { emojis } from '$lib/env';
import { icon } from '$lib/env/emojis';
import { deepMerge } from '$lib/functions/deepMerge';
import { t } from '$lib/language';
import {
  CamelCaseGuildFeatures,
  EditableGuildFeatures,
  SettingsMenus,
} from '$lib/types/guild-settings';
import { JoinLeaveData } from '$lib/types/messageBuilder';
import { channelMention } from '@purplet/utils';
import { ChannelType } from 'discord-api-types/v10';
import { MessageSelectMenu } from 'discord.js';
import { ButtonComponent, components, OnEvent, row } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';
import { defaultMessage, renderJoinLeavePreview } from '../../joinLeave/renderers';
import { RawServerJoin, RawServerLeave } from '../../joinLeave/types';
import { renderFeatureSettings } from './settings';
import { getGuildSettings, saveServerSettings } from './_helpers';

export const joinLeaveSettings: SettingsMenus = {
  getOverviewValue({ feature, settings, i, isEnabled }) {
    const channelId =
      settings[feature === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];

    return {
      value: channelMention(channelId),
    };
  },
  getErrors({ guild, settings, feature, i }) {
    const isEnabled = settings.modules[CamelCaseGuildFeatures[feature]];
    const channelId =
      settings[feature === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = guild.channels.cache.get(channelId);

    const errors: string[] = [];

    if (isEnabled && channelId && !channel) {
      errors.push(t(i, 'SETTINGS_ERROR_CHANNEL_NOT_FOUND'));
    }
    if (isEnabled && !channelId) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }
    if (isEnabled && !settings[CamelCaseGuildFeatures[feature]]) {
      errors.push(t(i, 'SETTINGS_ERROR_CONFIG_NOT_DONE'));
    }

    return errors;
  },
  getMenuDescription({ settings, feature, isEnabled, i }) {
    const channelId =
      settings[feature === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];

    return {
      fields: [
        {
          name: t(i, 'STATUS'),
          value: isEnabled
            ? `${icon(settings.accentColor, 'toggleon')} ${t(i, 'ENABLED')}`
            : `${emojis.toggle.off} ${t(i, 'DISABLED')}`,
        },
        ...(channelId
          ? [
              {
                name: t(i, 'CHANNEL'),
                value: `<#${channelId}>`,
                inline: true,
              },
            ]
          : []),
      ],
    };
  },
  getSelectMenu: ({ settings, feature, i, isEnabled }) => {
    const channelId =
      settings[feature === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel'];
    const channel = i.guild.channels.cache.get(channelId);

    return {
      emoji: isEnabled ? icon(settings.accentColor, 'toggleon') : emojis.toggle.off,
      description: isEnabled
        ? t(i, 'SETTINGS_SENDING_IN', {
            channel: `#${channel?.name}`,
          })
        : '',
    };
  },
  getComponents: ({ feature, toggleBtn, backBtn, isEnabled, i, errors }) =>
    components(
      row(backBtn, toggleBtn),
      row(
        new EditJoinLeaveMessageBtn(feature as never)
          .setLabel(t(i, 'EDIT_MESSAGE'))
          .setEmoji(emojis.buttons.pencil)
          .setStyle('PRIMARY')
          .setDisabled(!isEnabled),
        new TestJoinLeaveBtn(feature as never)
          .setLabel(t(i, 'PREVIEW'))
          .setStyle('SECONDARY')
          .setEmoji(emojis.buttons.preview)
          .setDisabled(!isEnabled || errors.length !== 0)
      ),
      row(
        new MessageSelectMenu()
          .setType('CHANNEL_SELECT')
          .addChannelTypes(
            ...([
              ChannelType.GuildText,
              ChannelType.GuildAnnouncement,
              ChannelType.PublicThread,
              ChannelType.PrivateThread,
            ] as number[])
          )
          .setCustomId(`${customId}${feature}`)
          .setDisabled(!isEnabled)
          .setPlaceholder(t(i, 'EDIT_CHANNEL'))
      )
    ),
};

const customId = 'h_edit_';

export const EditJoinLeaveChannelSelectMenu = OnEvent('interactionCreate', async (i) => {
  if (
    i.isChannelSelect() &&
    [EditableGuildFeatures.joinMessage, EditableGuildFeatures.leaveMessage].includes(
      i.customId.replace(customId, '') as any
    )
  ) {
    const type = i.customId.replace(customId, '') as EditableGuildFeatures;
    const channel = i.channels.first();

    const propName = type === EditableGuildFeatures.joinMessage ? 'joinChannel' : 'leaveChannel';

    await saveServerSettings(i.guildId, {
      [propName]: channel.id,
    });

    i.update(await renderFeatureSettings.call(i, type));
  }
});

export const EditJoinLeaveMessageBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getGuildSettings(this.guild.id))[
      CamelCaseGuildFeatures[type]
    ] as any as JoinLeaveData;

    const builder = MessageBuilder({
      data: {
        type,
        ...deepMerge(defaultMessage.call(this, type), data),
      },
      interaction: this,
    });

    await this.update(builder);
  },
});

export const TestJoinLeaveBtn = ButtonComponent({
  async handle(type: JoinLeaveData['type']) {
    const data = (await getGuildSettings(this.guild.id)) as any as RawServerJoin | RawServerLeave;

    await renderJoinLeavePreview.call(this, type, data);
  },
});