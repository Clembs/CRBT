import { prisma } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { JoinLeaveData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import {
  CommandInteraction,
  GuildMember,
  Interaction,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { components, row } from 'purplet';
import { MessageBuilder } from '../components/MessageBuilder';
import { parseCRBTscriptInMessage } from '../components/MessageBuilder/parseCRBTscriptInMessage';
import { RawServerJoin, RawServerLeave, resolveMsgType } from './types';

export async function defaultMessage(this: Interaction, type: JoinLeaveData['type']) {
  return {
    embed: {
      title: t(this.guildLocale, `${type}_DEFAULT_TITLE`),
      description: t(this.guildLocale, 'JOINLEAVE_MESSAGE_DEFAULT_DESCRIPTION').replace(
        '<TYPE>',
        t(this.guildLocale, type)
      ),
      color: await getColor(this.guild),
    },
  };
}

export async function renderJoinLeavePrebuilder(
  this: CommandInteraction,
  type: JoinLeaveData['type']
) {
  if (!hasPerms(this.memberPermissions, PermissionFlagsBits.Administrator, true)) {
    return CRBTError(this, t(this.locale, 'ERROR_ADMIN_ONLY'));
  }

  const data = ((await prisma.servers.findFirst({
    where: { id: this.guildId },
    select: { [resolveMsgType[type]]: true },
  })) || {
    [resolveMsgType[type]]: await defaultMessage.call(this, type),
  }) as typeof type extends MessageBuilderTypes.joinMessage ? RawServerJoin : RawServerLeave;

  const builder = MessageBuilder({
    data: {
      ...data[resolveMsgType[type]],
      type,
    },
    interaction: this,
  });

  await this.reply(builder);
}

export async function renderJoinLeavePreview(
  this: CommandInteraction,
  type: 'JOIN_MESSAGE' | 'LEAVE_MESSAGE',
  data: RawServerJoin | RawServerLeave
) {
  const { JUMP_TO_MSG } = t(this, 'genericButtons');

  const message: JoinLeaveData = data?.[resolveMsgType[type]];

  if (!data || !message) {
    return CRBTError(this, t(this, 'ERROR_NO_MESSAGE').replace('<COMMAND>', t(this, type)));
  }
  const channelId: string =
    type === MessageBuilderTypes.joinMessage ? data['joinChannel'] : data['leaveChannel'];

  if (!channelId) {
    return CRBTError(
      this,
      t(
        this,
        type === MessageBuilderTypes.joinMessage
          ? 'JOIN_PREVIEW_ERROR_NO_CHANNEL'
          : 'LEAVE_PREVIEW_ERROR_NO_CHANNEL'
      ).replace('<TYPE>', t(this, type))
    );
  }

  try {
    const channel = this.guild.channels.resolve(channelId) as TextChannel;

    const parsedMessage = parseCRBTscriptInMessage(message, {
      channel,
      member: this.member as GuildMember,
    });

    const { url } = await channel.send({
      allowedMentions: {
        users: [this.user.id],
      },
      ...(parsedMessage.content ? { content: parsedMessage.content } : {}),
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this.guildLocale, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace(
              '<TYPE>',
              t(this.guildLocale, type)
            ),
          })
          .setColor(await getColor(this.guild)),
        ...(message.embed ? [new MessageEmbed(parsedMessage.embed)] : []),
      ],
    });

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: t(this, 'JOINLEAVE_PREVIEW_EMBED_TITLE').replace('<TYPE>', t(this, type)),
            iconURL: this.guild.iconURL(),
          })
          .setDescription(
            t(this, 'JOINLEAVE_PREVIEW_EMBED_DESCRIPTION')
              .replace('<TYPE>', t(this, type))
              .replace('<CHANNEL>', channel.toString())
          )
          .setColor(await getColor(this.guild)),
      ],
      components: components(
        row(new MessageButton().setLabel(JUMP_TO_MSG).setURL(url).setStyle('LINK'))
      ),
      ephemeral: true,
    });
  } catch (e) {
    console.error(e);
    return CRBTError(
      this,
      t(this, 'JOINLEAVE_PREVIEW_ERROR_UNKNOWN').replace('<TYPE>', t(this, type))
    );
  }
}
