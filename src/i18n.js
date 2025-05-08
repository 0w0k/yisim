
import cardnames from '../engine/names.json';

export const cn = {
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
    'to': '结果至',
    'incremented': '增加',
    'cloud_sword_chain_count': '云剑计数',
    'finished playing': '打完',
    'ends': '结束',
    'has died of': '死于',
    'loss': '消耗',
    'wins': '胜利',
    'mu-yifeng': '牧逸风',
    'du-lingyuan': '杜伶鸳'
};

cardnames.map(card => {
    cn[card.name] = card.namecn;
})

export default function i18n(lang) {
    function l(text) {
        if (lang === 'cn' && cn[text]) {
            return cn[text]
        }
        return text;
    }
    l.lang = lang;
    l.cn = cn;
    return l;
}