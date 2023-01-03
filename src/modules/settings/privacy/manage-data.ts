import { prisma } from '$lib/db';
import { colors, emojis, icons } from '$lib/env';
import { MessageFlags } from 'discord-api-types/v10';
import { MessageAttachment } from 'discord.js';
import { ButtonComponent, components, row } from 'purplet';

export const ExportAllData = ButtonComponent({
  async handle() {
    const userData = await prisma.user.findFirst({
      where: { id: this.user.id },
      include: { reminders: true },
    });

    await this.reply({
      files: [
        new MessageAttachment(Buffer.from(JSON.stringify(userData, null, 2))).setName('data.json'),
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
});

export const ConfirmDataDeletion = ButtonComponent({
  async handle() {
    this.reply({
      embeds: [
        {
          author: {
            name: 'Are you sure that you want all of your data deleted forever?',
          },
          description:
            'This includes the **entirety** of your reminders, settings, badges and other data. All will be gone, **FOREVER**!',
          color: colors.red,
        },
      ],
      components: components(
        row(
          new DeleteAllData().setLabel('Yes, delete it all!').setStyle('DANGER'),
          new CancelButton().setLabel('Nevermind').setStyle('SECONDARY')
        )
      ),
      ephemeral: true,
    });
  },
});

export const CancelButton = ButtonComponent({
  async handle() {
    this.update({
      embeds: [
        {
          author: {
            name: 'Operation cancelled.',
            iconURL: icons.information,
          },
          color: colors.gray,
        },
      ],
      components: [],
    });
  },
});

export const DeleteAllData = ButtonComponent({
  async handle() {
    await prisma.user.delete({
      where: { id: this.user.id },
      include: {
        reminders: true,
      },
    });

    await this.update({
      embeds: [
        {
          title: `${emojis.success} All of your CRBT data has successfully been deleted.`,
          color: colors.success,
        },
      ],
      components: [],
    });
  },
});
