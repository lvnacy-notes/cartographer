import { PublicationDashboard } from './PublicationDashboard';
import {
    sampleLibrary,
    sampleSchema,
    sampleWorks
} from '../../.storybook/fixtures';
import { buildCatalogItemFromData } from '../types';

export default {
  title: 'Cartographer/PublicationDashboard',
  component: PublicationDashboard,
};

// Convert sampleWorks to CatalogItem[] for the story
const items = Object.entries(sampleWorks).map(([id, data]) =>
  buildCatalogItemFromData(data, id, `pulp-fiction/works/${id}.md`, sampleSchema)
);

export const Scaffold = () => (
  <PublicationDashboard
    items={items}
    schema={sampleSchema}
    publicationField="publication"
    publicationName="Weird Tales"
    settings={sampleLibrary}
  />
);
