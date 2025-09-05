const RACE_MASTER_DATA = {
    HUMAN: { name: 'ヒト', desc: '平均的な能力を持つ種族。', stats: { str: 1, vit: 1, int: 1, mnd: 1, agi: 1, luk: 1 } },
    ELF: { name: 'エルフ', desc: '知性と素早さに優れるが、打たれ弱い。', stats: { int: 3, agi: 2, vit: -1 } },
    DWARF: { name: 'ドワーフ', desc: '力と体力に優れるが、素早さに欠ける。', stats: { str: 2, vit: 3, agi: -1 } },
    BEASTMAN: { name: '獣人', desc: '高い身体能力を誇るが、知性は低い。', stats: { str: 3, agi: 2, int: -1 } },
    GOBLINOID: { name: 'ゴブリン族', desc: 'ずる賢いが、やや臆病。', stats: { str: 1, agi: 1, luk: -1 } },
    UNDEAD: { name: 'アンデッド', desc: '生命力と精神力は高いが、運が悪い。', stats: { vit: 2, mnd: 3, str: 1, luk: -2 } },
    FAIRY: { name: 'フェアリー', desc: '魔法の力に満ちた妖精族。', stats: { maxMp: 20, mnd: 3, int: 2, maxHp: -10 } },
    DRAGONKIN: { name: '竜人', desc: '竜の血を引く誇り高き種族。', stats: { str: 3, vit: 3, agi: -2 } }
};
