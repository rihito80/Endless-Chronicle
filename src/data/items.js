const ITEM_MASTER_DATA = {
    // 消費アイテム
    'やくそう': { name: 'やくそう', type: 'consume', rarity: 'COMMON', effect: 'heal_hp', value: 30, target: 'single_ally', desc: '味方単体のHPを30回復する。', buyPrice: 10, sellPrice: 5 },
    'どくけしそう': { name: 'どくけしそう', type: 'consume', rarity: 'COMMON', effect: 'cure_poison', value: 0, target: 'single_ally', desc: '味方単体の毒状態を回復する。', buyPrice: 15, sellPrice: 7 },
    'せいすい': { name: 'せいすい', type: 'consume', rarity: 'UNCOMMON', effect: 'purify', value: 0, target: 'single_ally', desc: '聖なる力で清められた水。アンデッドに有効。(効果未実装)', buyPrice: 30, sellPrice: 15 },
    'エリクサー': { name: 'エリクサー', type: 'consume', rarity: 'EPIC', effect: 'heal_full', value: 9999, target: 'single_ally', desc: '味方単体のHPとMPを完全に回復する。', buyPrice: 1000, sellPrice: 500 },

    // 武器
    'こん棒': { name: 'こん棒', type: 'weapon', rarity: 'COMMON', desc: '原始的な打撃武器。', buyPrice: 50, sellPrice: 25 },
    'どうのつるぎ': { name: 'どうのつるぎ', type: 'weapon', rarity: 'UNCOMMON', desc: '青銅で作られた標準的な剣。', buyPrice: 200, sellPrice: 100 },
    'てつのやり': { name: 'てつのやり', type: 'weapon', rarity: 'UNCOMMON', desc: '鉄製の長い槍。防御も少し上がる。', buyPrice: 500, sellPrice: 250 },
    'ぎんのナイフ': { name: 'ぎんのナイフ', type: 'weapon', rarity: 'RARE', desc: '銀製のナイフ。素早さを少し上げる。', buyPrice: 400, sellPrice: 200 },
    'ミスリルソード': { name: 'ミスリルソード', type: 'weapon', rarity: 'RARE', desc: '軽くても非常に硬いミスリル銀で作られた剣。', buyPrice: 1500, sellPrice: 750 },

    // 防具 (胴)
    '布の服': { name: '布の服', type: 'torso', rarity: 'COMMON', desc: 'ただの布の服。気休め程度の防御力。', buyPrice: 40, sellPrice: 20 },
    'かわのよろい': { name: 'かわのよろい', type: 'torso', rarity: 'UNCOMMON', desc: '硬い皮で作られた鎧。それなりに頑丈。', buyPrice: 250, sellPrice: 125 },
    'まどうしのローブ': { name: 'まどうしのローブ', type: 'torso', rarity: 'RARE', desc: '魔力を高めるローブ。魔法使いに最適。', buyPrice: 450, sellPrice: 225 },
    '騎士の鎧': { name: '騎士の鎧', type: 'torso', rarity: 'RARE', desc: '騎士が着用する鋼鉄の鎧。', buyPrice: 1200, sellPrice: 600 },

    // 防具 (頭)
    '皮の帽子': { name: '皮の帽子', type: 'head', rarity: 'COMMON', desc: '基本的な皮の帽子。', buyPrice: 80, sellPrice: 40 },

    // 防具 (手)
    '皮の手袋': { name: '皮の手袋', type: 'hands', rarity: 'COMMON', desc: '基本的な皮の手袋。', buyPrice: 70, sellPrice: 35 },

    // 防具 (足)
    '皮のブーツ': { name: '皮のブーツ', type: 'feet', rarity: 'COMMON', desc: '基本的な皮のブーツ。', buyPrice: 90, sellPrice: 45 },


    // アクセサリー
    'てつのたて': { name: 'てつのたて', type: 'accessory', rarity: 'UNCOMMON', desc: '鉄製の盾。重いが防御力は高い。', buyPrice: 300, sellPrice: 150 },
    'ちからの指輪': { name: 'ちからの指輪', type: 'accessory', rarity: 'RARE', desc: '力がみなぎる不思議な指輪。', buyPrice: 600, sellPrice: 300 },
    '賢者の石': { name: '賢者の石', type: 'accessory', rarity: 'EPIC', desc: '大いなる魔力を秘めた伝説の石。', buyPrice: 5000, sellPrice: 2500 },

    // Special Effect & Job-specific Items
    'けいけんちのゆびわ': { name: 'けいけんちのゆびわ', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'exp_gain_up', value: 0.1 }], desc: '獲得経験値が10%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },
    'ゴールドリング': { name: 'ゴールドリング', type: 'accessory', rarity: 'RARE', specialEffects: [{ effect: 'gold_gain_up', value: 0.15 }], desc: '獲得ゴールドが15%増加する指輪。', buyPrice: 2000, sellPrice: 1000 },
    'せんしのこて': { name: 'せんしのこて', type: 'hands', rarity: 'RARE', jobRestriction: ['戦士', 'パラディン'], desc: '戦士とパラディンのみが装備できる頑丈な小手。', buyPrice: 1800, sellPrice: 900 },
    'けんじゃのローブ': { name: 'けんじゃのローブ', type: 'torso', rarity: 'RARE', jobRestriction: ['魔法使い', '賢者'], desc: '賢者と魔法使いのみが装備できるローブ。', buyPrice: 2200, sellPrice: 1100 },

    // ステータスアップアイテム
    'ちからのたね': { name: 'ちからのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'str', value: 1, target: 'single_ally', desc: '味方単体のSTRを永続的に1上げる。', sellPrice: 500 },
    'まもりのたね': { name: 'まもりのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'vit', value: 1, target: 'single_ally', desc: '味方単体のVITを永続的に1上げる。', sellPrice: 500 },
    'すばやさのたね': { name: 'すばやさのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'agi', value: 1, target: 'single_ally', desc: '味方単体のAGIを永続的に1上げる。', sellPrice: 500 },
    'かしこさのたね': { name: 'かしこさのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'int', value: 1, target: 'single_ally', desc: '味方単体のINTを永続的に1上げる。', sellPrice: 500 },
    'いのりのたね': { name: 'いのりのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'mnd', value: 1, target: 'single_ally', desc: '味方単体のMNDを永続的に1上げる。', sellPrice: 500 },
    'ラックのたね': { name: 'ラックのたね', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'luk', value: 1, target: 'single_ally', desc: '味方単体のLUKを永続的に1上げる。', sellPrice: 500 },
    'いのちのきのみ': { name: 'いのちのきのみ', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'hp', value: 5, target: 'single_ally', desc: '味方単体の最大HPを永続的に5上げる。', sellPrice: 600 },
    'ふしぎなきのみ': { name: 'ふしぎなきのみ', type: 'consume', rarity: 'RARE', effect: 'stat_boost', stat: 'mp', value: 3, target: 'single_ally', desc: '味方単体の最大MPを永続的に3上げる。', sellPrice: 600 },
};
