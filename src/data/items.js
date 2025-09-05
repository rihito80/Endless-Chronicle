const ITEM_MASTER_DATA = {
    // 消費アイテム
    'やくそう': { name: 'やくそう', type: 'consume', rarity: 'COMMON', effect: 'heal_hp', value: 30, target: 'single_ally', desc: '味方単体のHPを30回復する。', buyPrice: 10, sellPrice: 5 },
    'どくけしそう': { name: 'どくけしそう', type: 'consume', rarity: 'COMMON', effect: 'cure_poison', value: 0, target: 'single_ally', desc: '味方単体の毒状態を回復する。', buyPrice: 15, sellPrice: 7 },
    'せいすい': { name: 'せいすい', type: 'consume', rarity: 'UNCOMMON', effect: 'purify', value: 0, target: 'single_ally', desc: '聖なる力で清められた水。アンデッドに有効。(効果未実装)', buyPrice: 30, sellPrice: 15 },
    'エリクサー': { name: 'エリクサー', type: 'consume', rarity: 'EPIC', effect: 'heal_full', value: 9999, target: 'single_ally', desc: '味方単体のHPとMPを完全に回復する。', buyPrice: 1000, sellPrice: 500 },

    // Special Effect & Job-specific Items
    'けいけんちのゆびわ': { name: 'けいけんちのゆびわ', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'exp_gain_up', value: 0.1 }], desc: '獲得経験値が10%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },
    'ゴールドリング': { name: 'ゴールドリング', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'gold_gain_up', value: 0.15 }], desc: '獲得ゴールドが15%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },

    // ステータスアップアイテム
    'ちからのたね': { name: 'ちからのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'str', value: 1, target: 'single_ally', desc: '味方単体のSTRを永続的に1上げる。', sellPrice: 250 },
    'すごいちからのたね': { name: 'すごいちからのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'str', value: 3, target: 'single_ally', desc: '味方単体のSTRを永続的に3上げる。', sellPrice: 750 },
    'ものすごいちからのたね': { name: 'ものすごいちからのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'str', value: 5, target: 'single_ally', desc: '味方単体のSTRを永続的に5上げる。', sellPrice: 2000 },

    'まもりのたね': { name: 'まもりのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'vit', value: 1, target: 'single_ally', desc: '味方単体のVITを永続的に1上げる。', sellPrice: 250 },
    'すごいもりのたね': { name: 'すごいもりのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'vit', value: 3, target: 'single_ally', desc: '味方単体のVITを永続的に3上げる。', sellPrice: 750 },
    'ものすごいまもりのたね': { name: 'ものすごいまもりのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'vit', value: 5, target: 'single_ally', desc: '味方単体のVITを永続的に5上げる。', sellPrice: 2000 },

    'すばやさのたね': { name: 'すばやさのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'agi', value: 1, target: 'single_ally', desc: '味方単体のAGIを永続的に1上げる。', sellPrice: 250 },
    'すごいすばやさのたね': { name: 'すごいすばやさのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'agi', value: 3, target: 'single_ally', desc: '味方単体のAGIを永続的に3上げる。', sellPrice: 750 },
    'ものすごいすばやさのたね': { name: 'ものすごいすばやさのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'agi', value: 5, target: 'single_ally', desc: '味方単体のAGIを永続的に5上げる。', sellPrice: 2000 },

    'かしこさのたね': { name: 'かしこさのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'int', value: 1, target: 'single_ally', desc: '味方単体のINTを永続的に1上げる。', sellPrice: 250 },
    'すごいかしこさのたね': { name: 'すごいかしこさのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'int', value: 3, target: 'single_ally', desc: '味方単体のINTを永続的に3上げる。', sellPrice: 750 },
    'ものすごいかしこさのたね': { name: 'ものすごいかしこさのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'int', value: 5, target: 'single_ally', desc: '味方単体のINTを永続的に5上げる。', sellPrice: 2000 },

    'いのりのたね': { name: 'いのりのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'mnd', value: 1, target: 'single_ally', desc: '味方単体のMNDを永続的に1上げる。', sellPrice: 250 },
    'すごいいのりのたね': { name: 'すごいいのりのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'mnd', value: 3, target: 'single_ally', desc: '味方単体のMNDを永続的に3上げる。', sellPrice: 750 },
    'ものすごいいのりのたね': { name: 'ものすごいいのりのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'mnd', value: 5, target: 'single_ally', desc: '味方単体のMNDを永続的に5上げる。', sellPrice: 2000 },

    'ラックのたね': { name: 'ラックのたね', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'luk', value: 1, target: 'single_ally', desc: '味方単体のLUKを永続的に1上げる。', sellPrice: 250 },
    'すごいラックのたね': { name: 'すごいラックのたね', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'luk', value: 3, target: 'single_ally', desc: '味方単体のLUKを永続的に3上げる。', sellPrice: 750 },
    'ものすごいラックのたね': { name: 'ものすごいラックのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'luk', value: 5, target: 'single_ally', desc: '味方単体のLUKを永続的に5上げる。', sellPrice: 2000 },

    'いのちのきのみ': { name: 'いのちのきのみ', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'hp', value: 5, target: 'single_ally', desc: '味方単体の最大HPを永続的に5上げる。', sellPrice: 300 },
    'すごいいのちのきのみ': { name: 'すごいいのちのきのみ', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'hp', value: 10, target: 'single_ally', desc: '味方単体の最大HPを永続的に10上げる。', sellPrice: 900 },
    'ものすごいいのちのきのみ': { name: 'ものすごいいのちのきのみ', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'hp', value: 20, target: 'single_ally', desc: '味方単体の最大HPを永続的に20上げる。', sellPrice: 2400 },

    'ふしぎなきのみ': { name: 'ふしぎなきのみ', type: 'consume', rarity: 'COMMON', effect: 'stat_boost', stat: 'mp', value: 3, target: 'single_ally', desc: '味方単体の最大MPを永続的に3上げる。', sellPrice: 300 },
    'すごいふしぎなきのみ': { name: 'すごいふしぎなきのみ', type: 'consume', rarity: 'UNCOMMON', effect: 'stat_boost', stat: 'mp', value: 6, target: 'single_ally', desc: '味方単体の最大MPを永続的に6上げる。', sellPrice: 900 },
    'ものすごいふしぎなきのみ': { name: 'ものすごいふしぎなきのみ', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'mp', value: 12, target: 'single_ally', desc: '味方単体の最大MPを永続的に12上げる。', sellPrice: 2400 },

    'にじいろのたね': { name: 'にじいろのたね', type: 'consume', rarity: 'EPIC', effect: 'stat_boost_all', stats: [
        { stat: 'str', value: 1 }, { stat: 'vit', value: 1 }, { stat: 'int', value: 1 },
        { stat: 'mnd', value: 1 }, { stat: 'agi', value: 1 }, { stat: 'luk', value: 1 }
    ], target: 'single_ally', desc: '虹色に輝く奇跡のたね。全ての能力を永続的に1上げる。', sellPrice: 10000 },
};
