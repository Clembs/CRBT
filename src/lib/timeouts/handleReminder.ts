import { emojis, icons } from '$lib/db';
import { getColor } from '$lib/functions/getColor';
import { t } from '$lib/language';
import { ReminderData } from '$lib/types/timeouts';
import { Client, GuildTextBasedChannel, MessageButton, MessageEmbed } from 'discord.js';
import { components, row } from 'purplet';
import { SnoozeButton } from '../../modules/components/RemindButton';

export async function handleReminder(reminder: ReminderData, client: Client) {
  const { JUMP_TO_MSG } = t(reminder.locale, 'genericButtons');
  const { strings } = t(reminder.locale, 'remind me');
  const { data } = reminder;

  const user = await client.users.fetch(data.userId);
  const dest =
    data.destination === 'dm'
      ? user
      : ((await client.channels.fetch(data.url.split('/')[1])) as GuildTextBasedChannel);

  const unix = Math.floor(reminder.expiration.getTime() / 1000);

  const message = {
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: strings.REMINDER_TITLE,
          iconURL: icons.reminder,
        })
        .setDescription(
          strings.REMINDER_DESCRIPTION.replace('<TIME>', `<t:${unix}>`).replace(
            '<RELATIVE_TIME>',
            `<t:${unix}:R>`
          )
        )
        .addField(strings.SUBJECT, data.subject)
        .setColor(await getColor(user)),
    ],
    components: components(
      row(
        new MessageButton()
          .setStyle('LINK')
          .setLabel(JUMP_TO_MSG)
          .setURL(`https://discord.com/channels/${data.url}`),
        new SnoozeButton()
          .setStyle('SECONDARY')
          .setEmoji(emojis.reminder)
          .setLabel(strings.BUTTON_SNOOZE)
      )
    ),
  };

  try {
    await dest.send({
      allowedMentions: {
        users: [user.id],
      },
      content: data.destination !== 'dm' ? user.toString() : null,
      ...message,
    });
  } catch (e) {
    const dest = (await client.channels.fetch(data.url.split('/')[1])) as GuildTextBasedChannel;

    await dest.send({
      allowedMentions: {
        users: [user.id],
      },
      content: user.toString(),
      ...message,
    });
  }
}
