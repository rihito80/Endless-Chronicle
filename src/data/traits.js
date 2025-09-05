const TRAIT_MASTER_DATA = {
    GENIUS: { name: '天才肌', desc: '全能力が少し上昇する。', stats: { str: 0.02, vit: 0.02, int: 0.02, mnd: 0.02, agi: 0.02, luk: 0.02 } },
    STUBBORN: { name: '頑固', desc: '打たれ強いが、素早さが低い。', stats: { vit: 0.05, agi: -0.02 } },
    LAZY: { name: '怠け者', desc: '全能力が少し低下する。', stats: { str: -0.01, vit: -0.01, int: -0.01, mnd: -0.01, agi: -0.01, luk: -0.01 } },
    LUCKY: { name: '幸運', desc: '運がとても良い。', stats: { luk: 0.10 } },
    QUICK: { name: '素早い', desc: '素早さが大きく上昇する。', stats: { agi: 0.05 } },
    TOUGH: { name: 'タフ', desc: 'HPが大きく上昇する。', stats: { maxHp: 0.20 } },
    MAGIC_BOOST: { name: '魔力ブースト', desc: '知性が上昇する。', stats: { int: 0.05 } },
    CONCENTRATION: { name: '集中', desc: '精神が集中し、MPと精神力が上昇する。', stats: { maxMp: 0.15, mnd: 0.05 } }
};
