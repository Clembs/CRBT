import { colors, db, emojis, icons } from '$lib/db';
import { CRBTError } from '$lib/functions/CRBTError';
import { isValidTime, ms } from '$lib/functions/ms';
import { FullDBTimeout, setDbTimeout, TimeoutData } from '$lib/functions/setDbTimeout';
import { timeAutocomplete } from '$lib/functions/timeAutocomplete';
import { t } from '$lib/language';
import dayjs from 'dayjs';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { Message, MessageButton, MessageEmbed } from 'discord.js';
import { ButtonComponent, ChatCommand, components, OptionBuilder, row } from 'purplet';

const activeGiveaways = new Map<string, FullDBTimeout<'GIVEAWAY'>>();

export default ChatCommand({
  name: 'giveaway',
  description: 'Create a giveaway.',
  options: new OptionBuilder()
    .string('prize', 'What to giveaway.', {
      required: true,
    })
    .string('end_date', 'When to end the giveaway.', {
      autocomplete({ end_date }) {
        return timeAutocomplete(end_date, this, '2M', '20s');
      },
      required: true,
    })
    .integer('winners', 'How many people can win (up to 40).', {
      minValue: 1,
      maxValue: 40,
    }),
  async handle({ prize, end_date, winners }) {
    const { GUILD_ONLY } = t(this, 'globalErrors');

    if (!this.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return this.reply(
        CRBTError('Only managers ("Manage Server" permission) can create giveaways.')
      );
    }

    if (!this.guild) {
      return this.reply(CRBTError(GUILD_ONLY));
    }

    if (!isValidTime(end_date) && ms(end_date) > ms('1M')) {
      return this.reply(CRBTError('Invalid duration or exceeds 1 month in the future.'));
    }

    if (prize.length > 100) {
      return this.reply(CRBTError('Prize name must be under 100 characters.'));
    }
    winners = winners || 1;

    const end = dayjs().add(ms(end_date));

    const msg = await this.channel.send({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Giveaway',
            iconURL: icons.giveaway,
          })
          .setTitle(prize)
          .setDescription(`Ends <t:${end.unix()}> (<t:${end.unix()}:R>)\nHosted by ${this.user}`)
          .addField('Entrants', `0`, true)
          .addField('Winners', `${winners}`, true)
          .setColor(`#${colors.default}`),
      ],
      components: components(
        row(
          new EnterGwayButton().setStyle('PRIMARY').setEmoji(emojis.tada).setLabel('Enter'),
          new GwayOptionsButton(this.user.id).setEmoji(emojis.buttons.menu).setStyle('SECONDARY')
        )
      ),
    });

    setDbTimeout({
      id: `${this.channel.id}/${msg.id}`,
      type: 'GIVEAWAY',
      expiration: end.toDate(),
      locale: this.guildLocale,
      data: {
        creatorId: this.user.id,
        participants: [],
      },
    });
  },
});

async function getGiveawayData(id: string) {
  return (
    activeGiveaways.get(id) ??
    ((await db.timeouts.findFirst({
      where: { id },
    })) as FullDBTimeout<'GIVEAWAY'>)
  );
}

export const GwayOptionsButton = ButtonComponent({
  async handle(creatorId: string) {
    const { strings } = t(this, 'poll');

    if (
      this.user.id === creatorId &&
      !this.memberPermissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return this.reply(
        CRBTError('Only managers ("Manage Server" permission) can manage this giveaway.')
      );
    }

    const gwayData = await getGiveawayData(`${this.channelId}/${this.message.id}`);

    await this.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'CRBT Giveaway • Data and Options',
          })
          .addField(
            `Entrants (${gwayData.data.participants.length})`,
            gwayData.data.participants.map((id) => `<@${id}>`).join(', ') || 'None'
          )
          .setFooter({
            text: strings.POLL_DATA_FOOTER,
          })
          .setColor(`#${colors.default}`),
      ],
      components: components(
        row(
          new EndGwayButton(this.message.id)
            .setLabel('End Giveaway')
            .setEmoji(emojis.buttons.cross)
            .setStyle('DANGER')
        )
      ),
      ephemeral: true,
    });
  },
});

export const EndGwayButton = ButtonComponent({
  async handle(msgId: string) {
    const gwayData = await getGiveawayData(`${this.channelId}/${msgId}`);

    if (gwayData) {
      const msg = await this.channel.messages.fetch(msgId);
      await endGiveaway(gwayData.data, msg, this.guildLocale);
    }

    await this.update({
      embeds: [
        new MessageEmbed()
          .setAuthor({
            name: 'Ended Giveaway',
            iconURL: icons.success,
          })
          .setColor(`#${colors.success}`),
      ],
      components: [],
    });
  },
});

export const EnterGwayButton = ButtonComponent({
  async handle() {
    const gwayData = await getGiveawayData(`${this.channelId}/${this.message.id}`);
    const participants = gwayData.data.participants;

    if (participants.includes(this.user.id)) {
      return this.reply(CRBTError('You have already entered this giveaway.'));
    }

    participants.push(this.user.id);

    (await db.timeouts.update({
      where: { id: gwayData.id },
      data: { data: { ...gwayData.data, participants } },
    })) as FullDBTimeout<'GIVEAWAY'>;

    this.update({
      embeds: [
        new MessageEmbed({
          ...this.message.embeds[0],
          fields: [],
        })
          .addField(
            this.message.embeds[0].fields[0].name,
            this.message.embeds[0].fields[0].value.replace(
              /\d+/,
              (match) => `${parseInt(match) + 1}`
            ),
            true
          )
          .addField(
            this.message.embeds[0].fields[1].name,
            this.message.embeds[0].fields[1].value,
            true
          ),
      ],
    });
  },
});

export const endGiveaway = async (
  gwayData: TimeoutData['GIVEAWAY'],
  gwayMsg: Message,
  locale: string
) => {
  const { JUMP_TO_MSG } = t(locale, 'genericButtons');
  const winnersAmount = Number(gwayMsg.embeds[0].fields[1].value);

  const winners = gwayData.participants.sort(() => 0.5 - Math.random()).slice(0, winnersAmount);
  const prize = gwayMsg.embeds[0].title;

  await gwayMsg.edit({
    embeds: [
      new MessageEmbed({
        ...gwayMsg.embeds[0],
      })
        .setAuthor({
          name: 'Giveaway Ended',
          iconURL: icons.giveaway,
        })
        .setDescription(
          `Ended <t:${dayjs().unix()}> (<t:${dayjs().unix()}:R>)\n${
            winners.length === 1
              ? `Winner: <@${winners[0]}>`
              : `Winners: ${winners.map((id) => `<@${id}>`).join(', ')}`
          }\n${gwayMsg.embeds[0].description.split('\n').at(-1)}`
        )
        .setColor(`#${colors.gray}`),
    ],
    components: [],
  });

  await db.timeouts.delete({
    where: { id: `${gwayMsg.channelId}/${gwayMsg.id}` },
  });

  activeGiveaways.delete(`${gwayMsg.channelId}/${gwayMsg.id}`);

  await gwayMsg.reply({
    allowedMentions: {
      users: winners,
    },
    content: winners.map((id) => `<@${id}>`).join(' '),
    embeds: [
      new MessageEmbed()
        .setAuthor({
          name: 'Congratulations!',
          iconURL: icons.giveaway,
        })
        .setDescription(`${winners.map((id) => `<@${id}>`).join(', ')} won **${prize}**!`)
        .setColor(`#${colors.success}`),
    ],
    components: components(
      row(new MessageButton().setStyle('LINK').setURL(gwayMsg.url).setLabel(JUMP_TO_MSG))
    ),
  });
};