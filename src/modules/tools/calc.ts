import { UnknownError } from '$lib/functions/CRBTError';
import { getColor } from '$lib/functions/getColor';
import { MessageEmbed } from 'discord.js';
import { Parser } from 'expr-eval';
import { ChatCommand, OptionBuilder } from 'purplet';

export default ChatCommand({
  name: 'calc',
  description: 'Calculate an expression.',
  options: new OptionBuilder().string('expr', 'The expression to calculate.', true),
  async handle({ expr }) {
    const math = new Parser();
    try {
      const result = math.evaluate(expr);
      await this.reply({
        embeds: [
          new MessageEmbed()
            .setAuthor({ name: expr })
            .setTitle(`= ${result}`)
            .setColor(await getColor(this.user)),
        ],
      });
    } catch (e) {
      await this.reply(UnknownError(this, String(e)));
    }
  },
});
