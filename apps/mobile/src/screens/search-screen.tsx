import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { rejoinCardReview } from '../use-cases/rejoin-card-review';
import { searchPackCardsUseCase } from '../use-cases/search-pack-cards';

const TEST_PACK_ID = 'remember-test-pack';

export function SearchScreen(): ReactElement {
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    try {
      return searchPackCardsUseCase(TEST_PACK_ID, query);
    } catch {
      return [];
    }
  }, [query]);

  const handleRejoin = (knowledgeId: string, headword: string): void => {
    try {
      const result = rejoinCardReview({ packId: TEST_PACK_ID, knowledgeId });
      if (result.alreadyPending) {
        setMessage(`${headword} 已在当前任务队列中`);
        return;
      }
      if (result.addedToQueue) {
        setMessage(`${headword} 已重新加入复习`);
        return;
      }
      setMessage(`${headword} 已设为到期复习`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '加入复习失败');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Link asChild href="/">
        <Pressable accessibilityRole="button">
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
      </Link>
      <Text style={styles.title}>搜索当前知识库</Text>
      <TextInput
        onChangeText={setQuery}
        placeholder="输入单词或短语"
        style={styles.input}
        value={query}
      />
      {results.map((card) => (
        <View key={card.knowledgeId} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.headword}>{card.headword}</Text>
            <Text style={styles.definition}>{card.content.reveal.definitions[0]?.text ?? ''}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              handleRejoin(card.knowledgeId, card.headword);
            }}
            style={styles.rejoinButton}
          >
            <Text style={styles.rejoinLabel}>加入复习</Text>
          </Pressable>
        </View>
      ))}
      {query.trim() && results.length === 0 ? (
        <Text style={styles.empty}>没有找到匹配内容</Text>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    flexGrow: 1,
    padding: 24,
    paddingTop: 64,
  },
  back: {
    color: '#2563EB',
    fontSize: 14,
    marginBottom: 16,
  },
  title: {
    color: '#171717',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    alignItems: 'center',
    borderColor: '#E5E5E5',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  rowText: {
    flex: 1,
  },
  headword: {
    color: '#171717',
    fontSize: 16,
    fontWeight: '600',
  },
  definition: {
    color: '#737373',
    fontSize: 13,
    marginTop: 4,
  },
  rejoinButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rejoinLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  empty: {
    color: '#737373',
    fontSize: 14,
  },
  message: {
    color: '#404040',
    fontSize: 14,
    marginTop: 16,
  },
});
