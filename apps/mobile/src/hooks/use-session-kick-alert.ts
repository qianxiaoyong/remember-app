import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { consumeSessionKickAlertPending } from '../data/session/session-store';

const KICK_ALERT_TITLE = '账号已在其他设备登录';
const KICK_ALERT_MESSAGE = '进度仅保存在本机。重新登录可恢复云端同步。';

export function useSessionKickAlert(isNotMainDevice: boolean): void {
  const shownRef = useRef(false);

  useEffect(() => {
    if (!isNotMainDevice || shownRef.current) {
      return;
    }

    void (async () => {
      const pending = await consumeSessionKickAlertPending();
      if (!pending) {
        return;
      }
      shownRef.current = true;
      Alert.alert(KICK_ALERT_TITLE, KICK_ALERT_MESSAGE);
    })();
  }, [isNotMainDevice]);
}
