import { z } from 'zod';
import { introMediaItemSchema } from './intro-media.js';
import { catalogPackSummarySchema } from './pack-summary.js';
import { packSamplePreviewSchema } from './sample-preview.js';

export const catalogPackDetailSchema = catalogPackSummarySchema
  .extend({
    samplePreviews: z.array(packSamplePreviewSchema),
    introMedia: z.array(introMediaItemSchema).optional(),
  })
  .strict();

export type CatalogPackDetail = z.infer<typeof catalogPackDetailSchema>;
