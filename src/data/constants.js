const GROWTH_RANK = { S: 6, A: 5, B: 4, C: 3, D: 2, E: 1 };

const ELEMENT_RELATIONSHIPS = {
    WEAK: 1.5,
    RESIST: 0.5,
    NORMAL: 1.0,
};

const ELEMENTS = {
    NONE: '無',
    FIRE: '火',
    ICE: '氷',
    THUNDER: '雷',
    HOLY: '聖',
    DARK: '闇',
};

const STATUS_AILMENTS = {
    POISON: { id: 'poison', name: '毒', icon: '☠️' },
    PARALYSIS: { id: 'paralysis', name: '麻痺', icon: '⚡' },
    SILENCE: { id: 'silence', name: '沈黙', icon: '🤫' },
};
