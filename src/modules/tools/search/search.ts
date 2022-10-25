import { autocomplete as duckduckAutocomplete } from 'duck-duck-scrape';
import { ChatCommand, OptionBuilder } from 'purplet';
import { handleFeaturedSearch } from './featured';
import { searchEngines } from './_engines';

export interface SearchCmdOpts {
  site: string;
  query: string;
  anonymous?: boolean;
  page: number;
}

const choices = Object.entries(searchEngines).reduce((acc, [id, { name, emoji, hide }]) => {
  console.log(acc);
  console.log(id, name, emoji, hide);
  return {
    ...acc,
    [id]: `${emoji} ${name}`,
    // ...(hide ? { [id]: `${emoji} ${name}` } : {}),
  };
}, {});

console.log(choices);

// export default
ChatCommand({
  name: 'search',
  description: 'Search for anything in one of the provided search engines.',
  options: new OptionBuilder()
    .string('query', 'What to search for.', {
      required: true,
      async autocomplete({ query }) {
        if (query) {
          const res = await duckduckAutocomplete(query);
          return res.map((r) => ({
            name: r.phrase,
            value: r.phrase,
          }));
        } else {
          return [];
        }
      },
    })
    .string('site', 'What search engine to use for your query.', {
      choices,
    })
    .boolean('anonymous', 'Whether to show the search results as a public message.'),
  async handle(opts) {
    await this.deferReply();

    const fullOpts: SearchCmdOpts = {
      page: 1,
      query: opts.query.match(/.*:.*/) ? opts.query.split(':').at(2) : opts.query,
      anonymous: opts.anonymous || false,
      site: opts.site ?? opts.query?.split(':')?.at(1)?.trim(),
    };

    if (fullOpts.site && Object.keys(searchEngines).includes(fullOpts.site)) {
      const res = await searchEngines[opts.site].handle.call(this, fullOpts);

      return await this.editReply(res);
    }

    return this.editReply(await handleFeaturedSearch.call(this, fullOpts));
  },
});
