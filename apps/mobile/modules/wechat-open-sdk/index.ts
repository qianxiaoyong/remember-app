import { requireNativeModule } from 'expo-modules-core';

export interface WechatOpenSdkNativeModule {
  assertCoreClassesLoaded(): Promise<void>;
}

export default requireNativeModule<WechatOpenSdkNativeModule>('WechatOpenSdk');
