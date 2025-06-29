import Localization from "./Localization.json";
import cardnames from "./engine/names.json";

export let cn = {
  "Yi Xian Simulator": "弈仙牌模拟器",
  Cultivation: "修为",
  HP: "生命",
  Physique: "体魄",
  Result: "模拟结果",
  turn: "回合",
  begins: "开始",
  player: "玩家",
  "is playing": "打出",
  level: "等级",
  reduced: "减少",
  hp: "生命",
  by: " ",
  to: "至",
  damage: "伤害",
  incremented: "增加",
  "cloud sword chain count": "云剑计数",
  "finished playing": "打完",
  ends: "结束",
  "has died of": "死于",
  loss: "消耗",
  lost: "失去",
  wins: "胜利",
  Talent: "仙命",
  p1: "练气",
  p2: "筑基",
  p3: "金丹",
  p4: "元婴",
  p5: "化神",
  p6: "返虚",
  "chase!!": "再次行动",
  "this card": "此卡",
  gained: "获得",
  stacks: "层数",
  disable: "不可用",
  "Now have": "当前有",
  penetrating: "锋锐",
  chases: "再次行动",
  "Innate Element Earth": "先天五行·土",
  "Innate Element Fire": "先天五行·火",
  "Innate Element Metal": "先天五行·金",
  "Innate Element Water": "先天五行·水",
  "Innate Element Wood": "先天五行·木",
  "instead of playing": "代替使用",
  They: "然后",
  increased: "增加",
  play: "打出",
  healed: "恢复",
  "Went from": "从",
  "nuwa stone": "女娲石",
  max: "最大",
  Sect: "门派",
  "side job": "副职业",
  "Character specific": "角色专属",
  Zongzi: "粽子",
  Relics: "遗迹法器",
  "Fate Branches": "命运分支/幻",
  "winning deck:": "获胜卡组：",
  Round: "轮次",
  run: "运行",
  clean: "清除",
  riddle: "求解",
  "show hand cards": "显示手牌",
  "hidden hand cards": "隐藏手牌",
  "copy json": "复制代码",
  "input json": "输入代码",
  Character: "角色",
  "Absorbed Plants": "炼化灵植",
  " m ": " 幻·",
  consuming: "消耗",
  "Deck Score:": "卡组评分：",
  "My HP:": "我的剩余血量：",
  "Enemy HP:": "对手剩余血量：",
  "turns:": "结束回合：",
  operation: "操作",
  cards: "抽牌",
  "waste card": "置换/炼化",
};

export default function i18n(lang) {
  cardnames.map((card) => {
    cn[card.name] = card.namecn;
  });

  Localization.mSource.mTerms.map((item) => {
    if (
      /CardName_|Talent_|CardKeyword_|Sect_|Subcategory_|Career_|CharacterName_/.test(
        item.Term
      )
    ) {
      cn[item.Languages[1]] = item.Languages[0];
    }
  });

  cn = Object.fromEntries(
    Object.entries(cn)
      .map(([key, value]) => [key.toLowerCase(), value])
      .sort(([k1], [k2]) => k2.length - k1.length)
  );

  // const o = [
  //   "Secret Sword - Spirit Cloud",
  //   "Destiny Catastrophe",
  //   "Xiaoyao - Seamless",
  //   "Xiaoyao - Breathless",
  //   "Xiaoyao - Imbalance",
  //   "Xiaoyao - Irreversible",
  //   "Azure Dragon Sword Formation",
  //   "Cloud Sword - Sunset Glow",
  //   "Dragon Devours Clouds",
  //   "Throw Petals",
  //   "Astral Move - Twin Swallows",
  //   "Water Drop Erosion",
  //   "Water Spirit -  Leisurely",
  //   "Wild Crossing Seal",
  //   "Lava Seal",
  //   "Boulder Seal",
  //   "Wave Cutter Seal",
  // ]
  //   .map((item) => getLocalizationEnglishToChinese.get(item))
  //   .join("\n");
  // console.log(o);

  function l(text) {
    if (lang === "cn" && cn[text.toLowerCase()]) {
      return cn[text.toLowerCase()];
    }
    return text;
  }
  l.lang = lang;
  l.cn = cn;
  return l;
}

const localizationMap = new Map(
  Localization.mSource.mTerms.map((item) => [item.Term, item.Languages[1]])
);

export const getLocalizationEnglishToChinese = new Map(
  Localization.mSource.mTerms.map((item) => [
    item.Languages[1],
    item.Languages[0],
  ])
);

export const getLocalizationTermToEnglish = (value) =>
  localizationMap.get(value) || value;
