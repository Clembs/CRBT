import { createCRBTError } from '$lib/functions/CRBTError';
import { hasPerms } from '$lib/functions/hasPerms';
import { t } from '$lib/language';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, User } from 'discord.js';
import { ChatCommand, OptionBuilder, UserContextCommand } from 'purplet';
import { renderModlogs } from './modlogs_all';

export default ChatCommand({
  name: 'modlogs user',
  description: 'View the moderation history for a chosen user, or yours.',
  allowInDMs: false,
  options: new OptionBuilder().user('user', 'The user to view the history of.'),
  async handle({ user }) {
    return this.reply(await viewModLogs.call(this, user));
  },
});

export const viewModLogsCtxCommand = UserContextCommand({
  name: 'View Moderation History',
  async handle(user) {
    return this.reply(await viewModLogs.call(this, user));
  },
});

async function viewModLogs(
  this: CommandInteraction | ContextMenuInteraction | ButtonInteraction,
  user: User
) {
  if (user !== this.user && !hasPerms(this.memberPermissions, PermissionFlagsBits.ManageGuild)) {
    return createCRBTError(
      this,
      t(this, 'ERROR_MISSING_PERMISSIONS').replace('<PERMISSIONS>', 'Manage Server')
    );
  }

  return renderModlogs.call(this, 0, { userId: user.id });
}
