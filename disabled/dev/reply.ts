import { TextCommand } from 'purplet';
import { issueReply } from './fix';

export default TextCommand({
  name: 'reply',
  async handle([id, ...message]) {
    if (this.author.id !== '327690719085068289') return;

    const msg = await this.channel.messages.fetch(id);

    await issueReply('reply', msg, this.author, message.join(' '));
    await this.delete();
  },
});