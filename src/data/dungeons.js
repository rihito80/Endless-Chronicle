const DUNGEON_MASTER_DATA = {
    '始まりの草原': {
        name: '始まりの草原', depth: 3,
        encounterGroups: {
            '1-2': [ // 1-2階
                { monsters: ['スライム'], weight: 5 },
                { monsters: ['スライム', 'スライム'], weight: 3 },
                { monsters: ['コウモリ'], weight: 4 },
            ],
            '3-3': [ // 3階
                { monsters: ['スライム', 'コウモリ'], weight: 1 },
                { monsters: ['ゴブリン'], weight: 5 },
            ],
        }
    },
    'ゴブリンの洞窟': {
        name: 'ゴブリンの洞窟', depth: 5,
        encounterGroups: {
            '1-3': [
                { monsters: ['ゴブリン'], weight: 3 },
                { monsters: ['ゴブリン', 'コウモリ'], weight: 5 },
                { monsters: ['ゴブリン', 'ゴブリン'], weight: 2 },
            ],
            '4-5': [
                { monsters: ['ゴブリン', 'ゴブリン', 'コウモリ'], weight: 3 },
                { monsters: ['オーク'], weight: 4 },
                { monsters: ['スケルトン'], weight: 3 },
            ],
        }
    },
    '廃墟の砦': {
        name: '廃墟の砦', depth: 10,
        encounterGroups: {
            '1-4': [
                { monsters: ['オーク'], weight: 3 },
                { monsters: ['スケルトン', 'スケルトン'], weight: 4 },
                { monsters: ['オーク', 'ゴブリン'], weight: 3 },
            ],
            '5-7': [
                { monsters: ['リザードマン'], weight: 5 },
                { monsters: ['オーク', 'スケルトン', 'コウモリ'], weight: 3 },
                { monsters: ['メイジ'], weight: 2 },
            ],
            '8-10': [
                { monsters: ['リザードマン', 'メイジ'], weight: 4 },
                { monsters: ['ゴーレム'], weight: 3 },
                { monsters: ['ワイバーン'], weight: 1 },
            ]
        }
    },
    '古代の遺跡': {
        name: '古代の遺跡', depth: 15,
        encounterGroups: {
            '1-5': [
                { monsters: ['リザードマン', 'メイジ'], weight: 4 },
                { monsters: ['ゴーレム'], weight: 5 },
                { monsters: ['ゴーレム', 'メイジ'], weight: 2 },
            ],
            '6-10': [
                { monsters: ['ゴーレム', 'ゴーレム'], weight: 3 },
                { monsters: ['ワイバーン'], weight: 5 },
                { monsters: ['ワイバーン', 'メイジ'], weight: 3 },
            ],
            '11-14': [
                { monsters: ['ワイバーン', 'リザードマン'], weight: 4 },
                { monsters: ['ゴーレム', 'ワイバーン'], weight: 4 },
                { monsters: ['ワイバーン', 'ワイバーン'], weight: 2 },
            ],
            '15-15': [
                { monsters: ['ドラゴン'], weight: 1 },
            ]
        }
    },
};
