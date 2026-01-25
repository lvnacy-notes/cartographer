import { AuthorCard } from './AuthorCard';
import {
    sampleLibrary,
    sampleSchema,
    sampleWorks
} from '../../.storybook/fixtures';
import { buildCatalogItemFromData } from '../types';

export default {
  title: 'Cartographer/AuthorCard',
  component: AuthorCard,
};

// Convert sampleWorks to CatalogItem[] for the story
const items = Object.entries(sampleWorks).map(([id, data]) =>
  buildCatalogItemFromData(data, id, `pulp-fiction/works/${id}.md`, sampleSchema)
);

export const Scaffold = () => (
  <AuthorCard
    items={items}
    schema={sampleSchema}
    authorField="authors"
    authorName="Lovecraft, Howard Phillips"
    settings={sampleLibrary}
  />
);
