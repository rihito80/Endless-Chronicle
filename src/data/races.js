const RACE_MASTER_DATA = {
    HUMAN: { name: 'ヒト', desc: '平均的な能力を持つ種族。', stats: { str: 0.01, vit: 0.01, int: 0.01, mnd: 0.01, agi: 0.01, luk: 0.01 } },
    ELF: { name: 'エルフ', desc: '知性と素早さに優れるが、打たれ弱い。', stats: { int: 0.03, agi: 0.02, vit: -0.01 } },
    DWARF: { name: 'ドワーフ', desc: '力と体力に優れるが、素早さに欠ける。', stats: { str: 0.02, vit: 0.03, agi: -0.01 } },
    BEASTMAN: { name: '獣人', desc: '高い身体能力を誇るが、知性は低い。', stats: { str: 0.03, agi: 0.02, int: -0.01 } },
    GOBLINOID: { name: 'ゴブリン族', desc: 'ずる賢いが、やや臆病。', stats: { str: 0.01, agi: 0.01, luk: -0.01 } },
    UNDEAD: { name: 'アンデッド', desc: '生命力と精神力は高いが、運が悪い。', stats: { vit: 0.02, mnd: 0.03, str: 0.01, luk: -0.02 } },
    FAIRY: { name: 'フェアリー', desc: '魔法の力に満ちた妖精族。', stats: { maxMp: 0.20, mnd: 0.03, int: 0.02, maxHp: -0.10 } },
    DRAGONKIN: { name: '竜人', desc: '竜の血を引く誇り高き種族。', stats: { str: 0.03, vit: 0.03, agi: -0.02 } }
};
