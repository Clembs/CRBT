import { prisma } from '$lib/db';
import { Economy, ServerMember } from '@prisma/client';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';
import { CommandInteraction, Interaction } from 'discord.js';

interface EconomyCommandMetaProps {
  singular: string;
  plural: string;
}

export interface EconomyCommand {
  getMeta({ singular, plural }: EconomyCommandMetaProps): RESTPostAPIApplicationCommandsJSONBody;
  handle(this: CommandInteraction): Promise<any>;
}

export function currencyFormat(
  user: { money: number },
  economy: Partial<Economy>,
  locale = 'en-US'
) {
  return `${economy.currencySymbol} ${user.money.toLocaleString(locale)} ${
    user.money === 1 ? economy.currencyNameSingular : economy.currencyNamePlural
  }`;
}

export async function upsertServerMember(
  i: Interaction,
  createArgs: Partial<ServerMember>,
  updateArgs?: Partial<
    Omit<ServerMember, 'workExp' | 'money'> & {
      workExp: {
        increment: number;
      };
      money: {
        increment: number;
      };
    }
  >
) {
  const id = `${i.user.id}_${i.guildId}`;

  return await prisma.serverMember.upsert({
    where: { id },
    create: {
      id,
      user: {
        connectOrCreate: {
          create: { id: i.user.id },
          where: { id: i.user.id },
        },
      },
      server: {
        connectOrCreate: {
          create: { id: i.guildId },
          where: { id: i.guildId },
        },
      },
      ...(createArgs as any),
    },
    update: updateArgs ?? createArgs,
  });
}