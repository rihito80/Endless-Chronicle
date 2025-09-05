const MONSTER_MASTER_DATA = {
    'スライム': { name: 'スライム', hp: 25, str: 10, vit: 5, int: 5, mnd: 5, agi: 8, exp: 5, drop: 'やくそう', elementalResistances: [ELEMENTS.THUNDER] },
    'ゴブリン': { name: 'ゴブリン', hp: 40, str: 15, vit: 8, int: 5, mnd: 5, agi: 12, exp: 10, drop: 'こん棒' },
    'コウモリ': { name: 'コウモリ', hp: 30, str: 12, vit: 6, int: 5, mnd: 5, agi: 20, exp: 8, drop: null },
    'オーク': { name: 'オーク', hp: 80, str: 25, vit: 15, int: 5, mnd: 8, agi: 10, exp: 25, drop: 'てつのやり', elementalWeaknesses: [ELEMENTS.FIRE] },
    'スケルトン': { name: 'スケルトン', hp: 60, str: 20, vit: 20, int: 5, mnd: 10, agi: 15, exp: 20, drop: 'どうのつるぎ', elementalWeaknesses: [ELEMENTS.HOLY], elementalResistances: [ELEMENTS.DARK] },
    'リザードマン': { name: 'リザードマン', hp: 120, str: 35, vit: 25, int: 10, mnd: 15, agi: 25, exp: 50, drop: 'かわのよろい', elementalWeaknesses: [ELEMENTS.ICE] },
    'メイジ': { name: 'メイジ', hp: 70, str: 15, vit: 18, int: 30, mnd: 25, agi: 18, exp: 45, drop: null },
    'ゴーレム': { name: 'ゴーレム', hp: 200, str: 45, vit: 50, int: 5, mnd: 20, agi: 5, exp: 80, drop: 'てつのたて', elementalResistances: [ELEMENTS.FIRE, ELEMENTS.ICE, ELEMENTS.THUNDER] },
    'ワイバーン': { name: 'ワイバーン', hp: 350, str: 60, vit: 40, int: 25, mnd: 30, agi: 50, exp: 200, drop: null, elementalWeaknesses: [ELEMENTS.THUNDER] },
};
