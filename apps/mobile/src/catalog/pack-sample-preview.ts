/** 详情页内容示例；catalog mock / 未来目录 API 下发。 */
export interface PackSamplePreview {
  headword: string;
  zh: string;
  exampleEn: string;
  /** 左侧圆标字母，缺省取 headword 首字母 */
  initial?: string;
  /** 包内试听相对路径，如 assets/audio/picture.mp3 */
  previewAudio?: string;
}
