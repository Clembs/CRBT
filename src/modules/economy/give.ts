import { colors, db, emojis, illustrations } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { MessageEmbed } from 'discord.js';
import fetch from 'node-fetch';
import { ChatCommand, OptionBuilder } from 'purplet';

const Pronouns = {
  unspecified: 'Their',
  hh: 'His',
  hi: 'His',
  hs: 'His',
  ht: 'His',
  ih: 'Its',
  ii: 'Its',
  is: 'Its',
  it: 'Its',
  shh: 'Her',
  sh: 'Her',
  si: 'Her',
  st: 'Her',
  th: 'Their',
  ti: 'Their',
  ts: 'Their',
  tt: 'Their',
  any: 'Their',
  other: 'Their',
  ask: 'username',
  avoid: 'username',
};

export default ChatCommand({
  name: 'give',
  description: 'Give a given amount of your Purplets to a user.',
  options: new OptionBuilder()
    .user('user', 'The user to give your Purplets to.', true)
    .integer('amount', 'The amount of Purplets you want to give.', true),
  async handle({ user, amount }) {
    if (user.bot) {
      return this.reply(CRBTError('You cannot give Purplets to a bot.'));
    }
    if (user.equals(this.user)) {
      return this.reply(CRBTError('You cannot give Purplets to yourself.'));
    }

    if (amount < 1) {
      return this.reply(CRBTError("You can't give a negative value of Purplets or... nothing."));
    }

    try {
      const userPurplets = await db.profiles.findFirst({
        where: { id: this.user.id },
        select: { purplets: true },
      });

      if (!userPurplets || !userPurplets.purplets || userPurplets.purplets < amount) {
        return this.reply(
          CRBTError("You don't have enough Purplets!", true, [
            {
              name: 'Your current balance',
              value: `**${emojis.purplet} ${userPurplets.purplets} Purplets**`,
              inline: true,
            },
            {
              name: 'Purplets missing',
              value: `**${emojis.purplet} ${amount - userPurplets.purplets} Purplets**`,
              inline: true,
            },
          ])
        );
      }

      const targetUserPurplets = await db.profiles.upsert({
        where: { id: user.id },
        update: { purplets: { increment: amount } },
        create: { id: user.id, purplets: amount },
      });

      await db.profiles.update({
        data: { purplets: { increment: amount } },
        where: { id: this.user.id },
      });

      const pronouns = (
        (await fetch(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`).then(
          (res) => res.json()
        )) as { pronouns: string }
      ).pronouns;

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: 'Purplets transfer',
              iconURL: illustrations.success,
            })
            .setDescription(
              `You successfully gave ${emojis.purplet} **${amount} Purplets** to ${user}.`
            )
            .addField(
              'Your balance',
              `Previous: **${emojis.purplet} ${userPurplets.purplets - amount}**\nNew: **${
                emojis.purplet
              } ${userPurplets.purplets}**`,
              true
            )
            .addField(
              `${Pronouns[pronouns].replace('username', user.username)} balance`,
              `Previous: **${emojis.purplet} ${targetUserPurplets.purplets - amount}**\nNew: **${
                emojis.purplet
              } ${targetUserPurplets.purplets}**`,
              true
            )
            .setColor(`#${colors.success}`),
        ],
      });
    } catch (error) {
      this.reply(UnknownError(this, String(error)));
    }
  },
});
