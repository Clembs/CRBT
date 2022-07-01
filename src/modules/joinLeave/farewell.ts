import { db } from '$lib/db';
import { MessageEmbed, NewsChannel, TextChannel } from 'discord.js';
import { OnEvent } from 'purplet';
import { RawServerLeave } from './types';
import { parseCRBTscriptInMessage } from './utility/parseCRBTscriptInMessage';

export default OnEvent('guildMemberRemove', async (member) => {
  const { guild } = member;

  const preferences = await db.users.findFirst({
    where: { id: member.id },
    select: { silentLeaves: true },
  });

  if (preferences && preferences.silentLeaves) return;

  const modules = await db.serverModules.findFirst({
    where: { id: guild.id },
    select: { leaveMessage: true },
  });

  if (!modules?.leaveMessage) return;

  const serverData = (await db.servers.findFirst({
    where: { id: guild.id },
    select: { leaveChannel: true, leaveMessage: true },
  })) as RawServerLeave;

  if (!serverData) return;

  const { leaveChannel: channelId, leaveMessage: message } = serverData;

  const channel = guild.channels.cache.get(channelId) as TextChannel | NewsChannel;

  const parsedMessage = parseCRBTscriptInMessage(message, {
    channel,
    member,
  });

  channel.send({
    allowedMentions: {
      users: [member.user.id],
    },
    ...(message.content ? { content: parsedMessage.content } : {}),
    embeds: message.embed ? [new MessageEmbed(parsedMessage.embed)] : [],
  });
});
