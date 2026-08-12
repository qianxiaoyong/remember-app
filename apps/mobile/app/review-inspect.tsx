import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { ReviewScreen } from '../src/screens/review-screen';
import type { InspectCategory, InspectSubCategory } from '../src/use-cases/build-inspect-queue';

export default function ReviewInspectRoute(): ReactElement {
  const params = useLocalSearchParams<{
    localDate?: string | string[];
    category?: string | string[];
    subCategory?: string | string[];
    index?: string | string[];
    knowledgeId?: string | string[];
  }>();

  const readParam = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value;

  const localDate = readParam(params.localDate);
  const category = readParam(params.category) as InspectCategory | undefined;
  const subCategory = readParam(params.subCategory) as InspectSubCategory | undefined;
  const indexRaw = readParam(params.index);
  const index = indexRaw ? Number.parseInt(indexRaw, 10) : 0;
  const knowledgeId = readParam(params.knowledgeId);

  if (!localDate || !category || !subCategory) {
    return <Redirect href="/record" />;
  }

  const inspectConfig = {
    localDate,
    category,
    subCategory,
    initialIndex: Number.isFinite(index) ? index : 0,
  };

  return <ReviewScreen inspect={inspectConfig} inspectKnowledgeId={knowledgeId ?? null} />;
}
