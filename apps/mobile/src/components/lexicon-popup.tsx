import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LexiconLookupResult } from '../data/repositories/lexicon-entry-repository';

interface LexiconPopupProps {
  visible: boolean;
  entry: LexiconLookupResult | null;
  isSaved: boolean;
  audioMessage: string | null;
  onClose: () => void;
  onToggleSave: () => void;
  onPlayAudio: () => void;
}

export function LexiconPopup(props: LexiconPopupProps): ReactElement {
  const { visible, entry, isSaved, audioMessage, onClose, onToggleSave, onPlayAudio } = props;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop}>
        <Pressable accessibilityRole="none" onPress={() => undefined} style={styles.sheet}>
          {entry ? (
            <>
              <Text style={styles.word}>{entry.displayForm}</Text>
              {entry.ipa ? <Text style={styles.ipa}>{entry.ipa}</Text> : null}
              {entry.definitions.map((definition, index) => (
                <Text key={`${definition.text}-${String(index)}`} style={styles.definition}>
                  {definition.pos ? `${definition.pos} ` : ''}
                  {definition.text}
                </Text>
              ))}
              {entry.formNote ? <Text style={styles.formNote}>{entry.formNote}</Text> : null}
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={onPlayAudio}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionLabel}>发音</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={onToggleSave}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionLabel}>{isSaved ? '已收藏' : '收藏'}</Text>
                </Pressable>
              </View>
              {audioMessage ? <Text style={styles.audioMessage}>{audioMessage}</Text> : null}
            </>
          ) : (
            <Text style={styles.missing}>这个词还没有收录</Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
  },
  word: {
    color: '#171717',
    fontSize: 24,
    fontWeight: '600',
  },
  ipa: {
    color: '#737373',
    fontSize: 14,
    marginTop: 4,
  },
  definition: {
    color: '#404040',
    fontSize: 15,
    marginTop: 12,
  },
  formNote: {
    color: '#737373',
    fontSize: 13,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionLabel: {
    color: '#171717',
    fontSize: 14,
    fontWeight: '600',
  },
  audioMessage: {
    color: '#525252',
    fontSize: 13,
    marginTop: 12,
  },
  missing: {
    color: '#737373',
    fontSize: 15,
  },
});
