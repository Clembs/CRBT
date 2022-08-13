import { GiveawayData } from '$lib/types/timeouts';
import { Client, TextChannel } from 'discord.js';
import { endGiveaway } from '../../modules/giveaways/giveaway';

export async function handleGiveaway(giveaway: GiveawayData, client: Client) {
  const [channelId, messageId] = giveaway.id.split('/');
  const channel = client.channels.cache.get(channelId) as TextChannel;
  const msg = channel ? await channel.messages.fetch(messageId).catch(() => null) : undefined;
  if (!msg) return;

  endGiveaway(giveaway.data, msg, giveaway.locale);
}
