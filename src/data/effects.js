const BUFF_DEBUFF_MASTER_DATA = {
    'attack_up': {
        id: 'attack_up',
        name: '攻撃力アップ',
        type: 'buff',
        icon: '⚔️↑',
        stat: 'str',
        modifier: 1.25, // 1.25倍
        turns: 3,
        desc: '3ターンの間、STRが1.25倍になる。'
    },
    'defense_up': {
        id: 'defense_up',
        name: '防御力アップ',
        type: 'buff',
        icon: '🛡️↑',
        stat: 'vit',
        modifier: 1.25,
        turns: 3,
        desc: '3ターンの間、VITが1.25倍になる。'
    },
    'magic_up': {
        id: 'magic_up',
        name: '魔力アップ',
        type: 'buff',
        icon: '🧙↑',
        stat: 'int',
        modifier: 1.25,
        turns: 3,
        desc: '3ターンの間、INTが1.25倍になる。'
    },
    'attack_down': {
        id: 'attack_down',
        name: '攻撃力ダウン',
        type: 'debuff',
        icon: '⚔️↓',
        stat: 'str',
        modifier: 0.8, // 0.8倍
        turns: 3,
        desc: '3ターンの間、STRが0.8倍になる。'
    },
    'defense_down': {
        id: 'defense_down',
        name: '防御力ダウン',
        type: 'debuff',
        icon: '🛡️↓',
        stat: 'vit',
        modifier: 0.8,
        turns: 3,
        desc: '3ターンの間、VITが0.8倍になる。'
    },
    'magic_down': {
        id: 'magic_down',
        name: '魔力ダウン',
        type: 'debuff',
        icon: '🧙↓',
        stat: 'int',
        modifier: 0.8,
        turns: 3,
        desc: '3ターンの間、INTが0.8倍になる。'
    },
    'regen': {
        id: 'regen',
        name: 'リジェネ',
        type: 'buff',
        icon: '💖',
        effect: 'regen_hp',
        value: 0.1, // 毎ターン最大HPの10%回復
        turns: 3,
        desc: '3ターンの間、ターン終了時に最大HPの10%を回復する。'
    }
};
