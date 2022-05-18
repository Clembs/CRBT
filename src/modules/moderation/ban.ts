import { colors, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { createCRBTmsg } from '$lib/functions/sendCRBTmsg';
import { getStrings } from '$lib/language';
import { GuildMember, MessageEmbed } from 'discord.js';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'ban',
  description: 'Ban a chosen user from this server.',
  options: new OptionBuilder()
    .user('user', 'The user to ban.', { required: true })
    .string('reason', 'The reason for the ban.')
    .integer('delete_messages', 'The number of messages to delete.')
    .string('duration', 'Temporarily ban the user for a specified time.', {
      choices: {
        '1h': '1 hour',
        '1d': '1 day',
        '1w': '1 week',
        '1m': '1 month',
      },
    }),
  async handle({ user, reason, delete_messages, duration }) {
    const { GUILD_ONLY } = getStrings(this.locale, 'globalErrors');

    if (this.channel.type !== 'DM') {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has('BAN_MEMBERS')) {
      return this.reply(CRBTError('You do not have permission to ban members.'));
    }
    if (!this.guild.me.permissions.has('BAN_MEMBERS')) {
      return this.reply(CRBTError('I do not have permission to ban members.'));
    }
    if (this.user.id === user.id) {
      return this.reply(CRBTError('You cannot ban yourself! (╯°□°）╯︵ ┻━┻'));
    }
    if (!this.guild.members.cache.has(user.id)) {
      return this.reply(CRBTError('The user is not in this server.'));
    }
    const member = this.guild.members.cache.get(user.id);
    if (!member.bannable) {
      return this.reply(CRBTError('You cannot ban this user.'));
    }
    if (this.guild.ownerId === user.id) {
      return this.reply(CRBTError('You cannot ban the owner of the server.'));
    }
    if (
      this.user.id !== this.guild.ownerId &&
      (this.member as GuildMember).roles.highest.comparePositionTo(member.roles.highest) <= 0
    ) {
      return this.reply(CRBTError('You cannot ban a user with a higher role than you.'));
    }

    try {
      await member.ban({
        days: delete_messages,
        reason,
      });

      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: `Successfully banned ${user.tag}`,
              iconURL: icons.success,
            })
            .setColor(`#${colors.success}`),
        ],
      });

      await user
        .send({
          embeds: [
            createCRBTmsg({
              type: 'moderation',
              user: this.user,
              subject: `Banned from ${this.guild.name}`,
              message: reason,
              guildName: this.guild.name,
            }).setColor(`#${colors.error}`),
          ],
        })
        .catch((e) => {});
    } catch (e) {
      return this.reply(UnknownError(this, String(e)));
    }
  },
});
