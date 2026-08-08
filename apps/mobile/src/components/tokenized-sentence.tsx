import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { normalizeSurfaceForm, tokenizeEnglishSentence } from '@remember/contracts';
import { colors } from '../theme/colors';

interface TokenizedSentenceProps {
  sentence: string;
  emphasisSurfaceForms?: readonly string[] | null;
  highlightSurfaceForm?: string | null;
  onTokenPress: (token: string) => void;
}

export function TokenizedSentence(props: TokenizedSentenceProps): ReactElement {
  const parts = splitSentence(props.sentence);
  const emphasisSet = new Set(props.emphasisSurfaceForms ?? []);
  const highlightSurfaceForm = props.highlightSurfaceForm ?? null;

  return (
    <View style={styles.row}>
      {parts.map((part, index) => {
        if (part.kind !== 'token') {
          return (
            <Text key={`${part.text}-${String(index)}`} style={styles.text}>
              {part.text}
            </Text>
          );
        }

        const normalized = normalizeSurfaceForm(part.text);
        const isEmphasized = normalized !== null && emphasisSet.has(normalized);
        const isHighlighted =
          !isEmphasized && highlightSurfaceForm !== null && normalized === highlightSurfaceForm;

        return (
          <Pressable
            accessibilityRole="button"
            key={`${part.text}-${String(index)}`}
            onPress={() => {
              props.onTokenPress(part.text);
            }}
            style={isHighlighted ? styles.tokenHighlightWrap : undefined}
          >
            <Text
              style={[
                styles.token,
                isEmphasized ? styles.tokenEmphasized : null,
                isHighlighted ? styles.tokenHighlighted : null,
              ]}
            >
              {part.text}
            </Text>
          </Pressable>
        );
      })}
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
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 26,
  },
  token: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
  },
  tokenEmphasized: {
    color: colors.studyRatingForgot,
    fontWeight: '700',
  },
  tokenHighlightWrap: {
    backgroundColor: colors.tokenHighlightBackground,
    borderRadius: 4,
  },
  tokenHighlighted: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
