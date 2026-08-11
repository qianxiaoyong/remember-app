import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { ReviewScreen } from '../src/screens/review-screen';
import type { InspectCategory, InspectSubCategory } from '../src/use-cases/build-inspect-queue';

export default function ReviewRoute(): ReactElement {
  const params = useLocalSearchParams<{
    inspect?: string | string[];
    localDate?: string | string[];
    category?: string | string[];
    subCategory?: string | string[];
    index?: string | string[];
    knowledgeId?: string | string[];
  }>();

  const readParam = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value;

  const inspect = readParam(params.inspect) === '1';
  const localDate = readParam(params.localDate);
  const category = readParam(params.category) as InspectCategory | undefined;
  const subCategory = readParam(params.subCategory) as InspectSubCategory | undefined;
  const indexRaw = readParam(params.index);
  const index = indexRaw ? Number.parseInt(indexRaw, 10) : 0;
  const knowledgeId = readParam(params.knowledgeId);

  if (inspect && (!localDate || !category || !subCategory)) {
    return <Redirect href="/learning-calendar" />;
  }

  const inspectConfig =
    inspect && localDate && category && subCategory
      ? { localDate, category, subCategory, initialIndex: Number.isFinite(index) ? index : 0 }
      : null;

  return <ReviewScreen inspect={inspectConfig} inspectKnowledgeId={knowledgeId ?? null} />;
}
