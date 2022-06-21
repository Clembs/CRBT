import { db } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ChatCommand } from 'purplet';
import { RawServerJoin, renderJoinLeave } from './shared';

export default ChatCommand({
  name: 'welcome message',
  description: t('en-US', 'JOIN_MESSAGE_DESCRIPTION'),
  async handle() {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!this.memberPermissions.has(PermissionFlagsBits.Administrator, true)) {
      return this.reply(CRBTError(t('en-US', 'ERROR_ADMIN_ONLY')));
    }

    const data = (await db.servers.findFirst({
      where: { id: this.guildId },
      select: { joinMessage: true },
    })) as RawServerJoin;

    await this.reply(await renderJoinLeave('JOIN_MESSAGE', data?.joinMessage, this.locale));
  },
});
