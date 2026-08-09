import type { ReactElement } from 'react';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { StudyScreen } from '../src/screens/study-screen';

export default function StudyRoute(): ReactElement {
  const params = useLocalSearchParams<{
    packId?: string | string[];
    knowledgeId?: string | string[];
  }>();
  const rawPackId = params.packId;
  const rawKnowledgeId = params.knowledgeId;
  const packId = Array.isArray(rawPackId) ? rawPackId[0] : rawPackId;
  const knowledgeId = Array.isArray(rawKnowledgeId) ? rawKnowledgeId[0] : rawKnowledgeId;
  if (!packId) {
    return <Redirect href="/library" />;
  }
  return <StudyScreen knowledgeId={knowledgeId ?? null} packId={packId} />;
}
