const ITEM_MASTER_DATA = {
    // 消費アイテム
    'やくそう': { name: 'やくそう', type: 'consume', rarity: 'COMMON', effect: 'heal_hp', value: 30, target: 'single_ally', desc: '味方単体のHPを30回復する。', buyPrice: 10, sellPrice: 5 },
    'どくけしそう': { name: 'どくけしそう', type: 'consume', rarity: 'COMMON', effect: 'cure_poison', value: 0, target: 'single_ally', desc: '味方単体の毒状態を回復する。', buyPrice: 15, sellPrice: 7 },
    'せいすい': { name: 'せいすい', type: 'consume', rarity: 'UNCOMMON', effect: 'purify', value: 0, target: 'single_ally', desc: '聖なる力で清められた水。アンデッドに有効。(効果未実装)', buyPrice: 30, sellPrice: 15 },
    'エリクサー': { name: 'エリクサー', type: 'consume', rarity: 'EPIC', effect: 'heal_full', value: 9999, target: 'single_ally', desc: '味方単体のHPとMPを完全に回復する。', buyPrice: 1000, sellPrice: 500 },
    '万能薬': { name: '万能薬', type: 'consume', rarity: 'RARE', effect: 'cure_all_ailments', target: 'single_ally', desc: 'あらゆる状態異常を回復する奇跡の薬。', buyPrice: 200, sellPrice: 100 },

    // Special Effect & Job-specific Items
    'けいけんちのゆびわ': { name: 'けいけんちのゆびわ', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'exp_gain_up', value: 0.1 }], desc: '獲得経験値が10%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },
    'ゴールドリング': { name: 'ゴールドリング', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'gold_gain_up', value: 0.15 }], desc: '獲得ゴールドが15%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },
    '炎のアミュレット': { name: '炎のアミュレット', type: 'accessory', rarity: 'UNCOMMON', specialEffects: [{ effect: 'elemental_resistance', element: ELEMENTS.FIRE, value: 0.25 }], desc: '火属性のダメージを25%軽減する。', buyPrice: 1500, sellPrice: 750 },
    '氷のアミュレット': { name: '氷のアミュレット', type: 'accessory', rarity: 'UNCOMMON', specialEffects: [{ effect: 'elemental_resistance', element: ELEMENTS.ICE, value: 0.25 }], desc: '氷属性のダメージを25%軽減する。', buyPrice: 1500, sellPrice: 750 },
    '雷のアミュレット': { name: '雷のアミュレット', type: 'accessory', rarity: 'UNCOMMON', specialEffects: [{ effect: 'elemental_resistance', element: ELEMENTS.THUNDER, value: 0.25 }], desc: '雷属性のダメージを25%軽減する。', buyPrice: 1500, sellPrice: 750 },
    '守りの指輪': { name: '守りの指輪', type: 'accessory', rarity: 'UNCOMMON', desc: '装備者の防御力と精神力を少し高める指輪。', specialEffects: [{ effect: 'stat_bonus_flat', stat: 'vit', value: 3 }, { effect: 'stat_bonus_flat', stat: 'mnd', value: 3 }], buyPrice: 2500, sellPrice: 1250 },

    // --- Equipment ---
    // Weapons
    'ブロードソード': { name: 'ブロードソード', type: 'weapon', rarity: 'COMMON', desc: '一般的な幅広の剣。', buyPrice: 150, sellPrice: 75 },
    'バトルアックス': { name: 'バトルアックス', type: 'weapon', rarity: 'UNCOMMON', desc: '重い刃が強力な一撃を生み出す戦斧。', specialEffects: [{ effect: 'stat_bonus_flat', stat: 'str', value: 8 }], jobRestriction: ['戦士', 'パラディン'], buyPrice: 1500, sellPrice: 750 },
    'ポイズンダガー': {
        name: 'ポイズンダガー', type: 'weapon', rarity: 'UNCOMMON',
        desc: '毒が塗られた短剣。攻撃時に毒を与えることがある。',
        jobRestriction: ['盗賊', '忍者'],
        specialEffects: [{ effect: 'on_hit_effect', type: 'inflict_status', status: 'POISON', chance: 0.2 }],
        buyPrice: 1200, sellPrice: 600
    },
    'ウィザードスタッフ': {
        name: 'ウィザードスタッフ', type: 'weapon', rarity: 'UNCOMMON',
        desc: '魔力が込められた杖。',
        jobRestriction: ['魔法使い', '賢者'],
        specialEffects: [{ effect: 'stat_bonus_flat', stat: 'int', value: 5 }],
        buyPrice: 1000, sellPrice: 500
    },

    // Armor
    'レザーアーマー': { name: 'レザーアーマー', type: 'torso', rarity: 'COMMON', desc: '革製の基本的な鎧。', buyPrice: 200, sellPrice: 100 },
    'リジェネメイル': {
        name: 'リジェネメイル', type: 'torso', rarity: 'RARE',
        desc: 'ターン終了時にHPが少し回復する魔法の鎧。',
        specialEffects: [{ effect: 'hp_regen', value: 10 }],
        buyPrice: 5000, sellPrice: 2500
    },

    // Head
    'レザーヘルム': { name: 'レザーヘルム', type: 'head', rarity: 'COMMON', desc: '革製の基本的な兜。', buyPrice: 100, sellPrice: 50 },
    '賢者のサークレット': {
        name: '賢者のサークレット', type: 'head', rarity: 'RARE',
        desc: 'ターン終了時にMPが少し回復するサークレット。',
        jobRestriction: ['魔法使い', '僧侶', '賢者'],
        specialEffects: [{ effect: 'mp_regen', value: 5 }],
        buyPrice: 4500, sellPrice: 2250
    },

    // Hands
    'レザーグローブ': { name: 'レザーグローブ', type: 'hands', rarity: 'COMMON', desc: '革製の基本的な手袋。', buyPrice: 80, sellPrice: 40 },
    'ミスリルシールド': { name: 'ミスリルシールド', type: 'hands', rarity: 'RARE', desc: '伝説の金属ミスリルで作られた軽い盾。', specialEffects: [{ effect: 'stat_bonus_flat', stat: 'vit', value: 10 }, { effect: 'elemental_resistance', element: ELEMENTS.DARK, value: 0.20 }], jobRestriction: ['戦士', '僧侶', 'パラディン'], buyPrice: 6000, sellPrice: 3000 },
    '盗賊の篭手': {
        name: '盗賊の篭手', type: 'hands', rarity: 'UNCOMMON',
        desc: 'アイテムを盗む確率が上がると言われている。(効果未実装)',
        jobRestriction: ['盗賊'],
        specialEffects: [{ effect: 'steal_chance_up', value: 0.1 }],
        buyPrice: 1500, sellPrice: 750
    },

    // Feet
    'レザーブーツ': { name: 'レザーブーツ', type: 'feet', rarity: 'COMMON', desc: '革製の基本的なブーツ。', buyPrice: 90, sellPrice: 45 },
    'スピードブーツ': {
        name: 'スピードブーツ', type: 'feet', rarity: 'UNCOMMON',
        desc: '装備者の素早さを少し上げる。',
        specialEffects: [{ effect: 'stat_bonus_flat', stat: 'agi', value: 5 }],
        buyPrice: 1800, sellPrice: 900
    },

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
