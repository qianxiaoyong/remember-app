import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokenizeEnglishSentence } from '@remember/contracts';

interface TokenizedSentenceProps {
  sentence: string;
  onTokenPress: (token: string) => void;
}

export function TokenizedSentence(props: TokenizedSentenceProps): ReactElement {
  const parts = splitSentence(props.sentence);

  return (
    <View style={styles.row}>
      {parts.map((part, index) =>
        part.kind === 'token' ? (
          <Pressable
            accessibilityRole="button"
            key={`${part.text}-${String(index)}`}
            onPress={() => {
              props.onTokenPress(part.text);
            }}
          >
            <Text style={styles.token}>{part.text}</Text>
          </Pressable>
        ) : (
          <Text key={`${part.text}-${String(index)}`} style={styles.text}>
            {part.text}
          </Text>
        ),
      )}
    </View>
  );
}

interface SentencePart {
  kind: 'text' | 'token';
  text: string;
}

function splitSentence(sentence: string): SentencePart[] {
  const tokens = tokenizeEnglishSentence(sentence);
  const parts: SentencePart[] = [];
  let cursor = 0;

  for (const token of tokens) {
    const index = sentence.indexOf(token, cursor);
    if (index > cursor) {
      parts.push({ kind: 'text', text: sentence.slice(cursor, index) });
    }
    if (index >= 0) {
      parts.push({ kind: 'token', text: token });
      cursor = index + token.length;
    }
  }

  if (cursor < sentence.length) {
    parts.push({ kind: 'text', text: sentence.slice(cursor) });
  }

  return parts.length > 0 ? parts : [{ kind: 'text', text: sentence }];
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    color: '#404040',
    fontSize: 16,
    lineHeight: 26,
  },
  token: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 26,
    textDecorationLine: 'underline',
  },
});
