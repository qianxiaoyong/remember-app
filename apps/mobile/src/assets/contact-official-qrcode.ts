import type { ImageSourcePropType } from 'react-native';

// Metro 静态资源必须用 require；集中一处供展示与保存复用。
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const contactOfficialQrCodeModule =
  require('../../assets/images/contact-official-qrcode.png') as number;

export const contactOfficialQrCodeSource: ImageSourcePropType = contactOfficialQrCodeModule;
