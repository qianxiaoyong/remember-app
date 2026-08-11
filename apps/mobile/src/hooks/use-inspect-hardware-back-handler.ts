import { useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';

export function useInspectHardwareBackHandler(options: {
  enabled: boolean;
  lexiconVisible: boolean;
  moreVisible: boolean;
  closeLexicon: () => void;
  setMoreVisible: (visible: boolean) => void;
  goHome: () => void;
}): void {
  useFocusEffect(
    useCallback(() => {
      if (!options.enabled) {
        return;
      }

      const onHardwareBackPress = (): boolean => {
        if (options.lexiconVisible) {
          options.closeLexicon();
          return true;
        }
        if (options.moreVisible) {
          options.setMoreVisible(false);
          return true;
        }
        options.goHome();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
      return () => {
        subscription.remove();
      };
    }, [
      options.closeLexicon,
      options.enabled,
      options.goHome,
      options.lexiconVisible,
      options.moreVisible,
      options.setMoreVisible,
    ]),
  );
}
