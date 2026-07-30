/** 实机联调 mock 购买：bundle 内 __DEV__ 为 false，需单独开关。 */
export function isMockPaymentEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_MOCK_PAYMENT_ENABLED?.trim().toLowerCase();
  return flag === 'true' || flag === '1';
}
