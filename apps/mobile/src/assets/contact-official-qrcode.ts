import type { ImageSourcePropType } from 'react-native';

/* eslint-disable @typescript-eslint/no-require-imports -- Metro 静态 PNG 资源 */
export const contactOfficialQrCodeModule =
  require('../../assets/images/contact-official-qrcode.png') as number;
/* eslint-enable @typescript-eslint/no-require-imports */

export const contactOfficialQrCodeSource: ImageSourcePropType = contactOfficialQrCodeModule;
