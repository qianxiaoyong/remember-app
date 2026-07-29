import type { ReactElement } from 'react';
import { StyleSheet, Text, type TextStyle } from 'react-native';
import { colors } from '../../theme/colors';

interface HighlightedTextProps {
  keyword: string;
  numberOfLines?: number;
  style?: TextStyle;
  text: string;
}

function splitByKeyword(text: string, keyword: string): { highlight: boolean; text: string }[] {
  const normalizedKeyword = keyword.trim();
  if (!normalizedKeyword) {
    return [{ highlight: false, text }];
  }

  const lowerText = text.toLowerCase();
  const lowerKeyword = normalizedKeyword.toLowerCase();
  const parts: { highlight: boolean; text: string }[] = [];
  let start = 0;
  let index = lowerText.indexOf(lowerKeyword, start);

  while (index !== -1) {
    if (index > start) {
      parts.push({ highlight: false, text: text.slice(start, index) });
    }
    parts.push({
      highlight: true,
      text: text.slice(index, index + lowerKeyword.length),
    });
    start = index + lowerKeyword.length;
    index = lowerText.indexOf(lowerKeyword, start);
  }

  if (start < text.length) {
    parts.push({ highlight: false, text: text.slice(start) });
  }

  return parts.length > 0 ? parts : [{ highlight: false, text }];
}

export function HighlightedText(props: HighlightedTextProps): ReactElement {
  const parts = splitByKeyword(props.text, props.keyword);

  return (
    <Text numberOfLines={props.numberOfLines} style={props.style}>
      {parts.map((part, index) => (
        <Text
          key={`${part.text}-${String(index)}`}
          style={part.highlight ? styles.highlight : undefined}
        >
          {part.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: '#FFF3B0',
    color: colors.textPrimary,
  },
});
