import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { StudyScreen } from '../src/screens/study-screen';
import type { InspectCategory, InspectSubCategory } from '../src/use-cases/build-inspect-queue';

export default function StudyRoute(): ReactElement {
  const params = useLocalSearchParams<{
    packId?: string | string[];
    knowledgeId?: string | string[];
    inspect?: string | string[];
    localDate?: string | string[];
    category?: string | string[];
    subCategory?: string | string[];
    index?: string | string[];
  }>();

  const readParam = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value;

  const packId = readParam(params.packId);
  const knowledgeId = readParam(params.knowledgeId);
  const inspect = readParam(params.inspect) === '1';
  const localDate = readParam(params.localDate);
  const category = readParam(params.category) as InspectCategory | undefined;
  const subCategory = readParam(params.subCategory) as InspectSubCategory | undefined;
  const indexRaw = readParam(params.index);
  const index = indexRaw ? Number.parseInt(indexRaw, 10) : 0;

  if (!packId) {
    return <Redirect href="/library" />;
  }

  const inspectConfig =
    inspect && localDate && category && subCategory
      ? { localDate, category, subCategory, initialIndex: Number.isFinite(index) ? index : 0 }
      : null;

  return (
    <StudyScreen
      inspect={inspectConfig}
      knowledgeId={knowledgeId ?? null}
      packId={packId}
    />
  );
}
