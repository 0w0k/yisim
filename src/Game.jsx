import React, { useEffect, useMemo, useState } from "react";
import cards from "./engine/names.json";
import { GameState, ready as engineReadyPromise } from "./engine/gamestate_full_ui.js";
import { swogi } from "./engine/card_info.js";
import { swogi as rawSwogi } from "./engine/card_json_web.js";
import "./Game.css";

const MAX_HP = 100;
const HAND_LIMIT = 12;
const CARDS_PER_TURN = 5;
const REDRAW_PER_TURN = 3;
const ENGINE_LANG = { lang: "en", cn: {} };

// ---------- Action description helpers ----------

const STATUS_LABELS = {
  internal_injury: "内伤",
  decrease_atk: "减攻",
  weaken: "弱化",
  flaw: "破绽",
  entangle: "缠绕",
  wound: "创伤",
  styx: "冥河",
  indigestion: "积食",
  sword_intent: "剑意",
  ignore_def: "无视防御",
  smash_def: "碎防",
  guard_up: "守势",
  hexagram: "卦象",
  star_power: "星力",
  agility: "敏捷",
  physique: "体魄",
  force: "力道",
  penetrate: "穿透",
  regen: "回复",
  hexproof: "免控",
  def: "防御",
  max_hp: "最大生命",
  hp: "生命",
  qi: "灵气",
  increase_atk: "加攻",
  bonus_atk_amt: "额外攻击",
  bonus_rep_amt: "额外重复",
  bonus_force_amt: "额外力道",
  chase: "追击",
  activate_wood_spirit_stacks: "木灵",
  activate_fire_spirit_stacks: "火灵",
  activate_earth_spirit_stacks: "土灵",
  activate_metal_spirit_stacks: "金灵",
  activate_water_spirit_stacks: "水灵",
  sword_intent_flow_stacks: "剑意流转",
  cloud_sword_hand_count: "云剑手牌数",
  unrestrained_sword_count: "逍遥剑数",
  star_point: "星位",
  crash_fist_poke_stacks: "崩拳·戳",
  crash_fist_block_stacks: "崩拳·挡",
  crash_fist_bounce_stacks: "崩拳·弹",
  crash_fist_shake_stacks: "崩拳·震",
  crash_fist_entangle_stacks: "崩拳·缠",
  crash_fist_blitz_stacks: "崩拳·闪",
  crash_footwork_stacks: "崩拳步法",
  crash_fist_truncate_stacks: "崩拳·截",
  crash_fist_blink_stacks: "崩拳·瞬",
  crash_fist_inch_force_stacks: "崩拳·寸劲",
  crash_fist_shocked_stacks: "崩拳·惊",
  this_card_crash_fist_blitz_stacks: "本牌崩拳·闪",
  this_card_crash_fist_inch_force_stacks: "本牌崩拳·寸劲",
  this_card_crash_fist_shocked_stacks: "本牌崩拳·惊",
  bonus_sword_intent_multiplier: "剑意倍率",
  this_card_sword_intent: "本牌剑意",
  cloud_sword_chain_count: "云剑连击",
  centibird_spirit_sword_rhythm_stacks: "百鸟灵剑诀",
  moon_water_sword_formation_stacks: "水月剑阵",
  spirit_gather_citta_dharma_stacks: "聚灵心法",
  unrestrained_sword_zero_stacks: "逍遥剑·零式",
  strike_twice_stacks: "双击",
  later_crash_fist_poke_stacks: "后置崩拳·戳",
  elixirist: "炼丹师",
  fuluist: "符箓师",
  musician: "乐师",
  painter: "画师",
  formation_master: "阵法师",
  plant_master: "植师",
  fortune_teller: "卜师",
};

function labelOf(key) {
  return STATUS_LABELS[key] || key.replace(/_/g, " ");
}

/**
 * Parse a single swogi action into a human-readable Chinese string.
 * Returns an array of description strings.
 */
function describeAction(action) {
  if (!Array.isArray(action)) {
    // bare string like "continuous" / "consumption"
    const labels = { continuous: "持续", consumption: "消耗", become_star_point: "变为星位" };
    return [labels[action] || action];
  }

  const [type, ...args] = action;

  switch (type) {
    // --- Simple numeric ---
    case "atk":
      return [`攻击 ${args[0]}`];
    case "def":
      return [`防御 ${args[0]}`];
    case "qi":
      return [`灵气 +${args[0]}`];
    case "heal":
      return [`回复 ${args[0]} 生命`];
    case "agility":
      return [`敏捷 +${args[0]}`];
    case "physique":
      return [`体魄 +${args[0]}`];
    case "force":
      return [`力道 +${args[0]}`];
    case "penetrate":
      return [`穿透 +${args[0]}`];
    case "smash_def":
      return [`碎防 +${args[0]}`];
    case "guard_up":
      return [`守势 +${args[0]}`];
    case "gain_ignore_def":
      return [`无视防御 +${args[0]}`];
    case "deal_damage":
      return [`造成 ${args[0]} 伤害`];
    case "atk_rand_range":
      return [`随机攻击 ${args[0]}-${args[1]}`];
    case "def_rand_range":
      return [`随机防御 ${args[0]}-${args[1]}`];
    case "deal_damage_rand_range":
      return [`随机造成 ${args[0]}-${args[1]} 伤害`];

    // --- State changes ---
    case "sword_intent":
      return [`剑意 +${args[0]}`];
    case "increase_atk":
      return [`加攻 +${args[0]}`];
    case "hexagram":
      return [`卦象 +${args[0]}`];
    case "star_power":
      return [`星力 +${args[0]}`];
    case "regen":
      return [`回复 +${args[0]}`];
    case "hexproof":
      return [`免控 +${args[0]}`];
    case "chase":
      return [`追击 +${args[0]}`];

    // --- add_c_of_x ---
    case "add_c_of_x": {
      const [c, x] = args;
      return [`获得 ${c} 层${labelOf(x)}`];
    }
    case "add_enemy_c_of_x": {
      const [c, x] = args;
      return [`对手获得 ${c} 层${labelOf(x)}`];
    }
    case "add_enemy_rand_range_of_x":
      return [`对手随机获得 ${labelOf(args[1] || args[0])}`];
    case "add_my_x_to_enemy_y":
      return [`将我方${labelOf(args[0])}转移给对手`];

    // --- for_each_x_add_y ---
    case "for_each_x_add_y": {
      const [x, y] = args;
      return [`每层${labelOf(x)} +${labelOf(y)}`];
    }

    // --- exhaust_x_to_add_y ---
    case "exhaust_x_to_add_y": {
      return [`消耗${labelOf(args[0])}转${labelOf(args[1])}`];
    }

    // --- Conditional actions ---
    case "cloud_hit": {
      const sub = describeAction(args[0]).join("，");
      return [`云击：${sub}`];
    }
    case "injured": {
      const sub = describeAction(args[0]).join("，");
      return [`受伤时：${sub}`];
    }
    case "rep": {
      const [n, subAction] = args;
      const sub = describeAction(subAction).join("，");
      return [`重复 ${n} 次【${sub}】`];
    }
    case "if_x_at_least_c_do": {
      const [x, c, subAction] = args;
      const sub = describeAction(subAction).join("，");
      return [`若${labelOf(x)}≥${c}：${sub}`];
    }
    case "if_x_less_than_c_do": {
      const [x, c, subAction] = args;
      const sub = describeAction(subAction).join("，");
      return [`若${labelOf(x)}<${c}：${sub}`];
    }
    case "if_x_equals_c_do": {
      const [x, c, subAction] = args;
      const sub = describeAction(subAction).join("，");
      return [`若${labelOf(x)}=${c}：${sub}`];
    }
    case "chase_if_hexagram_gt": {
      const sub = describeAction(args[1] || args[0]).join("，");
      return [`卦象>{args[0]}时追击：${sub}`];
    }
    case "chase_if_snake_card_used": {
      const sub = describeAction(args[0]).join("，");
      return [`使用蛇牌时追击：${sub}`];
    }

    // --- convert ---
    case "convert_x_to_y_up_to_c": {
      const [x, y, c] = args;
      return [`将至多 ${c} 点${labelOf(x)}转为${labelOf(y)}`];
    }

    // --- Named sect-specific action groups ---
    case "do_internal_injury":
      return ["触发内伤效果"];
    case "do_thorns_spear_thing":
      return ["荆棘之矛效果"];
    case "do_frozen_blood_lotus":
      return ["冰血莲效果"];
    case "do_echo_formation_thing":
      return ["回响阵法效果"];
    case "do_overcome_with_each_other":
      return ["相生相克效果"];
    case "do_earth_spirit_dust":
      return ["土灵·尘效果"];
    case "do_earth_spirit_landslide":
      return ["土灵·山崩效果"];
    case "do_earth_spirit_rhythm_metal":
      return ["土灵生金效果"];
    case "do_fire_spirit_blazing_praerie":
      return ["火灵·燎原效果"];
    case "do_fire_spirit_burning_sky":
      return ["火灵·焚天效果"];
    case "do_fire_spirit_rhythm_earth":
      return ["火灵生土效果"];
    case "do_metal_spirit_charge":
      return ["金灵·冲锋效果"];
    case "do_metal_spirit_rhythm_water":
      return ["金灵生水效果"];
    case "do_wood_spirit_rhythm_fire":
      return ["木灵生火效果"];
    case "do_water_spirit_rhythm_wood":
      return ["水生木效果"];
    case "do_five_elements_circulation":
      return ["五行流转效果"];
    case "do_five_elements_escape":
      return ["五行遁效果"];
    case "do_ultimate_world_formation":
      return ["终极世界阵法效果"];
    case "do_clear_heart":
      return ["清心效果"];
    case "do_fury_thunder":
      return ["怒雷效果"];
    case "do_propitious_omen":
      return ["吉兆效果"];
    case "do_star_trail_divination":
      return ["星轨占卜效果"];
    case "do_one_randomly":
      return ["随机一个效果"];
    case "do_qi_corrupting_sunflower":
      return ["灵气腐葵效果"];
    case "do_qi_seeking_sunflower":
      return ["灵气寻葵效果"];
    case "do_sun_and_moon_for_glory":
      return ["日月同辉效果"];
    case "do_endless_crash":
      return ["无尽崩拳效果"];
    case "do_polaris_citta_dharma":
      return ["北辰心法效果"];
    case "do_chord_in_tune_thing":
      return ["和弦效果"];
    case "do_thunder_and_lightning":
      return ["雷霆万钧效果"];
    case "do_xuanming_recurring":
      return ["玄冥轮回效果"];
    case "do_xuanming_requiem_fulu":
      return ["玄冥安魂符效果"];
    case "do_xuanming_thundercloud_tribulation":
      return ["玄冥雷云天劫效果"];

    // --- Activate spirit ---
    case "activate_wood_spirit":
      return ["激活木灵"];
    case "activate_fire_spirit":
      return ["激活火灵"];
    case "activate_earth_spirit":
      return ["激活土灵"];
    case "activate_metal_spirit":
      return ["激活金灵"];
    case "activate_water_spirit":
      return ["激活水灵"];
    case "activate_next_slots":
      return [`激活接下 ${args[0]} 个槽位`];

    // --- consume ---
    case "consume_x":
      return [`消耗${labelOf(args[0])}`];
    case "consume_x_of_y":
      return [`消耗${labelOf(args[1])}中的${labelOf(args[0])}`];

    // --- Fallback: show raw action for unhandled types ---
    default:
      return [`[${type} ${args.map(a => (typeof a === "string" ? a : "...")).join(" ")}]`];
  }
}

/**
 * Convert a swogi actions array into an array of Chinese description strings.
 */
function describeActions(actions) {
  if (!actions || actions.length === 0) return [];
  const lines = [];
  for (const action of actions) {
    if (typeof action === "string") {
      // skip "continuous" / "consumption" in top-level display — they're meta, not effects
      if (action === "continuous" || action === "consumption") continue;
      lines.push(action);
    } else if (Array.isArray(action)) {
      lines.push(...describeAction(action));
    }
  }
  return lines;
}

/**
 * Score a card's raw power for AI evaluation.
 * Returns a numerical score based on actual card effects.
 */
function scoreCardEngineData(cardInstance) {
  const eng = cardInstance.engineData;
  if (!eng || !eng.actions) return cardInstance.realm * 10 + cardInstance.level;

  let score = 0;
  function scoreActions(actions, depth = 0) {
    if (depth > 3) return;
    for (const a of actions) {
      if (!Array.isArray(a)) continue;
      const [type, ...args] = a;

      switch (type) {
        case "atk":
          score += args[0] * 3;
          break;
        case "def":
          score += args[0] * 2;
          break;
        case "qi":
          score += args[0] * 2;
          break;
        case "heal":
          score += args[0] * 2;
          break;
        case "sword_intent":
          score += args[0] * 2;
          break;
        case "deal_damage":
          score += args[0] * 3;
          break;
        case "smash_def":
          score += args[0] * 2;
          break;
        case "gain_ignore_def":
          score += args[0] * 2;
          break;
        case "penetrate":
          score += args[0] * 2;
          break;
        case "agility":
          score += args[0] * 1.5;
          break;
        case "force":
          score += args[0] * 1.5;
          break;
        case "physique":
          score += args[0] * 1.5;
          break;
        case "add_c_of_x":
          score += args[0] * 1;
          break;
        case "atk_rand_range":
          score += ((args[0] + args[1]) / 2) * 3;
          break;
        case "cloud_hit":
        case "injured":
        case "rep":
        case "if_x_at_least_c_do":
          // recurse into sub-actions
          for (const arg of args) {
            if (Array.isArray(arg)) scoreActions([arg], depth + 1);
          }
          break;
        default:
          score += 2; // small bonus for unique effects
      }
    }
  }
  scoreActions(eng.actions);

  // qi_cost penalty
  if (eng.qi_cost) score -= eng.qi_cost * 3;

  return score;
}

// ---------- Character / Sect system ----------

const SECTS = {
  1: { name: "云灵剑宗", key: "sw" },
  2: { name: "七星阁", key: "he" },
  3: { name: "五行门", key: "fe" },
  4: { name: "断玄", key: "dx" },
};

const CHARACTERS = [
  // 云灵剑宗 (Cloud Sword)
  { id: "sw1", name: "牧逸风", sect: 1 },
  { id: "sw2", name: "炎雪", sect: 1 },
  { id: "sw3", name: "龙耀", sect: 1 },
  { id: "sw4", name: "林小月", sect: 1 },
  { id: "sw5", name: "陆剑心", sect: 1 },
  { id: "sw6", name: "李承云", sect: 1 },
  // 七星阁 (Heptastar)
  { id: "he1", name: "谭舒燕", sect: 2 },
  { id: "he2", name: "炎尘", sect: 2 },
  { id: "he3", name: "瑶铃", sect: 2 },
  { id: "he4", name: "江希明", sect: 2 },
  { id: "he5", name: "吴策", sect: 2 },
  // 五行门 (Five Elements)
  { id: "fe1", name: "吴行之", sect: 3 },
  { id: "fe2", name: "杜灵元", sect: 3 },
  { id: "fe3", name: "花沁蕊", sect: 3 },
  { id: "fe4", name: "木虎", sect: 3 },
  { id: "fe5", name: "南宫生", sect: 3 },
  { id: "fe6", name: "齐望游", sect: 3 },
  // 断玄 (Duan Xuan)
  { id: "dx1", name: "萧步", sect: 4 },
  { id: "dx2", name: "涂奎", sect: 4 },
  { id: "dx3", name: "夜冥冥", sect: 4 },
  { id: "dx4", name: "纪方生", sect: 4 },
  { id: "dx5", name: "李曼", sect: 4 },
];

/**
 * Return the sect number (1-4) that a card belongs to, or 0 for neutral.
 */
function cardSect(baseId) {
  const category = baseId[0];
  // Sect-specific categories: 1=normal, 2=secret, 6=character, 7=seasonal, 9=fusion
  if (category === "1" || category === "2" || category === "6" || category === "7" || category === "9") {
    return Number(baseId[1]);
  }
  return 0; // neutral — available to all sects
}

// ---------- Card pool helpers ----------

function uniqueByBaseId(list) {
  const m = new Map();
  for (const item of list) {
    if (!m.has(item.baseId)) {
      m.set(item.baseId, item);
    }
  }
  return [...m.values()];
}

/** Build the full normal card list from names.json (shared across all sects). */
const allNormalCards = uniqueByBaseId(
  cards
    .filter((card) => !String(card.id).startsWith("D"))
    .map((card) => {
      const id = String(card.id).padStart(6, "0");
      const baseId = id.slice(0, 5);
      return {
        baseId,
        name: card.name,
        namecn: card.namecn,
        realm: Number(baseId[2]),
      };
    })
    .filter((card) => card.realm >= 1 && card.realm <= 5)
);

/** Return normal cards filtered to the given player sect (or all if sect=0). */
function getSectCards(sect) {
  if (!sect) return allNormalCards;
  return allNormalCards.filter(
    (c) => cardSect(c.baseId) === sect || cardSect(c.baseId) === 0
  );
}

const specialCards = uniqueByBaseId(
  cards
    .filter((card) => String(card.id).startsWith("D"))
    .map((card) => ({
      baseId: String(card.id),
      name: card.name,
      namecn: card.namecn,
      realm: 5,
    }))
);

function getUnlockedRealm(round) {
  if (round <= 3) return 1;
  if (round <= 6) return 2;
  if (round <= 9) return 3;
  if (round <= 12) return 4;
  return 5;
}

function buildInitialPoolCounts(sectCards) {
  const pool = {};
  for (const card of sectCards) {
    pool[card.baseId] = card.realm === 5 ? 6 : 8;
  }
  const specialPool = {};
  for (const card of specialCards) {
    specialPool[card.baseId] = 1;
  }
  return { pool, specialPool };
}

function pickCardFromPool(counts, cardList, predicate = () => true) {
  const available = cardList.filter((card) => predicate(card) && (counts[card.baseId] || 0) > 0);
  if (available.length === 0) return null;

  let total = 0;
  for (const card of available) {
    total += counts[card.baseId];
  }

  let roll = Math.random() * total;
  for (const card of available) {
    roll -= counts[card.baseId];
    if (roll <= 0) {
      return card;
    }
  }
  return available[available.length - 1];
}

/**
 * Look up real engine card data from swogi for a given baseId + level.
 */
function getEngineCardData(baseId, level, isSpecial) {
  if (isSpecial) {
    // Special (Dream) cards — rawSwogi has actions, swogi has metadata
    const raw = rawSwogi[baseId];
    const meta = swogi[baseId];
    if (raw || meta) {
      return {
        actions: raw?.actions || [],
        qi_cost: (meta?.qi_cost || raw?.qi_cost || 0),
        name: meta?.name || raw?.name || "",
        is_cloud_sword: meta?.is_cloud_sword || false,
        is_unrestrained_sword: meta?.is_unrestrained_sword || false,
        is_crash_fist: meta?.is_crash_fist || false,
        is_wood_spirit: meta?.is_wood_spirit || false,
        is_fire_spirit: meta?.is_fire_spirit || false,
        is_earth_spirit: meta?.is_earth_spirit || false,
        is_metal_spirit: meta?.is_metal_spirit || false,
        is_water_spirit: meta?.is_water_spirit || false,
        is_add_physique: meta?.is_add_physique || false,
        is_astral_move: meta?.is_astral_move || false,
        is_thunder: meta?.is_thunder || false,
        is_seal: meta?.is_seal || false,
        is_spirit_sword: meta?.is_spirit_sword || false,
      };
    }
    return { actions: [], qi_cost: 0, name: "" };
  }

  const cardId = `${baseId}${level}`;
  const raw = rawSwogi[cardId];
  const meta = swogi[cardId];

  if (raw || meta) {
    return {
      actions: raw?.actions || [],
      qi_cost: (meta?.qi_cost || raw?.qi_cost || 0),
      name: meta?.name || raw?.name || "",
      is_cloud_sword: meta?.is_cloud_sword || false,
      is_unrestrained_sword: meta?.is_unrestrained_sword || false,
      is_crash_fist: meta?.is_crash_fist || false,
      is_wood_spirit: meta?.is_wood_spirit || false,
      is_fire_spirit: meta?.is_fire_spirit || false,
      is_earth_spirit: meta?.is_earth_spirit || false,
      is_metal_spirit: meta?.is_metal_spirit || false,
      is_water_spirit: meta?.is_water_spirit || false,
      is_add_physique: meta?.is_add_physique || false,
      is_astral_move: meta?.is_astral_move || false,
      is_thunder: meta?.is_thunder || false,
      is_seal: meta?.is_seal || false,
      is_spirit_sword: meta?.is_spirit_sword || false,
    };
  }

  // Fallback: try to find any level of this card in raw data
  for (let lv = 1; lv <= 5; lv++) {
    const fallbackId = `${baseId}${lv}`;
    const fallbackRaw = rawSwogi[fallbackId];
    const fallbackMeta = swogi[fallbackId];
    if (fallbackRaw || fallbackMeta) {
      return {
        actions: fallbackRaw?.actions || [],
        qi_cost: (fallbackMeta?.qi_cost || fallbackRaw?.qi_cost || 0),
        name: fallbackMeta?.name || fallbackRaw?.name || "",
      };
    }
  }

  return { actions: [], qi_cost: 0, name: "" };
}

function createCardInstance(baseCard, level = 1, isSpecial = false) {
  const engineData = getEngineCardData(baseCard.baseId, level, isSpecial);
  return {
    uid: `${baseCard.baseId}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    baseId: baseCard.baseId,
    name: baseCard.name,
    namecn: baseCard.namecn,
    realm: baseCard.realm,
    level,
    isSpecial,
    engineData,
    effectDesc: describeActions(engineData.actions),
    qiCost: engineData.qi_cost || 0,
    tags: [
      engineData.is_cloud_sword && "云剑",
      engineData.is_unrestrained_sword && "逍遥剑",
      engineData.is_crash_fist && "崩拳",
      engineData.is_wood_spirit && "木灵",
      engineData.is_fire_spirit && "火灵",
      engineData.is_earth_spirit && "土灵",
      engineData.is_metal_spirit && "金灵",
      engineData.is_water_spirit && "水灵",
      engineData.is_add_physique && "体魄",
      engineData.is_astral_move && "星位",
      engineData.is_thunder && "雷",
      engineData.is_seal && "封印",
      engineData.is_spirit_sword && "灵剑",
    ].filter(Boolean),
  };
}

function clonePlayer(player) {
  return JSON.parse(JSON.stringify(player));
}

function realmName(realm) {
  return ["", "练气", "筑基", "金丹", "元婴", "化神"][realm] || "未知";
}

function toEngineCardId(card) {
  if (card.isSpecial) {
    return card.baseId;
  }
  return `${card.baseId}${card.level}`;
}

function makeInitialEnginePlayers(playerCharacterId, enemyCharacterId) {
  const game = new GameState(ENGINE_LANG);
  const p0 = clonePlayer(game.players[0]);
  const p1 = clonePlayer(game.players[1]);

  const normalize = (p, charId) => {
    p.hp = MAX_HP;
    p.max_hp = MAX_HP;
    p.physique = 0;
    p.max_physique = 0;
    p.cultivation = 0;
    p.round_number = 1;
    p.cards = ["601011"];
    p.hand_cards = [];
    p.next_card_index = 0;
    p.character = charId;
    return p;
  };

  return {
    player: normalize(p0, playerCharacterId),
    enemy: normalize(p1, enemyCharacterId),
  };
}

function setupInitialState(playerChar, enemyChar) {
  const playerSectCards = getSectCards(playerChar.sect);
  const enemySectCards = getSectCards(enemyChar.sect);
  const { pool, specialPool } = buildInitialPoolCounts(playerSectCards);
  const enginePlayers = makeInitialEnginePlayers(playerChar.id, enemyChar.id);
  return {
    started: false,
    round: 1,
    isPlayerTurn: true,
    winner: "",
    selectedCardUid: "",
    mergeSelection: [],
    playerCharacter: playerChar,
    enemyCharacter: enemyChar,
    playerSectCards,
    enemySectCards,
    pool,
    specialPool,
    player: {
      hp: MAX_HP,
      hand: [],
      redrawLeft: REDRAW_PER_TURN,
      engine: enginePlayers.player,
    },
    enemy: {
      hp: MAX_HP,
      hand: [],
      redrawLeft: REDRAW_PER_TURN,
      engine: enginePlayers.enemy,
    },
    logs: ["初始状态：我方 HP 100，对手 HP 100，等待开始。"],
  };
}

function drawCardsForSide(state, sideKey) {
  const sectCards = sideKey === "player" ? state.playerSectCards : state.enemySectCards;
  const next = {
    ...state,
    pool: { ...state.pool },
    specialPool: { ...state.specialPool },
    [sideKey]: {
      ...state[sideKey],
      hand: [...state[sideKey].hand],
    },
    logs: [...state.logs],
  };

  const unlockedRealm = getUnlockedRealm(next.round);
  const side = next[sideKey];

  if (side.hand.length >= HAND_LIMIT) {
    next.logs.push(`${sideKey === "player" ? "我方" : "对手"}手牌已达 ${HAND_LIMIT}，本回合不发牌。`);
    return next;
  }

  const drawCount = Math.min(CARDS_PER_TURN, HAND_LIMIT - side.hand.length);
  let drawn = 0;

  for (let i = 0; i < drawCount; i++) {
    const rollSpecial = Math.random() < 0.01;
    let picked = null;
    let isSpecial = false;

    if (rollSpecial) {
      picked = pickCardFromPool(next.specialPool, specialCards);
      isSpecial = !!picked;
    }

    if (!picked) {
      picked = pickCardFromPool(next.pool, sectCards, (card) => card.realm <= unlockedRealm);
      isSpecial = false;
    }

    if (!picked) break;

    if (isSpecial) {
      next.specialPool[picked.baseId] -= 1;
    } else {
      next.pool[picked.baseId] -= 1;
    }

    side.hand.push(createCardInstance(picked, 1, isSpecial));
    drawn += 1;
  }

  const charName = sideKey === "player" ? state.playerCharacter.name : state.enemyCharacter.name;
  next.logs.push(
    `${sideKey === "player" ? "我方" : "对手"}${charName}回合发牌 ${drawn} 张（当前开放至 ${realmName(unlockedRealm)}）。`
  );
  return next;
}

function beginTurn(state, sideKey) {
  const next = {
    ...state,
    [sideKey]: {
      ...state[sideKey],
      hand: [...state[sideKey].hand],
      redrawLeft: REDRAW_PER_TURN,
    },
    logs: [...state.logs],
  };

  next.logs.push(`${sideKey === "player" ? "我方" : "对手"}回合开始（第 ${next.round} 轮）。`);
  return drawCardsForSide(next, sideKey);
}

function resolveWithEngine(attackerEngine, defenderEngine, card, round) {
  const game = new GameState(ENGINE_LANG);

  const attacker = clonePlayer(attackerEngine);
  const defender = clonePlayer(defenderEngine);

  attacker.round_number = round;
  defender.round_number = round;

  attacker.cards = [toEngineCardId(card)];
  attacker.hand_cards = [];
  attacker.next_card_index = 0;

  defender.cards = ["601011"];
  defender.hand_cards = [];
  defender.next_card_index = 0;

  Object.assign(game.players[0], attacker);
  Object.assign(game.players[1], defender);

  game.players[0].reset_can_play();
  game.players[1].reset_can_play();

  game.output = [];
  game.sim_turn();

  return {
    attacker: clonePlayer(game.players[0]),
    defender: clonePlayer(game.players[1]),
    logs: [...game.output],
  };
}

export default function Game() {
  const [engineReady, setEngineReady] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [game, setGame] = useState(null);

  useEffect(() => {
    let alive = true;
    engineReadyPromise.then(() => {
      if (alive) setEngineReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const selectedCard = useMemo(() => {
    if (!game) return null;
    return game.player.hand.find((c) => c.uid === game.selectedCardUid) || null;
  }, [game?.player.hand, game?.selectedCardUid]);

  /** Pick a random enemy character from a different sect. */
  const pickEnemyCharacter = (playerChar) => {
    const others = CHARACTERS.filter((c) => c.sect !== playerChar.sect);
    return others[Math.floor(Math.random() * others.length)];
  };

  const startGame = () => {
    if (!engineReady || !selectedCharacter) return;
    const enemyChar = pickEnemyCharacter(selectedCharacter);
    let next = setupInitialState(selectedCharacter, enemyChar);
    next.started = true;
    next = beginTurn(next, "player");
    setGame(next);
  };

  const resetGame = () => {
    setGame(null);
    setSelectedCharacter(null);
  };

  const endCurrentTurn = (current) => {
    if (current.winner) return current;

    const next = {
      ...current,
      selectedCardUid: "",
      mergeSelection: [],
      logs: [...current.logs],
    };

    if (next.enemy.hp <= 0) {
      next.winner = "我方";
      next.logs.push("战斗结束：我方胜利。");
      return next;
    }
    if (next.player.hp <= 0) {
      next.winner = "对手";
      next.logs.push("战斗结束：对手胜利。");
      return next;
    }

    const wasPlayerTurn = next.isPlayerTurn;
    next.isPlayerTurn = !next.isPlayerTurn;
    if (!wasPlayerTurn) {
      next.round += 1;
    }

    return beginTurn(next, next.isPlayerTurn ? "player" : "enemy");
  };

  const playPlayerCard = () => {
    setGame((prev) => {
      if (!engineReady || !prev.started || prev.winner || !prev.isPlayerTurn) return prev;
      const idx = prev.player.hand.findIndex((c) => c.uid === prev.selectedCardUid);
      if (idx < 0) return prev;

      const next = {
        ...prev,
        player: {
          ...prev.player,
          hand: [...prev.player.hand],
          engine: clonePlayer(prev.player.engine),
        },
        enemy: {
          ...prev.enemy,
          engine: clonePlayer(prev.enemy.engine),
        },
        logs: [...prev.logs],
      };

      const card = next.player.hand[idx];
      next.player.hand.splice(idx, 1);

      const result = resolveWithEngine(next.player.engine, next.enemy.engine, card, next.round);
      next.player.engine = result.attacker;
      next.enemy.engine = result.defender;
      next.player.hp = Math.max(0, Math.min(MAX_HP, next.player.engine.hp));
      next.enemy.hp = Math.max(0, Math.min(MAX_HP, next.enemy.engine.hp));

      next.logs.push(`我方打出 ${card.namecn}（境界${card.realm} 等级${card.level}）${card.qiCost > 0 ? ` 耗灵气${card.qiCost}` : ""}。`);
      next.logs.push(...result.logs.slice(-6));

      return endCurrentTurn(next);
    });
  };

  const redraw = () => {
    setGame((prev) => {
      if (!prev.started || prev.winner || !prev.isPlayerTurn) return prev;
      if (prev.player.redrawLeft <= 0) return prev;
      const idx = prev.player.hand.findIndex((c) => c.uid === prev.selectedCardUid);
      if (idx < 0) return prev;

      const next = {
        ...prev,
        pool: { ...prev.pool },
        specialPool: { ...prev.specialPool },
        player: {
          ...prev.player,
          hand: [...prev.player.hand],
          redrawLeft: prev.player.redrawLeft - 1,
        },
        logs: [...prev.logs],
        selectedCardUid: "",
      };

      const old = next.player.hand[idx];
      next.player.hand.splice(idx, 1);

      if (!old.isSpecial && next.pool[old.baseId] !== undefined) {
        next.pool[old.baseId] = Math.max(0, next.pool[old.baseId] - 3);
      }

      const unlockedRealm = getUnlockedRealm(next.round);
      const pickedSpecial = Math.random() < 0.01 ? pickCardFromPool(next.specialPool, specialCards) : null;
      let picked = pickedSpecial;
      let isSpecial = !!picked;

      if (!picked) {
        picked = pickCardFromPool(next.pool, next.playerSectCards, (card) => card.realm <= unlockedRealm);
        isSpecial = false;
      }

      if (picked && next.player.hand.length < HAND_LIMIT) {
        if (isSpecial) {
          next.specialPool[picked.baseId] -= 1;
        } else {
          next.pool[picked.baseId] -= 1;
        }
        next.player.hand.push(createCardInstance(picked, 1, isSpecial));
        next.logs.push(`我方换牌：弃掉 ${old.namecn}，抽到 ${picked.namecn}。`);
      } else {
        next.logs.push(`我方换牌：弃掉 ${old.namecn}，但无牌可抽。`);
      }

      return next;
    });
  };

  const toggleMergeSelection = (uid) => {
    setGame((prev) => {
      const has = prev.mergeSelection.includes(uid);
      const nextSelection = has
        ? prev.mergeSelection.filter((id) => id !== uid)
        : [...prev.mergeSelection, uid].slice(-2);
      return { ...prev, mergeSelection: nextSelection };
    });
  };

  const mergeCards = () => {
    setGame((prev) => {
      if (!prev.started || prev.winner || !prev.isPlayerTurn) return prev;
      if (prev.mergeSelection.length !== 2) return prev;

      const [aUid, bUid] = prev.mergeSelection;
      const aIdx = prev.player.hand.findIndex((c) => c.uid === aUid);
      const bIdx = prev.player.hand.findIndex((c) => c.uid === bUid);
      if (aIdx < 0 || bIdx < 0 || aIdx === bIdx) return prev;

      const a = prev.player.hand[aIdx];
      const b = prev.player.hand[bIdx];
      if (a.isSpecial || b.isSpecial) return prev;
      if (a.realm !== b.realm || a.level !== b.level || a.level >= 5) return prev;

      const next = {
        ...prev,
        player: {
          ...prev.player,
          hand: [...prev.player.hand],
        },
        logs: [...prev.logs],
        mergeSelection: [],
      };

      const keepIdx = Math.min(aIdx, bIdx);
      const removeIdx = Math.max(aIdx, bIdx);

      // Re-create the merged card with updated level and fresh engine data
      const newLevel = next.player.hand[keepIdx].level + 1;
      const baseCard = { baseId: a.baseId, name: a.name, namecn: a.namecn, realm: a.realm };
      next.player.hand[keepIdx] = createCardInstance(baseCard, newLevel, false);
      next.player.hand.splice(removeIdx, 1);
      next.logs.push(`我方合牌成功：${a.namecn} 与 ${b.namecn} 合成等级 ${newLevel}。`);
      return next;
    });
  };

  useEffect(() => {
    if (!engineReady || !game || !game.started || game.winner || game.isPlayerTurn) return;

    const timer = setTimeout(() => {
      setGame((prev) => {
        if (!engineReady || !prev || !prev.started || prev.winner || prev.isPlayerTurn) return prev;

        if (prev.enemy.hand.length === 0) {
          const noCardNext = {
            ...prev,
            logs: [...prev.logs, "对手无牌可出，回合结束。"],
          };
          return endCurrentTurn(noCardNext);
        }

        const next = {
          ...prev,
          player: {
            ...prev.player,
            engine: clonePlayer(prev.player.engine),
          },
          enemy: {
            ...prev.enemy,
            hand: [...prev.enemy.hand],
            engine: clonePlayer(prev.enemy.engine),
          },
          logs: [...prev.logs],
        };

        // AI: use real engine card scoring
        let bestIdx = 0;
        let bestScore = -Infinity;
        for (let i = 0; i < next.enemy.hand.length; i++) {
          const c = next.enemy.hand[i];
          const score = scoreCardEngineData(c);
          if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
          }
        }

        const card = next.enemy.hand[bestIdx];
        next.enemy.hand.splice(bestIdx, 1);

        const result = resolveWithEngine(next.enemy.engine, next.player.engine, card, next.round);
        next.enemy.engine = result.attacker;
        next.player.engine = result.defender;
        next.enemy.hp = Math.max(0, Math.min(MAX_HP, next.enemy.engine.hp));
        next.player.hp = Math.max(0, Math.min(MAX_HP, next.player.engine.hp));

        next.logs.push(`对手打出 ${card.namecn}（境界${card.realm} 等级${card.level}）${card.qiCost > 0 ? ` 耗灵气${card.qiCost}` : ""}。`);
        next.logs.push(...result.logs.slice(-6));

        return endCurrentTurn(next);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [engineReady, game?.started, game?.winner, game?.isPlayerTurn]);

  // ---------- Character selection screen ----------
  if (!game) {
    return (
      <div className='game-page'>
        <div className='game-panel'>
          <h2>弈仙牌对战</h2>
          <p style={{ color: "#aaa", marginBottom: 16 }}>
            {engineReady ? "请选择你要使用的角色" : "引擎加载中..."}
          </p>

          {[1, 2, 3, 4].map((sect) => (
            <div key={sect} style={{ marginBottom: 16 }}>
              <h3 style={{ color: "#e8e8e8", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: 4 }}>
                {SECTS[sect].name}
              </h3>
              <div className='character-grid'>
                {CHARACTERS.filter((c) => c.sect === sect).map((char) => (
                  <button
                    key={char.id}
                    className={`character-btn ${selectedCharacter?.id === char.id ? "character-selected" : ""}`}
                    disabled={!engineReady}
                    onClick={() => setSelectedCharacter(char)}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <button onClick={startGame} disabled={!engineReady || !selectedCharacter} className='start-btn'>
              {engineReady ? (selectedCharacter ? `以 ${selectedCharacter.name} 开始对战` : "请先选择角色") : "引擎加载中..."}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Game screen ----------
  return (
    <div className='game-page'>
      <div className='game-panel'>
        <h2>弈仙牌对战</h2>

        <div className='game-actions'>
          <button onClick={resetGame}>返回选人</button>
          <button onClick={playPlayerCard} disabled={!game.isPlayerTurn || !selectedCard || !!game.winner || !engineReady}>
            出牌
          </button>
          <button onClick={redraw} disabled={!game.isPlayerTurn || !selectedCard || game.player.redrawLeft <= 0 || !!game.winner}>
            换牌（剩余 {game.player.redrawLeft}）
          </button>
          <button onClick={mergeCards} disabled={!game.isPlayerTurn || game.mergeSelection.length !== 2 || !!game.winner}>
            合牌
          </button>
        </div>

        <div className='game-status-grid'>
          <div className='game-status-box'>
            <h3>{game.playerCharacter.name}（{SECTS[game.playerCharacter.sect].name}）</h3>
            <p>初始生命：100</p>
            <p>当前生命：{game.player.hp}</p>
            <p>灵气(qi)：{game.player.engine.qi || 0}</p>
            <p>护甲(def)：{game.player.engine.def || 0}</p>
            <p>内伤：{game.player.engine.internal_injury || 0}</p>
            <p>弱化：{game.player.engine.weaken || 0}</p>
          </div>
          <div className='game-status-box'>
            <h3>{game.enemyCharacter.name}（{SECTS[game.enemyCharacter.sect].name}）</h3>
            <p>初始生命：100</p>
            <p>当前生命：{game.enemy.hp}</p>
            <p>灵气(qi)：{game.enemy.engine.qi || 0}</p>
            <p>护甲(def)：{game.enemy.engine.def || 0}</p>
            <p>内伤：{game.enemy.engine.internal_injury || 0}</p>
            <p>弱化：{game.enemy.engine.weaken || 0}</p>
          </div>
        </div>

        <p>当前轮次：{game.round}</p>
        <p>当前行动方：{game.isPlayerTurn ? `我方（${game.playerCharacter.name}）` : `对手（${game.enemyCharacter.name}）`}</p>
        <p>本轮发牌开放到：{realmName(getUnlockedRealm(game.round))}</p>
        {game.winner ? <p className='game-winner'>游戏结束：{game.winner}获胜</p> : null}

        <h3>我方手牌（上限12）</h3>
        <div className='game-hand'>
          {game.player.hand.map((card) => {
            const isSelected = game.selectedCardUid === card.uid;
            const isMergeSelected = game.mergeSelection.includes(card.uid);
            return (
              <div key={card.uid} className={`game-card ${isSelected ? "selected" : ""} ${isMergeSelected ? "merge-selected" : ""}`}>
                <div className='card-header'>
                  <button className='card-select-btn' onClick={() => setGame((prev) => ({ ...prev, selectedCardUid: card.uid }))}>
                    {card.namecn}
                  </button>
                  <button className='card-merge-btn' onClick={() => toggleMergeSelection(card.uid)}>
                    {isMergeSelected ? "✓合牌" : "合牌"}
                  </button>
                </div>
                <p className='card-meta'>
                  境界 {realmName(card.realm)} / 等级 {card.level}
                  {card.qiCost > 0 ? <span className='card-qi-cost'> / 耗灵{card.qiCost}</span> : null}
                  {card.isSpecial ? " / 特殊牌" : ""}
                </p>
                {card.tags && card.tags.length > 0 && (
                  <p className='card-tags'>{card.tags.map((t) => <span key={t} className='card-tag'>{t}</span>)}</p>
                )}
                {card.effectDesc && card.effectDesc.length > 0 && (
                  <div className='card-effects'>
                    {card.effectDesc.map((line, idx) => (
                      <p key={idx} className='card-effect-line'>{line}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {game.player.hand.length === 0 ? <p>暂无手牌</p> : null}
        </div>

        <h3>战斗记录</h3>
        <div className='game-log'>
          {game.logs.slice(-24).map((log, idx) => (
            <p key={`${idx}-${log.slice(0, 20)}`}>{log}</p>
          ))}
        </div>
      </div>
    </div>
  );
}