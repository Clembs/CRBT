import { colors, db, icons } from '$lib/db';
import { CRBTError, UnknownError } from '$lib/functions/CRBTError';
import { ms } from '$lib/functions/ms';
import { resolveToDate } from '$lib/functions/resolveToDate';
import { setDbTimeout } from '$lib/functions/setDbTimeout';
import { timeAutocomplete } from '$lib/functions/timeAutocomplete';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import { ChannelType } from 'discord-api-types/v10';
import {
  GuildTextBasedChannel,
  Message,
  MessageButton,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { ChatCommand, components, OptionBuilder, row } from 'purplet';

const { meta } = t('en-US', 'remind me');

export default ChatCommand({
  name: 'reminder new',
  description: meta.description,
  options: new OptionBuilder()
    .string('when', meta.options[0].description, {
      autocomplete({ when }) {
        return timeAutocomplete(when, this, '2y');
      },
      required: true,
    })
    .string('subject', meta.options[1].description, { required: true })
    .channel('destination', meta.options[2].description, {
      channelTypes: [ChannelType.GuildText, ChannelType.GuildNews],
    }),
  async handle({ when, subject, destination }) {
    const { strings, errors } = t(this, 'remind me');

    dayjs.locale(this.locale);

    if (subject.length > 120) {
      return this.reply(CRBTError(errors.SUBJECT_MAX_LENGTH));
    }

    const now = dayjs();
    // const w = when
    //   .trim()
    //   .replaceAll(keywords.AND, '')
    //   .replace(keywords.AT, '')
    //   .replace(keywords.ON, '')
    //   .replace(keywords.IN, '')
    //   .trim()
    //   .replaceAll('  ', ' ');

    // // console.log(w);
    // let expiration: Dayjs;
    // let timeMS: number;

    // if (
    //   w.trim().toLowerCase().startsWith(keywords.TODAY) ||
    //   when.trim().toLowerCase().startsWith(keywords.AT)
    // ) {
    //   const time = w.split(' ').length === 1 ? null : w.split(' ').slice(1).join('');
    //   expiration = time
    //     ? dayjs(`${now.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
    //     : now.add(30, 'm');
    //   timeMS = expiration.diff(now);
    // }
    // if (w.trim().toLowerCase().startsWith(keywords.TOMORROW)) {
    //   const tomorrow = now.add(1, 'day');
    //   const time = w.split(' ').length === 1 ? null : w.split(' ').slice(1).join('');
    //   // console.log(time);
    //   expiration = !!time
    //     ? dayjs(`${tomorrow.format('YYYY-MM-DD')}T${convertTime12to24(time)}Z`)
    //     : tomorrow;
    //   // console.log(expiration);
    //   timeMS = tomorrow.diff(now);
    // }

    // if (!ms(w) && dayjs(w).isValid()) {
    //   if (dayjs(w).isAfter(now)) {
    //     expiration = dayjs(w);
    //     timeMS = expiration.diff(now);
    //   } else {
    //     return this.reply(CRBTError(errors.PAST));
    //   }
    // } else if (!!ms(w) && !dayjs(w).isValid()) {
    //   timeMS = ms(w);
    //   expiration = now.add(timeMS, 'ms');
    // }

    let expiration: dayjs.Dayjs;

    try {
      expiration = await resolveToDate(when, this.locale);
    } catch (e) {
      return this.reply(CRBTError(errors.INVALID_FORMAT));
    }

    if (expiration.isAfter(now.add(ms('2y')))) {
      return this.reply(CRBTError(errors.TOO_LONG));
    }

    if (destination) {
      const channel = destination as GuildTextBasedChannel;
      if (!channel) {
        return this.reply(CRBTError(errors.INVALID_CHANNEL_TYPE));
      } else if (!channel.permissionsFor(this.user).has('SEND_MESSAGES')) {
        return this.reply(CRBTError(errors.USER_MISSING_PERMS));
      } else if (!channel.permissionsFor(this.guild.me).has('SEND_MESSAGES')) {
        return this.reply(CRBTError(errors.BOT_MISSING_PERMS));
      }
    }
    const userReminders = (
      await db.timeouts.findMany({
        where: { type: 'REMINDER' },
      })
    ).filter((r) => (r.data as any).userId === this.user.id);

    if (userReminders.length >= 5) {
      return this.reply(CRBTError(errors.REMINDERS_MAX_LIMIT));
    }

    await this.deferReply();

    const expUnix = expiration.unix();

    const msg = await this.fetchReply();
    const url =
      msg instanceof Message
        ? `${msg.guildId ?? '@me'}/${msg.channelId}/${msg.id}`
        : `${msg.guild_id ?? '@me'}/${msg.channel_id}/${msg.id}`;

    try {
      await setDbTimeout({
        id: url,
        type: 'REMINDER',
        expiration: expiration.toDate(),
        data: {
          destination: destination ? destination.id : 'dm',
          userId: this.user.id,
          subject,
          url,
        },
        locale: this.locale,
      });

      await this.editReply({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: strings.SUCCESS_TITLE,
              iconURL: icons.success,
            })
            .setDescription(
              (destination
                ? strings.SUCCESS_CHANNEL.replace('<CHANNEL>', `${destination}`)
                : strings.SUCCESS_DM) +
                `\n` +
                (expiration.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')
                  ? strings.TODAY_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : expiration.format('YYYY-MM-DD') === now.add(1, 'day').format('YYYY-MM-DD')
                  ? strings.TOMORROW_AT.replace('<TIME>', `<t:${expUnix}:T> • <t:${expUnix}:R>`)
                  : `<t:${expUnix}> • <t:${expUnix}:R>.`)
            )
            .addField(strings.SUBJECT, subject)
            .setColor(`#${colors.success}`),
        ],
        components: components(
          row(
            new MessageButton()
              .setStyle('LINK')
              .setLabel(strings.BUTTON_GCALENDAR)
              .setURL(
                `https://calendar.google.com/calendar/render?${new URLSearchParams({
                  action: 'TEMPLATE',
                  text: subject,
                  dates: `${expiration.format('YYYYMMDD')}/${expiration
                    .add(1, 'day')
                    .format('YYYYMMDD')}`,
                  details: `${strings.GCALENDAR_EVENT} ${
                    destination && destination?.isText()
                      ? strings.GCALENDAR_EVENT_CHANNEL.replace(
                          '<CHANNEL>',
                          `#${(destination as TextChannel).name}`
                        ).replace('<SERVER>', (destination as TextChannel).guild.name)
                      : strings.GCALENDAR_EVENT_DM
                  }`,
                  location: ((await this.fetchReply()) as Message).url,
                })}`
              )
          )
        ),
      });
    } catch (error) {
      await this.editReply(UnknownError(this, String(error)));
    }
  },
});