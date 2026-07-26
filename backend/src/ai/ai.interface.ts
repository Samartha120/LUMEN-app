import { BoundingBox, PredictionMetadata } from './ai.types';

export interface FastApiPredictionResponse {
  damageClass: string;
  confidenceScore: number;
  boundingBoxes: BoundingBox[];
  metadata: PredictionMetadata;
}
