const ELEMENTS = {
    NONE: '無',
    FIRE: '火',
    ICE: '氷',
    THUNDER: '雷',
    HOLY: '聖',
    DARK: '闇',
};
const STATUS_AILMENTS = {
    POISON: { id: 'poison', name: '毒', icon: '☠️' },
    PARALYSIS: { id: 'paralysis', name: '麻痺', icon: '⚡' },
    SILENCE: { id: 'silence', name: '沈黙', icon: '🤫' },
};

const SKILL_MASTER_DATA = {
    'スラッシュ': { name: 'スラッシュ', mp: 5, type: 'physical_attack', power: 1.2, target: 'single_enemy', desc: '敵単体に物理ダメージ' },
    'ファイアボール': { name: 'ファイアボール', mp: 8, type: 'magical_attack', power: 1.0, target: 'single_enemy', element: ELEMENTS.FIRE, desc: '敵単体に火属性の魔法ダメージ' },
    'ヒール': { name: 'ヒール', mp: 10, type: 'heal', power: 1.0, target: 'single_ally', desc: '味方単体のHPを回復' },
    'パワースマッシュ': { name: 'パワースマッシュ', mp: 10, type: 'physical_attack', power: 1.8, target: 'single_enemy', desc: '敵単体に物理大ダメージ' },
    'エリアヒール': { name: 'エリアヒール', mp: 25, type: 'heal', power: 0.8, target: 'all_allies', desc: '味方全体のHPを回復' },
    'サンダー': { name: 'サンダー', mp: 15, type: 'magical_attack', power: 1.5, target: 'single_enemy', element: ELEMENTS.THUNDER, desc: '敵単体に雷属性の魔法ダメージ' },
    'スティール': { name: 'スティール', mp: 2, type: 'support', power: 0, target: 'single_enemy', desc: '敵単体からアイテムを盗む(未実装)' },
    'ダブルショット': { name: 'ダブルショット', mp: 12, type: 'physical_attack', power: 0.8, target: 'double_attack', desc: '敵単体に2回物理ダメージ' },
    'ポイズンアロー': { name: 'ポイズンアロー', mp: 8, type: 'physical_attack', power: 1.0, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.POISON.id, chance: 0.7, turns: 3 }], desc: '敵単体を確率で毒状態にする' },
    'ファストステップ': { name: 'ファストステップ', mp: 8, type: 'support', power: 1.2, target: 'self', desc: '自身のAGIを上昇させる(未実装)' },

    // 新規追加スキル
    'アイスストーム': { name: 'アイスストーム', mp: 20, type: 'magical_attack', power: 0.8, target: 'all_enemies', element: ELEMENTS.ICE, desc: '敵全体に氷属性のダメージ' },
    'サンダーボルト': { name: 'サンダーボルト', mp: 22, type: 'magical_attack', power: 0.7, target: 'all_enemies', element: ELEMENTS.THUNDER, desc: '敵全体に雷属性のダメージ' },
    'ホーリーライト': { name: 'ホーリーライト', mp: 18, type: 'magical_attack', power: 1.8, target: 'single_enemy', element: ELEMENTS.HOLY, desc: '敵単体に聖属性の大ダメージ' },
    'ベノムエッジ': { name: 'ベノムエッジ', mp: 10, type: 'physical_attack', power: 1.1, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.POISON.id, chance: 0.9, turns: 4 }], desc: '敵単体を高確率で毒状態にする' },
    'パラライズショット': { name: 'パラライズショット', mp: 12, type: 'physical_attack', power: 0.9, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.PARALYSIS.id, chance: 0.4, turns: 2 }], desc: '敵単体を確率で麻痺させる' },
    'サイレンスブレード': { name: 'サイレンスブレード', mp: 10, type: 'physical_attack', power: 1.0, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.SILENCE.id, chance: 0.5, turns: 3 }], desc: '敵単体を確率で沈黙させる' },
};

const SKILL_TREE_DATA = {
    '戦士': {
        'STR+5': { type: 'STAT_BOOST', stat: 'str', value: 5, cost: 1, requiredLevel: 3 },
        'パワースマッシュ': { type: 'SKILL', skillName: 'パワースマッシュ', cost: 2, requiredLevel: 5 },
        'VIT+10': { type: 'STAT_BOOST', stat: 'vit', value: 10, cost: 2, requiredLevel: 8 },
        'サイレンスブレード': { type: 'SKILL', skillName: 'サイレンスブレード', cost: 3, requiredLevel: 12},
        'STR+15': { type: 'STAT_BOOST', stat: 'str', value: 15, cost: 4, requiredLevel: 20 },
    },
    '魔法使い': {
        'INT+5': { type: 'STAT_BOOST', stat: 'int', value: 5, cost: 1, requiredLevel: 3 },
        'サンダー': { type: 'SKILL', skillName: 'サンダー', cost: 2, requiredLevel: 8 },
        'アイスストーム': { type: 'SKILL', skillName: 'アイスストーム', cost: 3, requiredLevel: 15 },
        'MP+30': { type: 'STAT_BOOST', stat: 'maxMp', value: 30, cost: 2, requiredLevel: 10 },
        'サンダーボルト': { type: 'SKILL', skillName: 'サンダーボルト', cost: 4, requiredLevel: 22 },
    },
    '僧侶': {
        'MND+5': { type: 'STAT_BOOST', stat: 'mnd', value: 5, cost: 1, requiredLevel: 3 },
        'エリアヒール': { type: 'SKILL', skillName: 'エリアヒール', cost: 3, requiredLevel: 10 },
        'VIT+8': { type: 'STAT_BOOST', stat: 'vit', value: 8, cost: 2, requiredLevel: 7 },
        'ホーリーライト': { type: 'SKILL', skillName: 'ホーリーライト', cost: 3, requiredLevel: 14 },
        'MP+20': { type: 'STAT_BOOST', stat: 'maxMp', value: 20, cost: 2, requiredLevel: 9 },
    },
    '盗賊': {
        'AGI+5': { type: 'STAT_BOOST', stat: 'agi', value: 5, cost: 1, requiredLevel: 3 },
        'ファストステップ': { type: 'SKILL', skillName: 'ファストステップ', cost: 2, requiredLevel: 6 },
        'LUK+10': { type: 'STAT_BOOST', stat: 'luk', value: 10, cost: 2, requiredLevel: 8 },
        'ベノムエッジ': { type: 'SKILL', skillName: 'ベノムエッジ', cost: 3, requiredLevel: 11 },
        'AGI+10': { type: 'STAT_BOOST', stat: 'agi', value: 10, cost: 3, requiredLevel: 15 },
    },
    '狩人': {
        'STR+3': { type: 'STAT_BOOST', stat: 'str', value: 3, cost: 1, requiredLevel: 2 },
        'AGI+3': { type: 'STAT_BOOST', stat: 'agi', value: 3, cost: 1, requiredLevel: 2 },
        'ポイズンアロー': { type: 'SKILL', skillName: 'ポイズンアロー', cost: 3, requiredLevel: 7 },
        'パラライズショット': { type: 'SKILL', skillName: 'パラライズショット', cost: 3, requiredLevel: 13 },
        'LUK+15': { type: 'STAT_BOOST', stat: 'luk', value: 15, cost: 4, requiredLevel: 18 },
    }
};
