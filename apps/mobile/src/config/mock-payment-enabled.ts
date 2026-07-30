/** 实机联调 mock 购买：需显式开关，且非 release 正式包误开。 */
export function isMockPaymentEnabled(): boolean {
  const flag = String(process.env.EXPO_PUBLIC_MOCK_PAYMENT_ENABLED ?? '')
    .trim()
    .toLowerCase();
  if (flag !== 'true' && flag !== '1') {
    return false;
  }
  if (__DEV__) {
    return true;
  }
  return (
    String(process.env.EXPO_PUBLIC_APP_VARIANT ?? '')
      .trim()
      .toLowerCase() === 'dev'
  );
}
