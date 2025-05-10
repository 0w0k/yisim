import Localization from './Localization.json';

export let cn = {
  'Yi Xian Simulator': '弈仙牌模拟器',
  'Cultivation': '修为',
  'HP': '生命',
  'Physique': '体魄',
  'Result:': '结果：',
  'turn': '回合',
  'begins': '开始',
  'player': '玩家',
  'is playing': '打出',
  'level': '等级',
  'reduced': '减少',
  'hp': '生命',
  'by': ' ',
  'to': '至',
  'damage': '伤害',
  'incremented': '增加',
  'cloud sword chain count': '云剑计数',
  'finished playing': '打完',
  'ends': '结束',
  'has died of': '死于',
  'loss': '消耗',
  'lost': '失去',
  'wins': '胜利',
  'mu-yifeng': '牧逸风',
  'du-lingyuan': '杜伶鸳',
  'Talent': '仙命',
  'p2': '(筑基)',
  'p3': '(金丹)',
  'p4': '(元婴)',
  'p5': '(化神)',
  'chase!!': '再次行动',
  'this card': '此卡',
  'gained': '获得',
  'stacks': '层数',
  'disable': '不可用',
  'Now have': '当前有',
  'penetrating': '锋锐',
  'chases': '再次行动',
  "Innate Element Earth": "先天五行·土",
  "Innate Element Fire": "先天五行·火",
  "Innate Element Metal": "先天五行·金",
  "Innate Element Water": "先天五行·水",
  "Innate Element Wood": "先天五行·木",
};

export default function i18n(lang) {
  
  Localization.mSource.mTerms.map(item => {
    if (/CardName_|Talent_|CardKeyword_/.test(item.Term)) {
      cn[item.Languages[1]] = item.Languages[0]
    }
  })

  cn = Object.fromEntries(
    Object.entries(cn).map(([key, value]) => [key.toLowerCase(), value])
  );

  function l(text) {
    if (lang === 'cn' && cn[text.toLowerCase()]) {
      return cn[text.toLowerCase()]
    }
    return text;
  }
  l.lang = lang;
  l.cn = cn;
  return l;
}