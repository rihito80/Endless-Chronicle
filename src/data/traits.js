const TRAIT_MASTER_DATA = {
    GENIUS: { name: '天才肌', desc: '全能力が少し上昇する。', stats: { str: 2, vit: 2, int: 2, mnd: 2, agi: 2, luk: 2 } },
    STUBBORN: { name: '頑固', desc: '打たれ強いが、素早さが低い。', stats: { vit: 5, agi: -2 } },
    LAZY: { name: '怠け者', desc: '全能力が少し低下する。', stats: { str: -1, vit: -1, int: -1, mnd: -1, agi: -1, luk: -1 } },
    LUCKY: { name: '幸運', desc: '運がとても良い。', stats: { luk: 10 } },
    QUICK: { name: '素早い', desc: '素早さが大きく上昇する。', stats: { agi: 5 } },
    TOUGH: { name: 'タフ', desc: 'HPが大きく上昇する。', stats: { maxHp: 20 } }
};
