import type { ImageSourcePropType } from 'react-native';

export interface GuideSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  /** 可选配图；后期按段插入 require(...) 或 uri 即可。 */
  image?: ImageSourcePropType;
  imageAccessibilityLabel?: string;
}

export const guideSections: readonly GuideSection[] = [
  {
    id: 'start-learning',
    title: '开始学习',
    paragraphs: [
      '在「资料」页浏览并下载学习包，安装完成后会出现在「首页」我的知识库列表。',
      '点击已安装的学习包即可进入学习；退出后会记住进度，下次可从书签继续。',
      '首页进度与包内「第 N 词」一致，最近打开的包会排在列表前面。',
    ],
  },
  {
    id: 'recall-page',
    title: '回忆页怎么用',
    paragraphs: [
      '进入单词后先看英文回忆发音和释义，再点击屏幕空白处展开答案。',
      '点顶栏单词或喇叭可播放发音；可在「基础设置」中开启回忆页自动发音并选择次数。',
      '手动点喇叭会停止自动连播，只播放一遍。',
    ],
  },
  {
    id: 'review-tab',
    title: '复习',
    paragraphs: [
      '底部 Tab「复习」会按记忆曲线安排到期单词，与学习包内回忆页使用同一套界面。',
      '回忆后点「通过」或「未通过」保存结果并进入下一张；发音与动效规则与学习页一致。',
      '可在复习页更多菜单中调整每日复习限额。',
    ],
  },
  {
    id: 'lexicon-favorites',
    title: '点词与收藏',
    paragraphs: [
      '展开答案后，例句中的英文单词可点击查看释义弹窗。',
      '弹窗内可收藏该词条；在抽屉「收藏本」中可查看已收藏的词形列表。',
    ],
  },
  {
    id: 'downloads-account',
    title: '下载与账号',
    paragraphs: [
      '抽屉「下载管理」可查看学习包下载与安装进度。',
      '「兑换码」用于激活学习包权益；登录账号后可在多设备间同步进度（需联网）。',
      '遇到问题可通过「联系我们」获取帮助。',
    ],
  },
];
