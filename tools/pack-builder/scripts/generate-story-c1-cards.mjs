import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../source/story-test-pack/cards.json');

/** @param {string} text */
function t(text) {
  return { kind: 'text', text };
}

/** @param {string} surface @param {string} glossZh @param {'high'|'mid'|'low'} tier @param {string} [vocabId] */
function w(surface, glossZh, tier, vocabId = surface.toLowerCase()) {
  return { kind: 'word', surface, glossZh, tier, vocabId };
}

const sidebar = [
  { vocabId: 'happy', headword: 'happy', ipa: '/ˈhæpi/', pos: 'adj.', definitionZh: '高兴的；快乐的', tier: 'high' },
  { vocabId: 'look', headword: 'look', ipa: '/lʊk/', pos: 'v.', definitionZh: '看；寻找', tier: 'high' },
  { vocabId: 'find', headword: 'find', ipa: '/faɪnd/', pos: 'v.', definitionZh: '找到', tier: 'high' },
  { vocabId: 'many', headword: 'many', ipa: '/ˈmeni/', pos: 'adj.', definitionZh: '许多', tier: 'high' },
  { vocabId: 'old', headword: 'old', ipa: '/əʊld/', pos: 'adj.', definitionZh: '老的', tier: 'high' },
  { vocabId: 'small', headword: 'small', ipa: '/smɔːl/', pos: 'adj.', definitionZh: '小的', tier: 'high' },
  { vocabId: 'big', headword: 'big', ipa: '/bɪɡ/', pos: 'adj.', definitionZh: '大的', tier: 'high' },
  { vocabId: 'come', headword: 'come', ipa: '/kʌm/', pos: 'v.', definitionZh: '来；来到', tier: 'high' },
  { vocabId: 'say', headword: 'say', ipa: '/seɪ/', pos: 'v.', definitionZh: '说', tier: 'high' },
  { vocabId: 'like', headword: 'like', ipa: '/laɪk/', pos: 'v.', definitionZh: '喜欢', tier: 'high' },
  { vocabId: 'think', headword: 'think', ipa: '/θɪŋk/', pos: 'v.', definitionZh: '想；认为', tier: 'high' },
  { vocabId: 'have', headword: 'have', ipa: '/hæv/', pos: 'v.', definitionZh: '有', tier: 'high' },
  { vocabId: 'make', headword: 'make', ipa: '/meɪk/', pos: 'v.', definitionZh: '做；制作', tier: 'high' },
  { vocabId: 'put', headword: 'put', ipa: '/pʊt/', pos: 'v.', definitionZh: '放', tier: 'high' },
  { vocabId: 'only', headword: 'only', ipa: '/ˈəʊnli/', pos: 'adv.', definitionZh: '只有；仅仅', tier: 'high' },
  { vocabId: 'ask', headword: 'ask', ipa: '/ɑːsk/', pos: 'v.', definitionZh: '问', tier: 'high' },
  { vocabId: 'take', headword: 'take', ipa: '/teɪk/', pos: 'v.', definitionZh: '带；拿', tier: 'high' },
  { vocabId: 'now', headword: 'now', ipa: '/naʊ/', pos: 'adv.', definitionZh: '现在', tier: 'high' },
  { vocabId: 'not', headword: 'not', ipa: '/nɒt/', pos: 'adv.', definitionZh: '不', tier: 'mid' },
  { vocabId: 'meet', headword: 'meet', ipa: '/miːt/', pos: 'v.', definitionZh: '遇见', tier: 'mid' },
  { vocabId: 'beautiful', headword: 'beautiful', ipa: '/ˈbjuːtɪfl/', pos: 'adj.', definitionZh: '漂亮的', tier: 'mid' },
  { vocabId: 'girl', headword: 'girl', ipa: '/ɡɜːl/', pos: 'n.', definitionZh: '女孩', tier: 'mid' },
  { vocabId: 'rain', headword: 'rain', ipa: '/reɪn/', pos: 'v.', definitionZh: '下雨', tier: 'mid' },
  { vocabId: 'bed', headword: 'bed', ipa: '/bed/', pos: 'n.', definitionZh: '床', tier: 'mid' },
  { vocabId: 'talk', headword: 'talk', ipa: '/tɔːk/', pos: 'v.', definitionZh: '说话', tier: 'mid' },
  { vocabId: 'hard', headword: 'hard', ipa: '/hɑːd/', pos: 'adj.', definitionZh: '硬的', tier: 'mid' },
  { vocabId: 'feel', headword: 'feel', ipa: '/fiːl/', pos: 'v.', definitionZh: '感觉', tier: 'mid' },
  { vocabId: 'marry', headword: 'marry', ipa: '/ˈmæri/', pos: 'v.', definitionZh: '娶；嫁', tier: 'low' },
  { vocabId: 'need', headword: 'need', ipa: '/niːd/', pos: 'v.', definitionZh: '需要', tier: 'low' },
  { vocabId: 'idea', headword: 'idea', ipa: '/aɪˈdɪə/', pos: 'n.', definitionZh: '主意', tier: 'low' },
  { vocabId: 'soft', headword: 'soft', ipa: '/sɒft/', pos: 'adj.', definitionZh: '柔软的', tier: 'low' },
  { vocabId: 'museum', headword: 'museum', ipa: '/mjuːˈziːəm/', pos: 'n.', definitionZh: '博物馆', tier: 'low' },
];

const paragraphs = [
  {
    runs: [
      t('The prince is '),
      w('not', '不', 'mid'),
      t(' '),
      w('happy', '高兴', 'high'),
      t('. He wants to '),
      w('marry', '娶', 'low'),
      t(' a princess.'),
    ],
  },
  {
    runs: [
      t('He '),
      w('looks', '寻找', 'high', 'look'),
      t(' everywhere. He cannot '),
      w('find', '找到', 'high'),
      t(' a princess.'),
    ],
  },
  {
    runs: [
      t('He '),
      w('meets', '遇见', 'mid', 'meet'),
      t(' '),
      w('many', '许多', 'high'),
      t(' princesses. Some are too '),
      w('old', '老', 'high'),
      t('. Some are too '),
      w('small', '小', 'high'),
      t(' or too '),
      w('big', '大', 'high'),
      t('. Some are '),
      w('not', '不', 'mid'),
      t(' '),
      w('beautiful', '漂亮', 'mid'),
      t('.'),
    ],
  },
  {
    runs: [
      t('One day, a '),
      w('girl', '女孩', 'mid'),
      t(' '),
      w('comes', '来到', 'high', 'come'),
      t(' to his castle. It is '),
      w('raining', '下雨', 'mid', 'rain'),
      t('.'),
    ],
  },
  {
    runs: [
      t("'I'm a princess,' she "),
      w('says', '说', 'high', 'say'),
      t(". 'I "),
      w('need', '需要', 'low'),
      t(' a '),
      w('bed', '床', 'mid'),
      t(".'"),
    ],
  },
  {
    runs: [
      t('The prince '),
      w('likes', '喜欢', 'high', 'like'),
      t(' the '),
      w('girl', '女孩', 'mid'),
      t('. But he does not '),
      w('think', '认为', 'high'),
      t(' she is a princess.'),
    ],
  },
  {
    runs: [
      t('He '),
      w('has', '有', 'high', 'have'),
      t(' an '),
      w('idea', '主意', 'low'),
      t('. The prince '),
      w('makes', '做', 'high', 'make'),
      t(' a '),
      w('bed', '床', 'mid'),
      t(' for her. He '),
      w('puts', '放', 'high', 'put'),
      t(' a pea under 23 mattresses!'),
    ],
  },
  {
    runs: [
      t('The next morning, the prince '),
      w('talks', '说话', 'mid', 'talk'),
      t(' to the '),
      w('girl', '女孩', 'mid'),
      t('.'),
    ],
  },
  {
    runs: [
      t("'I am black and blue,' she "),
      w('says', '说', 'high', 'say'),
      t(". 'Your bed is so "),
      w('hard', '硬', 'mid'),
      t(".'"),
    ],
  },
  {
    runs: [
      t('The prince '),
      w('thinks', '想', 'high', 'think'),
      t(", '"),
      w('Only', '只有', 'high', 'only'),
      t(' a princess can '),
      w('feel', '感觉', 'mid'),
      t(" the pea under those mattresses!'"),
    ],
  },
  {
    runs: [
      t("'"),
      w('Only', '只有', 'high', 'only'),
      t(' a princess is so '),
      w('soft', '柔软', 'low'),
      t(".' He "),
      w('asks', '问', 'high', 'ask'),
      t(", 'Will you "),
      w('marry', '娶', 'low'),
      t(" me?'"),
    ],
  },
  {
    runs: [
      t('The prince and his princess '),
      w('take', '带', 'high'),
      t(' the pea to a '),
      w('museum', '博物馆', 'low'),
      t('. '),
      w('Now', '现在', 'high', 'now'),
      t(' everyone can see it.'),
    ],
  },
];

const cards = [
  {
    cardType: 'story_reading',
    sortOrder: 1,
    content: {
      lesson: {
        code: 'C1',
        titleEn: 'The Princess and the Pea',
        titleZh: '公主与豌豆',
        coverImage: 'assets/images/c1.png',
        primaryAudio: 'assets/audio/c1.mp3',
      },
      story: { paragraphs },
      sidebar,
    },
  },
];

writeFileSync(outputPath, `${JSON.stringify(cards, null, 2)}\n`);
process.stdout.write(`wrote ${outputPath}\n`);
