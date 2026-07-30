/** 详情页内容示例；catalog mock / 目录 API 下发。 */
export interface PackSamplePreview {
  headword: string;
  zh: string;
  exampleEn: string;
  /** 左侧圆标字母，缺省取 headword 首字母 */
  initial?: string;
  /** bundled 包内相对路径 */
  previewAudio?: string;
  /** 公开试听 URL（目录示例） */
  previewAudioUrl?: string;
  /** 可选音标（目录扩展字段） */
  phoneticIpa?: string;
  phoneticDialect?: 'us' | 'uk';
}
