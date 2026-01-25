import { BackstagePassPipeline } from './BackstagePassPipeline';
import {
  sampleWorks,
  sampleSchema,
  sampleLibrary
} from '../../.storybook/fixtures';
import { buildCatalogItemFromData } from '../types/catalogItem';

export default {
  title: 'Cartographer/BackstagePassPipeline',
  component: BackstagePassPipeline,
};

// Convert sampleWorks to CatalogItem[] for the story
const items = Object.entries(sampleWorks).map(([id, data]) =>
  buildCatalogItemFromData(data, id, `pulp-fiction/works/${id}.md`, sampleSchema)
);

export const Scaffold = () => (
  <BackstagePassPipeline
    items={items}
    schema={sampleSchema}
    pipelineConfig={sampleLibrary.dashboards?.backstagePassPipeline || { stages: [], enabled: true }}
    settings={sampleLibrary}
  />
);
