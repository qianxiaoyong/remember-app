import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { ReviewScreen } from '../../src/screens/review-screen';

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
  const category = readParam(params.category);
  const subCategory = readParam(params.subCategory);
  const indexRaw = readParam(params.index);
  const knowledgeId = readParam(params.knowledgeId);

  if (inspect && localDate && category && subCategory) {
    const query = new URLSearchParams({
      localDate,
      category,
      subCategory,
      index: indexRaw ?? '0',
    });
    if (knowledgeId) {
      query.set('knowledgeId', knowledgeId);
    }
    return <Redirect href={`/review-inspect?${query.toString()}`} />;
  }

  if (inspect) {
    return <Redirect href="/learning-calendar" />;
  }

  return <ReviewScreen />;
}
