import { cache } from '$lib/cache';
import { CRBTError } from '$lib/functions/CRBTError';
import { parseCRBTscript } from '$lib/functions/parseCRBTscript';
import { t } from '$lib/language';
import { MessageBuilderData, MessageBuilderTypes } from '$lib/types/messageBuilder';
import { ImageUrlRegex, UrlRegex } from '$lib/util/regex';
import { GuildMember } from 'discord.js';
import { ModalComponent } from 'purplet';
import { MessageBuilder } from '../../components/MessageBuilder';

export const AuthorEditModal = ModalComponent({
  async handle(type: MessageBuilderTypes) {
    const name = this.fields.getTextInputValue('AUTHOR_NAME');
    const icon = this.fields.getTextInputValue('AUTHOR_ICON');
    const url = this.fields.getTextInputValue('AUTHOR_URL');

    const data = cache.get<MessageBuilderData>(`${type}_BUILDER:${this.guildId}`);

    const parsedIcon =
      type === MessageBuilderTypes.rolePicker
        ? icon
        : icon
        ? parseCRBTscript(icon, {
            channel: this.channel,
            member: this.member as GuildMember,
          })
        : null;

    if (parsedIcon && !parsedIcon.match(ImageUrlRegex)) {
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_URL')));
    }
    if (url && !url.match(UrlRegex)) {
      return this.reply(CRBTError(t(this, 'ERROR_INVALID_URL')));
    }

    data.embed = {
      ...data.embed,
      author: {
        name,
        icon_url: icon,
        url,
      },
    };

    const builder = MessageBuilder({
      data,
      interaction: this,
    });

    await this.update(builder);
  },
});
