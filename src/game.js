document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // 1. データ定義 (企画書 2章準拠)
    // ========================================================================

    const JOB_MASTER_DATA = {
        '戦士': { hp: 'A', mp: 'E', str: 'A', vit: 'B', int: 'E', mnd: 'D', agi: 'C', luk: 'C', skills: ['スラッシュ'] },
        '魔法使い': { hp: 'D', mp: 'A', str: 'E', vit: 'D', int: 'A', mnd: 'B', agi: 'C', luk: 'C', skills: ['ファイアボール'] },
        '僧侶': { hp: 'C', mp: 'B', str: 'D', vit: 'C', int: 'B', mnd: 'A', agi: 'D', luk: 'B', skills: ['ヒール'] },
        '盗賊': { hp: 'C', mp: 'D', str: 'C', vit: 'D', int: 'D', mnd: 'C', agi: 'A', luk: 'S', skills: ['スティール'] },
        '狩人': { hp: 'B', mp: 'C', str: 'B', vit: 'C', int: 'D', mnd: 'C', agi: 'B', luk: 'D', skills: ['ダブルショット'] },
    };
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

    const SKILL_MASTER_DATA = {
        'スラッシュ': { name: 'スラッシュ', mp: 5, type: 'physical_attack', power: 1.2, target: 'single_enemy', desc: '敵単体に物理ダメージ' },
        'ファイアボール': { name: 'ファイアボール', mp: 8, type: 'magical_attack', power: 1.0, target: 'single_enemy', element: ELEMENTS.FIRE, desc: '敵単体に火属性の魔法ダメージ' },
        'ヒール': { name: 'ヒール', mp: 10, type: 'heal', power: 1.0, target: 'single_ally', desc: '味方単体のHPを回復' },
        'パワースマッシュ': { name: 'パワースマッシュ', mp: 10, type: 'physical_attack', power: 1.8, target: 'single_enemy', desc: '敵単体に物理大ダメージ' },
        'エリアヒール': { name: 'エリアヒール', mp: 25, type: 'heal', power: 0.8, target: 'all_allies', desc: '味方全体のHPを回復' },
        'サンダー': { name: 'サンダー', mp: 15, type: 'magical_attack', power: 1.5, target: 'single_enemy', element: ELEMENTS.THUNDER, desc: '敵単体に雷属性の魔法ダメージ' },
        'スティール': { name: 'スティール', mp: 2, type: 'support', power: 0, target: 'single_enemy', desc: '敵単体からアイテムを盗む(未実装)' },
        'ダブルショット': { name: 'ダブルショット', mp: 12, type: 'physical_attack', power: 0.8, target: 'double_attack', desc: '敵単体に2回物理ダメージ' },
        'ポイズンアロー': { name: 'ポイズンアロー', mp: 8, type: 'physical_attack', power: 1.0, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.POISON.id, chance: 0.7, turns: 3 }], desc: '敵単体を確率で毒状態にする' },
        'ファストステップ': { name: 'ファストステップ', mp: 8, type: 'support', power: 1.2, target: 'self', desc: '自身のAGIを上昇させる(未実装)' },

        // 新規追加スキル
        'アイスストーム': { name: 'アイスストーム', mp: 20, type: 'magical_attack', power: 0.8, target: 'all_enemies', element: ELEMENTS.ICE, desc: '敵全体に氷属性のダメージ' },
        'サンダーボルト': { name: 'サンダーボルト', mp: 22, type: 'magical_attack', power: 0.7, target: 'all_enemies', element: ELEMENTS.THUNDER, desc: '敵全体に雷属性のダメージ' },
        'ホーリーライト': { name: 'ホーリーライト', mp: 18, type: 'magical_attack', power: 1.8, target: 'single_enemy', element: ELEMENTS.HOLY, desc: '敵単体に聖属性の大ダメージ' },
        'ベノムエッジ': { name: 'ベノムエッジ', mp: 10, type: 'physical_attack', power: 1.1, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.POISON.id, chance: 0.9, turns: 4 }], desc: '敵単体を高確率で毒状態にする' },
        'パラライズショット': { name: 'パラライズショット', mp: 12, type: 'physical_attack', power: 0.9, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.PARALYSIS.id, chance: 0.4, turns: 2 }], desc: '敵単体を確率で麻痺させる' },
        'サイレンスブレード': { name: 'サイレンスブレード', mp: 10, type: 'physical_attack', power: 1.0, target: 'single_enemy', inflicts: [{ type: STATUS_AILMENTS.SILENCE.id, chance: 0.5, turns: 3 }], desc: '敵単体を確率で沈黙させる' },
    };

    const SKILL_TREE_DATA = {
        '戦士': {
            'STR+5': { type: 'STAT_BOOST', stat: 'str', value: 5, cost: 1, requiredLevel: 3 },
            'パワースマッシュ': { type: 'SKILL', skillName: 'パワースマッシュ', cost: 2, requiredLevel: 5 },
            'VIT+10': { type: 'STAT_BOOST', stat: 'vit', value: 10, cost: 2, requiredLevel: 8 },
            'サイレンスブレード': { type: 'SKILL', skillName: 'サイレンスブレード', cost: 3, requiredLevel: 12},
            'STR+15': { type: 'STAT_BOOST', stat: 'str', value: 15, cost: 4, requiredLevel: 20 },
        },
        '魔法使い': {
            'INT+5': { type: 'STAT_BOOST', stat: 'int', value: 5, cost: 1, requiredLevel: 3 },
            'サンダー': { type: 'SKILL', skillName: 'サンダー', cost: 2, requiredLevel: 8 },
            'アイスストーム': { type: 'SKILL', skillName: 'アイスストーム', cost: 3, requiredLevel: 15 },
            'MP+30': { type: 'STAT_BOOST', stat: 'maxMp', value: 30, cost: 2, requiredLevel: 10 },
            'サンダーボルト': { type: 'SKILL', skillName: 'サンダーボルト', cost: 4, requiredLevel: 22 },
        },
        '僧侶': {
            'MND+5': { type: 'STAT_BOOST', stat: 'mnd', value: 5, cost: 1, requiredLevel: 3 },
            'エリアヒール': { type: 'SKILL', skillName: 'エリアヒール', cost: 3, requiredLevel: 10 },
            'VIT+8': { type: 'STAT_BOOST', stat: 'vit', value: 8, cost: 2, requiredLevel: 7 },
            'ホーリーライト': { type: 'SKILL', skillName: 'ホーリーライト', cost: 3, requiredLevel: 14 },
            'MP+20': { type: 'STAT_BOOST', stat: 'maxMp', value: 20, cost: 2, requiredLevel: 9 },
        },
        '盗賊': {
            'AGI+5': { type: 'STAT_BOOST', stat: 'agi', value: 5, cost: 1, requiredLevel: 3 },
            'ファストステップ': { type: 'SKILL', skillName: 'ファストステップ', cost: 2, requiredLevel: 6 },
            'LUK+10': { type: 'STAT_BOOST', stat: 'luk', value: 10, cost: 2, requiredLevel: 8 },
            'ベノムエッジ': { type: 'SKILL', skillName: 'ベノムエッジ', cost: 3, requiredLevel: 11 },
            'AGI+10': { type: 'STAT_BOOST', stat: 'agi', value: 10, cost: 3, requiredLevel: 15 },
        },
        '狩人': {
            'STR+3': { type: 'STAT_BOOST', stat: 'str', value: 3, cost: 1, requiredLevel: 2 },
            'AGI+3': { type: 'STAT_BOOST', stat: 'agi', value: 3, cost: 1, requiredLevel: 2 },
            'ポイズンアロー': { type: 'SKILL', skillName: 'ポイズンアロー', cost: 3, requiredLevel: 7 },
            'パラライズショット': { type: 'SKILL', skillName: 'パラライズショット', cost: 3, requiredLevel: 13 },
            'LUK+15': { type: 'STAT_BOOST', stat: 'luk', value: 15, cost: 4, requiredLevel: 18 },
        }
    };

    const ITEM_MASTER_DATA = {
        // 消費アイテム
        'やくそう': { name: 'やくそう', type: 'consume', effect: 'heal_hp', value: 30, target: 'single_ally', desc: '味方単体のHPを30回復する。', buyPrice: 10, sellPrice: 5 },
        'どくけしそう': { name: 'どくけしそう', type: 'consume', effect: 'cure_poison', value: 0, target: 'single_ally', desc: '味方単体の毒状態を回復する。', buyPrice: 15, sellPrice: 7 },
        'せいすい': { name: 'せいすい', type: 'consume', effect: 'purify', value: 0, target: 'single_ally', desc: '聖なる力で清められた水。アンデッドに有効。(効果未実装)', buyPrice: 30, sellPrice: 15 },
        'エリクサー': { name: 'エリクサー', type: 'consume', effect: 'heal_full', value: 9999, target: 'single_ally', desc: '味方単体のHPとMPを完全に回復する。', buyPrice: 1000, sellPrice: 500 },

        // 武器
        'こん棒': { name: 'こん棒', type: 'weapon', stats: { str: 5 }, desc: '原始的な打撃武器。', buyPrice: 50, sellPrice: 25 },
        'どうのつるぎ': { name: 'どうのつるぎ', type: 'weapon', stats: { str: 12, agi: -2 }, desc: '青銅で作られた標準的な剣。', buyPrice: 200, sellPrice: 100 },
        'てつのやり': { name: 'てつのやり', type: 'weapon', stats: { str: 18, vit: 5 }, desc: '鉄製の長い槍。防御も少し上がる。', buyPrice: 500, sellPrice: 250 },
        'ぎんのナイフ': { name: 'ぎんのナイフ', type: 'weapon', stats: { str: 10, agi: 5 }, desc: '銀製のナイフ。素早さを少し上げる。', buyPrice: 400, sellPrice: 200 },

        // 防具
        '布の服': { name: '布の服', type: 'armor', stats: { vit: 3 }, desc: 'ただの布の服。気休め程度の防御力。', buyPrice: 40, sellPrice: 20 },
        'かわのよろい': { name: 'かわのよろい', type: 'armor', stats: { vit: 10 }, desc: '硬い皮で作られた鎧。それなりに頑丈。', buyPrice: 250, sellPrice: 125 },
        'まどうしのローブ': { name: 'まどうしのローブ', type: 'armor', stats: { vit: 5, int: 8, mnd: 5 }, desc: '魔力を高めるローブ。魔法使いに最適。', buyPrice: 450, sellPrice: 225 },

        // アクセサリー
        'てつのたて': { name: 'てつのたて', type: 'accessory', stats: { vit: 8, agi: -5 }, desc: '鉄製の盾。重いが防御力は高い。', buyPrice: 300, sellPrice: 150 },
        'ちからの指輪': { name: 'ちからの指輪', type: 'accessory', stats: { str: 5 }, desc: '力がみなぎる不思議な指輪。', buyPrice: 600, sellPrice: 300 },
    };

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
    };

    // ========================================================================
    // 2. ゲーム状態管理
    // ========================================================================

    let gameState = {};
    const initialGameState = {
        roster: [],
        party: [],
        inventory: { 'やくそう': 5, 'こん棒': 1, '布の服': 1 },
        gold: 100,
        currentScreen: 'title',
        battle: null,
        dungeon: null,
    };

    function resetGameState() {
        gameState = JSON.parse(JSON.stringify(initialGameState));
    }

    const screens = document.querySelectorAll('.screen');
    function showScreen(screenId) {
        screens.forEach(screen => screen.classList.add('hidden'));
        document.getElementById(screenId).classList.remove('hidden');
        gameState.currentScreen = screenId;
    }

    // ========================================================================
    // 3. ゲームシステム詳細 (企画書 3章準拠)
    // ========================================================================

    function createCharacter(name, job) {
        const char = {
            id: `char${Date.now()}`, name, level: 1, exp: 0, job,
            hp: 100, maxHp: 100, mp: 10, maxMp: 10,
            stats: { str: 10, vit: 10, int: 5, mnd: 5, agi: 7, luk: 5 },
            skillPoints: 0,
            skills: [...JOB_MASTER_DATA[job].skills],
            learnedSkillTreeNodes: [], // スキルツリーでの習得済みノードを記録
            equipment: { weapon: null, armor: null, accessory: null },
            jobHistory: [{ job: job, level: 1 }],
            permanentBonus: { hp: 0, mp: 0, str: 0, vit: 0, int: 0, mnd: 0, agi: 0, luk: 0 },
            reincarnationCount: 0,
            statusAilments: [],
        };
        return char;
    }

    function getNextLevelExp(level) { return level * 10; }

    function getTotalStats(character) {
        if (!character || !character.stats) {
            console.error("getTotalStats was called with an invalid character:", character);
            return { str: 0, vit: 0, int: 0, mnd: 0, agi: 0, luk: 0, maxHp: 0, maxMp: 0 };
        }
        const total = { ...character.stats };

        // 1. 永続ボーナス (転生)
        for (const stat in character.permanentBonus) {
            total[stat] = (total[stat] || 0) + character.permanentBonus[stat];
        }

        // 2. スキルツリーによるボーナス
        const jobSkillTree = SKILL_TREE_DATA[character.job] || {};
        if (character.learnedSkillTreeNodes) {
            character.learnedSkillTreeNodes.forEach(nodeKey => {
                const node = jobSkillTree[nodeKey];
                if (node && node.type === 'STAT_BOOST') {
                    total[node.stat] = (total[node.stat] || 0) + node.value;
                }
            });
        }


        // 3. 装備によるボーナス
        for (const slot in character.equipment) {
            const itemName = character.equipment[slot];
            if (itemName) {
                const item = ITEM_MASTER_DATA[itemName];
                if (item.stats) {
                    for (const stat in item.stats) {
                        total[stat] = (total[stat] || 0) + item.stats[stat];
                    }
                }
            }
        }

        total.maxHp = (character.maxHp || 0) + (character.permanentBonus?.hp || 0);
        total.maxMp = (character.maxMp || 0) + (character.permanentBonus?.mp || 0);
        return total;
    }

    function calculatePhysicalDamage(attacker, defender) {
        const baseDamage = Math.max(1, (getTotalStats(attacker).str * 2) - getTotalStats(defender).vit);
        return Math.round(baseDamage * (1 + (Math.random() * 0.1 - 0.05)));
    }
    function calculateMagicalDamage(attacker, defender, skill) {
        let multiplier = ELEMENT_RELATIONSHIPS.NORMAL;
        const defenderMaster = MONSTER_MASTER_DATA[defender.name] || {};
        if (skill.element) {
            if (defenderMaster.elementalWeaknesses?.includes(skill.element)) {
                multiplier = ELEMENT_RELATIONSHIPS.WEAK;
            } else if (defenderMaster.elementalResistances?.includes(skill.element)) {
                multiplier = ELEMENT_RELATIONSHIPS.RESIST;
            }
        }

        const baseDamage = Math.max(1, (getTotalStats(attacker).int * 2.5 * skill.power) - getTotalStats(defender).mnd);
        const finalDamage = Math.round(baseDamage * multiplier * (1 + (Math.random() * 0.1 - 0.05)));
        return { damage: finalDamage, multiplier: multiplier };
    }
    function calculateHealAmount(caster, skill) {
        const baseHeal = getTotalStats(caster).int * 2 * skill.power;
        return Math.round(baseHeal * (1 + (Math.random() * 0.1 - 0.05)));
    }

    function levelUp(character) {
        let log = [];
        while (character.exp >= getNextLevelExp(character.level)) {
            character.exp -= getNextLevelExp(character.level);
            character.level++;
            character.skillPoints++;

            const jobGrowth = JOB_MASTER_DATA[character.job];
            const statGain = {
                hp: 10 + GROWTH_RANK[jobGrowth.hp], mp: 3 + GROWTH_RANK[jobGrowth.mp],
                str: 1 + Math.floor(GROWTH_RANK[jobGrowth.str] / 2), vit: 1 + Math.floor(GROWTH_RANK[jobGrowth.vit] / 2),
                int: 1 + Math.floor(GROWTH_RANK[jobGrowth.int] / 2), mnd: 1 + Math.floor(GROWTH_RANK[jobGrowth.mnd] / 2),
                agi: 1 + Math.floor(GROWTH_RANK[jobGrowth.agi] / 2), luk: 1 + Math.floor(GROWTH_RANK[jobGrowth.luk] / 2),
            };

            character.maxHp += statGain.hp; character.maxMp += statGain.mp;
            Object.keys(statGain).forEach(stat => {
                if(character.stats[stat] !== undefined) character.stats[stat] += statGain[stat];
            });

            character.hp = getTotalStats(character).maxHp;
            character.mp = getTotalStats(character).maxMp;
            log.push({ message: `${character.name} はレベル ${character.level} に上がった！ (SP+1)`, className: 'log-levelup' });
        }
        return log;
    }

    function performJobChange(character, newJob) {
        if (character.level < 30) return false;
        const bonus = Math.floor(character.level / 10);
        const oldJobMainStats = Object.entries(JOB_MASTER_DATA[character.job])
            .filter(([, val]) => val === 'A' || val === 'S')
            .map(([key]) => key);

        oldJobMainStats.forEach(stat => {
            if(character.permanentBonus[stat] !== undefined) character.permanentBonus[stat] += bonus;
        });

        character.jobHistory.push({ job: character.job, level: character.level });
        character.level = 1; character.exp = 0; character.job = newJob;

        const baseChar = createCharacter("temp", newJob);
        character.maxHp = baseChar.maxHp; character.maxMp = baseChar.maxMp;
        character.stats = { ...baseChar.stats };
        character.hp = getTotalStats(character).maxHp; character.mp = getTotalStats(character).maxMp;
        character.skills = [...JOB_MASTER_DATA[newJob].skills];
        return true;
    }

    function performReincarnation(character, pointAllocation) {
        if (character.level < 99) return false;
        if (Object.values(pointAllocation).reduce((a, b) => a + b, 0) > 5) return false;

        for (const stat in pointAllocation) {
            character.permanentBonus[stat] += pointAllocation[stat];
        }

        character.level = 1; character.exp = 0; character.reincarnationCount++;

        const baseChar = createCharacter("temp", character.job);
        character.maxHp = baseChar.maxHp; character.maxMp = baseChar.maxMp;
        character.stats = { ...baseChar.stats };
        character.hp = getTotalStats(character).maxHp; character.mp = getTotalStats(character).maxMp;
        return true;
    }

    function getActivePartyMembers() {
        return gameState.party.map(id => gameState.roster.find(char => char.id === id));
    }

    function healAllCharacters() {
        gameState.roster.forEach(char => {
            const totalStats = getTotalStats(char);
            char.hp = totalStats.maxHp;
            char.mp = totalStats.maxMp;
        });
    }

    function equipItem(character, itemName) {
        const item = ITEM_MASTER_DATA[itemName];
        if (!item || !['weapon', 'armor', 'accessory'].includes(item.type)) return;

        const slot = item.type;
        const currentlyEquipped = character.equipment[slot];

        if (currentlyEquipped) {
            gameState.inventory[currentlyEquipped] = (gameState.inventory[currentlyEquipped] || 0) + 1;
        }

        character.equipment[slot] = itemName;
        gameState.inventory[itemName]--;
        if (gameState.inventory[itemName] <= 0) {
            delete gameState.inventory[itemName];
        }

        openCharacterDetailScreen(character.id);
    }

    function deleteCharacter(charId) {
        if (gameState.roster.length <= 1) {
            alert('最後の仲間を消去することはできません。');
            return;
        }

        const characterToDelete = gameState.roster.find(c => c.id === charId);
        if (!characterToDelete) return;

        if (confirm(`${characterToDelete.name}を本当に削除しますか？この操作は元に戻せません。`)) {
            gameState.roster = gameState.roster.filter(c => c.id !== charId);
            gameState.party = gameState.party.filter(id => id !== charId);
            openPartyManagementScreen();
        }
    }

    function buyItem(itemName) {
        const item = ITEM_MASTER_DATA[itemName];
        if (!item || !item.buyPrice) return;

        if (gameState.gold >= item.buyPrice) {
            gameState.gold -= item.buyPrice;
            gameState.inventory[itemName] = (gameState.inventory[itemName] || 0) + 1;
            openShopScreen(); // UIを更新
        } else {
            alert('ゴールドが足りません。');
        }
    }

    function sellItem(itemName) {
        const item = ITEM_MASTER_DATA[itemName];
        if (!item || !item.sellPrice || !gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) {
            return;
        }

        gameState.gold += item.sellPrice;
        gameState.inventory[itemName]--;

        if (gameState.inventory[itemName] <= 0) {
            delete gameState.inventory[itemName];
        }

        openShopScreen(); // UIを更新
    }

    function openShopScreen() {
        document.getElementById('player-gold').textContent = gameState.gold.toLocaleString();

        const buyList = document.getElementById('shop-buy-list');
        const sellList = document.getElementById('shop-sell-list');
        buyList.innerHTML = '';
        sellList.innerHTML = '';

        const createItemEntry = (item, quantity = 0, isBuying = true) => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'item-list-entry';

            let details = '';
            if (item.stats) {
                details = Object.entries(item.stats).map(([stat, val]) => `${stat.toUpperCase()}: ${val > 0 ? '+' : ''}${val}`).join(', ');
            } else if (item.desc) {
                details = item.desc;
            }

            const mainText = isBuying
                ? `${item.name} (${item.buyPrice}G)`
                : `${item.name} (x${quantity}) - 売値: ${item.sellPrice}G`;

            entryDiv.innerHTML = `
                <div style="flex-grow: 1; overflow: hidden;">
                    <span style="word-break: break-all;">${mainText}</span>
                    <div class="skill-desc" style="font-size: 12px; opacity: 0.8; margin-top: 4px; word-break: break-all;">${details}</div>
                </div>
            `;

            const btn = document.createElement('button');
            if (isBuying) {
                btn.textContent = '購入';
                btn.disabled = gameState.gold < item.buyPrice;
                btn.onclick = () => buyItem(item.name);
            } else {
                btn.textContent = '売却';
                btn.onclick = () => sellItem(item.name);
            }
            entryDiv.appendChild(btn);
            return entryDiv;
        };

        // 購入リストの生成
        for (const itemName in ITEM_MASTER_DATA) {
            const item = ITEM_MASTER_DATA[itemName];
            if (item.buyPrice) {
                buyList.appendChild(createItemEntry(item, 0, true));
            }
        }

        // 売却リストの生成
        for (const itemName in gameState.inventory) {
            const item = ITEM_MASTER_DATA[itemName];
            const quantity = gameState.inventory[itemName];
            if (item && item.sellPrice && quantity > 0) {
                sellList.appendChild(createItemEntry(item, quantity, false));
            }
        }
        showScreen('shop-screen');
    }

    // ========================================================================
    // 4. UI更新
    // ========================================================================

    function logMessage(message, screen, options = {}) {
        const { clear = false, className = '' } = options;
        const logWindow = document.getElementById(`${screen}-log`);
        if(logWindow) {
           if (clear) logWindow.innerHTML = '';
           const p = document.createElement('p');
           p.innerHTML = message; // innerHTML to allow for bold tags etc.
           p.style.wordBreak = 'break-word'; // テキストの折り返しを許可
           if(className) p.classList.add(className);
           logWindow.appendChild(p);
           logWindow.scrollTop = logWindow.scrollHeight;
        }
    }

    function updateHubUI() {
        const container = document.getElementById('party-status-hub');
        container.innerHTML = '<h3>戦闘メンバー (クリックで詳細)</h3>';
        getActivePartyMembers().forEach(p => {
            const pStats = getTotalStats(p);
            const memberDiv = document.createElement('div');
            memberDiv.className = 'party-member';
            memberDiv.innerHTML = `
                <strong>${p.name}</strong> (${p.job} Lv.${p.level}) |
                HP: ${p.hp}/${pStats.maxHp} | MP: ${p.mp}/${pStats.maxMp}
            `;
            memberDiv.onclick = () => openCharacterDetailScreen(p.id);
            container.appendChild(memberDiv);
        });
    }

    function updateBattleUI() {
        document.getElementById('dungeon-floor-tracker').textContent = `地下 ${gameState.dungeon.currentFloor}階`;
        const monsterArea = document.getElementById('monster-area');
        monsterArea.innerHTML = '';
        gameState.battle.monsters.forEach((m, index) => {
            let statusIcons = m.statusAilments.map(s => STATUS_AILMENTS[s.type.toUpperCase()]?.icon || '').join('');
            monsterArea.innerHTML += (m.hp > 0) ?
                `<div class="monster-info" data-index="${index}">${m.name} ${statusIcons}<br>HP: ${m.hp}/${m.maxHp}</div>` :
                `<div class="monster-info defeated">${m.name}<br>倒した</div>`;
        });

        const partyStatus = document.getElementById('party-status-battle');
        partyStatus.innerHTML = '';
        getActivePartyMembers().forEach((p) => {
            const pStats = getTotalStats(p);
            let statusIcons = p.statusAilments.map(s => STATUS_AILMENTS[s.type.toUpperCase()]?.icon || '').join('');
             partyStatus.innerHTML += `
                <div class="party-member ${p === gameState.battle.activeCharacter ? 'active-turn' : ''}" data-id="${p.id}">
                     <strong>${p.name} ${statusIcons}</strong> (Lv.${p.level})<br>
                     HP: ${p.hp}/${pStats.maxHp} | MP: ${p.mp}/${pStats.maxMp}
                </div>`;
        });
    }

    // ========================================================================
    // 5. バトル処理
    // ========================================================================

    function showBattleCommandUI(mode) {
        const windows = {
            command: document.getElementById('command-window'),
            skill: document.getElementById('skill-window'),
            item: document.getElementById('item-window'),
            target: document.getElementById('target-window')
        };
        for (const key in windows) {
            windows[key].classList.toggle('hidden', key !== mode);
        }
    }

    function enterDungeon(dungeonData) {
        gameState.dungeon = {
            ...dungeonData,
            currentFloor: 1,
        };
        logMessage(`「${gameState.dungeon.name}」に突入！`, 'hub', { clear: true, className: 'log-info' });
        startNextBattle();
    }

    function startNextBattle() {
        const activeParty = getActivePartyMembers();
        const { currentFloor, encounterGroups } = gameState.dungeon;

        // 1. 現在の階層に合ったエンカウントリストを取得
        let possibleGroups = [];
        for (const rangeKey in encounterGroups) {
            const [min, max] = rangeKey.split('-').map(Number);
            if (currentFloor >= min && currentFloor <= max) {
                possibleGroups = encounterGroups[rangeKey];
                break;
            }
        }

        if (possibleGroups.length === 0) {
            console.error(`エンカウントグループがフロア ${currentFloor} に見つかりません。`);
            // フォールバックとして、最初のグループを使用
            possibleGroups = encounterGroups[Object.keys(encounterGroups)[0]];
        }

        // 2. 重み付きランダムでエンカウントグループを決定
        const totalWeight = possibleGroups.reduce((sum, group) => sum + group.weight, 0);
        let randomWeight = Math.random() * totalWeight;
        let chosenGroup = possibleGroups[possibleGroups.length - 1]; // デフォルトは最後のグループ

        for (const group of possibleGroups) {
            randomWeight -= group.weight;
            if (randomWeight <= 0) {
                chosenGroup = group;
                break;
            }
        }

        // 3. 選択されたグループのモンスターを生成
        const monsterInstances = chosenGroup.monsters.map((monsterName, index) => {
            const monsterData = JSON.parse(JSON.stringify(MONSTER_MASTER_DATA[monsterName]));
            return {
                ...monsterData,
                id: `monster${Date.now()}${index}`,
                maxHp: monsterData.hp,
                stats: { str: monsterData.str, vit: monsterData.vit, int: monsterData.int, mnd: monsterData.mnd, agi: monsterData.agi },
                permanentBonus: {},
                statusAilments: [],
            };
        });

        // 4. バトル状態を初期化
        gameState.battle = {
            monsters: monsterInstances,
            turnOrder: [...activeParty, ...monsterInstances].sort((a, b) => getTotalStats(b).agi - getTotalStats(a).agi),
            turnIndex: 0,
            activeCharacter: null,
            action: null,
        };

        document.getElementById('battle-log').innerHTML = '';
        const monsterNames = monsterInstances.map(m => m.name).join(' と ');
        logMessage(`${monsterNames} があらわれた！`, 'battle', { className: 'log-info' });
        showScreen('battle-screen');
        nextTurn();
    }

    function applyEndOfTurnStatusEffects(character) {
        let effectMessages = [];
        const ailmentsToRemove = [];

        character.statusAilments.forEach(ailment => {
            // Poison: Take damage
            if (ailment.type === STATUS_AILMENTS.POISON.id) {
                const poisonDamage = Math.max(1, Math.floor(getTotalStats(character).maxHp * 0.05));
                character.hp = Math.max(0, character.hp - poisonDamage);
                effectMessages.push({
                    message: `${character.name}は毒のダメージを受けた！ (${poisonDamage})`,
                    className: 'log-damage'
                });
            }

            // Decrement turn count
            ailment.turns--;
            if (ailment.turns <= 0) {
                ailmentsToRemove.push(ailment.type);
                const ailmentInfo = Object.values(STATUS_AILMENTS).find(a => a.id === ailment.type);
                effectMessages.push({
                    message: `${character.name}の${ailmentInfo.name}が治った。`,
                    className: 'log-info'
                });
            }
        });

        // Remove expired ailments
        if (ailmentsToRemove.length > 0) {
            character.statusAilments = character.statusAilments.filter(a => !ailmentsToRemove.includes(a.type));
        }

        // Log messages and update UI
        if (effectMessages.length > 0) {
            setTimeout(() => {
                effectMessages.forEach(log => logMessage(log.message, 'battle', { className: log.className }));
                updateBattleUI();
                 // Check for death from poison
                if (character.hp <= 0) {
                    logMessage(`${character.name}は力尽きた...`, 'battle', { className: 'log-lose' });
                }
            }, 500);
        }
    }


    function nextTurn() {
        if (gameState.battle.monsters.every(m => m.hp <= 0)) { endBattle(true); return; }
        if (getActivePartyMembers().every(p => p.hp <= 0)) { endBattle(false); return; }

        const active = gameState.battle.turnOrder[gameState.battle.turnIndex];

        if (active.hp <= 0) {
            gameState.battle.turnIndex = (gameState.battle.turnIndex + 1) % gameState.battle.turnOrder.length;
            setTimeout(nextTurn, 0);
            return;
        }

        gameState.battle.activeCharacter = active;
        updateBattleUI();

        // Status Ailment Check (Paralysis)
        const isParalyzed = active.statusAilments.find(s => s.type === STATUS_AILMENTS.PARALYSIS.id);
        if (isParalyzed && Math.random() < 0.5) {
            logMessage(`${active.name}は体が痺れて動けない！`, 'battle', { className: 'log-info' });
            setTimeout(() => {
                 applyEndOfTurnStatusEffects(active);
                 gameState.battle.turnIndex = (gameState.battle.turnIndex + 1) % gameState.battle.turnOrder.length;
                 nextTurn();
            }, 1000);
            return;
        }


        if (active.job) {
            // Player turn
            const isSilenced = active.statusAilments.find(s => s.type === STATUS_AILMENTS.SILENCE.id);
            document.querySelector('button[data-command="skill"]').disabled = !!isSilenced;
            showBattleCommandUI('command');
        } else {
            // Monster turn
            showBattleCommandUI(null);
            setTimeout(enemyTurn, 1000);
        }
    }

    function executeTurn() {
        showBattleCommandUI(null);
        const { action } = gameState.battle;
        const { actor } = action;
        let message = '';
        let className = '';

        const targets = action.target ? [action.target] :
                        (action.skill && action.skill.target === 'all_allies') ? getActivePartyMembers().filter(p => p.hp > 0) :
                        (action.skill && action.skill.target === 'all_enemies') ? gameState.battle.monsters.filter(m => m.hp > 0) :
                        [];

        if (targets.length > 0) {
            switch(action.type) {
                case 'attack':
                    const pDamage = calculatePhysicalDamage(actor, targets[0]);
                    targets[0].hp = Math.max(0, targets[0].hp - pDamage);
                    message = `${actor.name} の攻撃！ ${targets[0].name} に ${pDamage} のダメージ！`;
                    className = 'log-damage';
                    break;
                case 'skill':
                    actor.mp -= action.skill.mp;
                    message = `${actor.name} は ${action.skill.name} を使った！`;
                    targets.forEach(target => {
                        if(action.skill.type === 'heal') {
                            const heal = calculateHealAmount(actor, action.skill);
                            target.hp = Math.min(getTotalStats(target).maxHp, target.hp + heal);
                            message += ` ${target.name}のHPが${heal}回復。`;
                            className = 'log-heal';
                        } else { // Attack skills
                            let damageResult;
                            if (action.skill.type === 'physical_attack') {
                                damageResult = { damage: Math.round(calculatePhysicalDamage(actor, target) * action.skill.power), multiplier: ELEMENT_RELATIONSHIPS.NORMAL };
                            } else {
                                damageResult = calculateMagicalDamage(actor, target, action.skill);
                            }

                            target.hp = Math.max(0, target.hp - damageResult.damage);
                            message += ` ${target.name}に${damageResult.damage}のダメージ！`;

                            if (damageResult.multiplier === ELEMENT_RELATIONSHIPS.WEAK) {
                                message += ' <span class="log-critical">効果は抜群だ！</span>';
                            } else if (damageResult.multiplier === ELEMENT_RELATIONSHIPS.RESIST) {
                                message += ' <span class="log-resist">あまり効いていない...</span>';
                            }
                            className = 'log-damage';
                        }

                        // Apply status ailments from skill
                        if (action.skill.inflicts) {
                            action.skill.inflicts.forEach(inflict => {
                                if (Math.random() < inflict.chance) {
                                    // Prevent duplicate ailments
                                    if (!target.statusAilments.some(a => a.type === inflict.type)) {
                                        target.statusAilments.push({ type: inflict.type, turns: inflict.turns });
                                        const ailmentInfo = Object.values(STATUS_AILMENTS).find(a => a.id === inflict.type);
                                        message += ` ${target.name}は${ailmentInfo.name}になった！`;
                                    }
                                }
                            });
                        }
                    });
                    break;
                case 'item':
                    const item = action.item;
                    const target = targets[0];
                    message = `${actor.name} は ${item.name} を使った！`;
                    gameState.inventory[item.name]--;

                    if (item.effect === 'heal_hp') {
                        target.hp = Math.min(getTotalStats(target).maxHp, target.hp + item.value);
                        message += ` ${target.name} のHPが ${item.value} 回復した！`;
                        className = 'log-heal';
                    } else if (item.effect === 'cure_poison') {
                        const poison = target.statusAilments.find(a => a.type === STATUS_AILMENTS.POISON.id);
                        if (poison) {
                            target.statusAilments = target.statusAilments.filter(a => a.type !== STATUS_AILMENTS.POISON.id);
                            message += ` ${target.name}の毒が治った！`;
                        } else {
                            message += ' しかし、何も起こらなかった。';
                        }
                        className = 'log-info';
                    }
                    break;
                case 'defend':
                    message = `${actor.name} は防御している。`;
                    className = 'log-info';
                    break;
            }
            logMessage(message, 'battle', { className });
        }

        // Apply end-of-turn effects
        applyEndOfTurnStatusEffects(actor);

        gameState.battle.turnIndex = (gameState.battle.turnIndex + 1) % gameState.battle.turnOrder.length;
        updateBattleUI();
        setTimeout(nextTurn, 1000);
    }

    function enemyTurn() {
        const enemy = gameState.battle.activeCharacter;
        const target = getActivePartyMembers().filter(p => p.hp > 0).sort(() => 0.5 - Math.random())[0];
        if (!target) {
            gameState.battle.turnIndex = (gameState.battle.turnIndex + 1) % gameState.battle.turnOrder.length;
            nextTurn();
            return;
        }
        gameState.battle.action = { type: 'attack', actor: enemy, target };
        executeTurn();
    }

    function endBattle(isWin) {
        const resultText = document.getElementById('result-text');
        const nextBattleBtn = document.getElementById('next-battle-btn');
        const resultExpBarsContainer = document.getElementById('result-exp-bars');
        resultText.innerHTML = '';
        resultExpBarsContainer.innerHTML = '';

        if (isWin) {
            resultText.innerHTML += `<p class="log-win">勝利！</p>`;
            let expGained = 0, drops = [];
            gameState.battle.monsters.forEach(m => {
                expGained += m.exp;
                if (m.drop) drops.push(m.drop);
            });
            resultText.innerHTML += `<p class="log-info">${expGained} の経験値を獲得した。</p>`;

            getActivePartyMembers().forEach((p, index) => {
                if (p.hp > 0) {
                    p.exp += expGained;
                    levelUp(p).forEach(log => {
                        resultText.innerHTML += `<p class="${log.className}">${log.message}</p>`;
                    });

                    // EXPバーをアニメーション付きで生成
                    const nextLevelExp = getNextLevelExp(p.level);
                    const finalExpPercentage = Math.round((p.exp / nextLevelExp) * 100);
                    const barFillId = `result-bar-fill-${p.id}-${index}`; // Unique ID

                    const expBarHTML = `
                        <div class="result-exp-bar-item">
                            <span class="name">${p.name} (Lv.${p.level})</span>
                            <div class="exp-bar-container">
                                <div class="exp-bar-fill" id="${barFillId}" style="width: 0%;"></div>
                                <span class="exp-bar-text">${p.exp} / ${nextLevelExp}</span>
                            </div>
                        </div>
                    `;
                    resultExpBarsContainer.innerHTML += expBarHTML;

                    // Animate the bar after a short delay
                    setTimeout(() => {
                        const barFill = document.getElementById(barFillId);
                        if (barFill) {
                            barFill.style.width = `${finalExpPercentage}%`;
                        }
                    }, 100 + (index * 100)); // Stagger the animations
                }
            });

            drops.forEach(dropName => {
                if (dropName) {
                    gameState.inventory[dropName] = (gameState.inventory[dropName] || 0) + 1;
                    resultText.innerHTML += `<p class="log-item">${dropName} を手に入れた。</p>`;
                }
            });

            nextBattleBtn.classList.remove('hidden'); // 勝利時は常に表示
            if (gameState.dungeon.currentFloor < gameState.dungeon.depth) {
                nextBattleBtn.textContent = '次の戦闘へ';
            } else {
                nextBattleBtn.textContent = 'もう一度挑戦する';
                resultText.innerHTML += `<br><p class="log-win"><strong>${gameState.dungeon.name} を踏破した！</strong></p>`;
            }
        } else {
            resultText.innerHTML = `<p class="log-lose">全滅してしまった...</p>`;
            nextBattleBtn.classList.add('hidden');
        }
        showScreen('result-screen');
    }

    // ========================================================================
    // 6. データ保存・ロード
    // ========================================================================

    const SAVE_KEY_PREFIX = 'endlessChronicleSave_';
    const MAX_SAVE_SLOTS = 5;

    function saveGame(slot) {
        try {
            gameState.savedAt = new Date().toISOString();
            const key = `${SAVE_KEY_PREFIX}${slot}`;
            localStorage.setItem(key, JSON.stringify(gameState));
            console.log(`Game saved to slot ${slot}`);
            return true;
        } catch (e) {
            console.error(e);
            alert('セーブに失敗しました。');
            return false;
        }
    }

    function loadGame(slot) {
        try {
            const key = `${SAVE_KEY_PREFIX}${slot}`;
            const savedData = localStorage.getItem(key);
            if (savedData) {
                gameState = JSON.parse(savedData);
                logMessage(`スロット ${slot} からロードしました。`, 'hub', { clear: true, className: 'log-info' });
                updateHubUI();
                showScreen('hub-screen');
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            alert(`スロット ${slot} のロードに失敗しました。`);
            return false;
        }
    }

    function deleteGame(slot) {
        const key = `${SAVE_KEY_PREFIX}${slot}`;
        if (confirm(`本当にスロット ${slot} のデータを削除しますか？`)) {
            localStorage.removeItem(key);
            console.log(`Save slot ${slot} deleted.`);
            return true;
        }
        return false;
    }

    function exportGame(slot) {
        const key = `${SAVE_KEY_PREFIX}${slot}`;
        const data = localStorage.getItem(key);
        if (!data) {
            alert('このスロットにはエクスポートするデータがありません。');
            return;
        }
        try {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `endlessChronicle_save_slot${slot}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert('エクスポートに失敗しました。');
        }
    }

    function importGame(file, slot) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                // 簡単なバリデーション
                const importedState = JSON.parse(e.target.result);
                if (importedState.roster && importedState.party) {
                    if (confirm(`スロット ${slot} にインポートしますか？既存のデータは上書きされます。`)) {
                        const key = `${SAVE_KEY_PREFIX}${slot}`;
                        localStorage.setItem(key, e.target.result);
                        alert(`スロット ${slot} にデータをインポートしました。`);
                        openSaveLoadScreen(gameState.currentScreen === 'title' ? 'load' : 'save');
                    }
                } else {
                    alert('無効なセーブファイルです。');
                }
            } catch (err) {
                console.error(err);
                alert('ファイルの読み込みに失敗しました。');
            }
        };
        reader.readAsText(file);
    }

    // ========================================================================
    // 7. UI画面構築
    // ========================================================================

    function openCharacterDetailScreen(charId) {
        const character = gameState.roster.find(c => c.id === charId);
        if (!character) return;

        const stats = getTotalStats(character);
        document.getElementById('char-detail-header').innerHTML = `<h2>${character.name} <small>(${character.job} Lv.${character.level})</small></h2>`;

        const statsContainer = document.getElementById('char-detail-stats');
        statsContainer.innerHTML = `
            <span>HP: ${character.hp} / ${stats.maxHp}</span>
            <span>MP: ${character.mp} / ${stats.maxMp}</span>
            <span>STR: ${stats.str}</span><span>VIT: ${stats.vit}</span>
            <span>INT: ${stats.int}</span><span>MND: ${stats.mnd}</span>
            <span>AGI: ${stats.agi}</span><span>LUK: ${stats.luk}</span>
        `;

        // EXPバーを更新
        const nextLevelExp = getNextLevelExp(character.level);
        const expPercentage = Math.round((character.exp / nextLevelExp) * 100);
        document.getElementById('char-detail-exp-fill').style.width = `${expPercentage}%`;
        document.getElementById('char-detail-exp-text').textContent = `${character.exp} / ${nextLevelExp}`;

        const equipContainer = document.getElementById('char-detail-equipment');
        equipContainer.innerHTML = '';
        ['weapon', 'armor', 'accessory'].forEach(slot => {
            const itemName = character.equipment[slot];
            const slotDiv = document.createElement('div');
            slotDiv.className = 'equip-slot';
            slotDiv.innerHTML = `<span>${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                                 <span>${itemName || 'なし'}</span>`;
            equipContainer.appendChild(slotDiv);
        });

        const inventoryContainer = document.getElementById('char-detail-inventory');
        inventoryContainer.innerHTML = '';
        for (const itemName in gameState.inventory) {
            const item = ITEM_MASTER_DATA[itemName];
            if (['weapon', 'armor', 'accessory'].includes(item.type)) {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'item-list-entry';

                let details = '';
                if (item.stats) {
                    details = Object.entries(item.stats).map(([stat, val]) => `${stat.toUpperCase()}: ${val > 0 ? '+' : ''}${val}`).join(', ');
                }

                entryDiv.innerHTML = `
                    <div style="flex-grow: 1; overflow: hidden;">
                        <span style="word-break: break-all;">${itemName} (x${gameState.inventory[itemName]})</span>
                        <div class="skill-desc" style="font-size: 12px; opacity: 0.8; margin-top: 4px; word-break: break-all;">${details}</div>
                    </div>
                `;

                const equipBtn = document.createElement('button');
                equipBtn.textContent = '装備';
                equipBtn.onclick = () => equipItem(character, itemName);
                entryDiv.appendChild(equipBtn);
                inventoryContainer.appendChild(entryDiv);
            }
        }

        // 習得済みスキル
        const ownedSkillContainer = document.getElementById('char-detail-owned-skills');
        ownedSkillContainer.innerHTML = '';
        if (character.skills.length > 0) {
            character.skills.forEach(skillName => {
                const skillData = SKILL_MASTER_DATA[skillName];
                if (skillData) {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'item-list-entry';
                    entryDiv.innerHTML = `<div>
                        <strong>${skillData.name}</strong> <small>(MP: ${skillData.mp})</small>
                        <div class="skill-desc">${skillData.desc}</div>
                    </div>`;
                    ownedSkillContainer.appendChild(entryDiv);
                }
            });
        } else {
            ownedSkillContainer.innerHTML = '<p>習得済みのスキルはありません。</p>';
        }


        // スキル習得
        document.getElementById('skill-points-display').textContent = character.skillPoints;
        const skillContainer = document.getElementById('char-detail-skills');
        skillContainer.innerHTML = '';
        const jobSkillTree = SKILL_TREE_DATA[character.job] || {};

        for(const nodeKey in jobSkillTree) {
            const nodeInfo = jobSkillTree[nodeKey];
            const isLearned = character.learnedSkillTreeNodes.includes(nodeKey);

            if (!isLearned) {
                const entryDiv = document.createElement('div');
                entryDiv.className = 'item-list-entry';
                let description = '';
                let title = '';

                if (nodeInfo.type === 'SKILL') {
                    const skillData = SKILL_MASTER_DATA[nodeInfo.skillName];
                    title = `${nodeInfo.skillName} (要Lv${nodeInfo.requiredLevel})`;
                    description = skillData.desc;
                } else if (nodeInfo.type === 'STAT_BOOST') {
                    title = `${nodeKey} (要Lv${nodeInfo.requiredLevel})`;
                    description = `永続的に ${nodeInfo.stat.toUpperCase()} が ${nodeInfo.value} 上昇する。`;
                }


                entryDiv.innerHTML = `<div>
                    <strong>${title}</strong>
                    <div class="skill-desc">${description}</div>
                </div>`;

                const learnBtn = document.createElement('button');
                learnBtn.textContent = `習得 (SP:${nodeInfo.cost})`;
                learnBtn.disabled = character.skillPoints < nodeInfo.cost || character.level < nodeInfo.requiredLevel;

                learnBtn.onclick = () => {
                    character.skillPoints -= nodeInfo.cost;
                    character.learnedSkillTreeNodes.push(nodeKey);
                    if (nodeInfo.type === 'SKILL') {
                        character.skills.push(nodeInfo.skillName);
                    }
                     // HP/MPの場合は現在値も更新
                    if (nodeInfo.stat === 'maxHp') character.hp += nodeInfo.value;
                    if (nodeInfo.stat === 'maxMp') character.mp += nodeInfo.value;

                    openCharacterDetailScreen(charId); // UIを再描画
                };

                entryDiv.appendChild(learnBtn);
                skillContainer.appendChild(entryDiv);
            }
        }

        showScreen('character-detail-screen');
        document.getElementById('back-to-hub-from-detail').onclick = () => {
            updateHubUI();
            showScreen('hub-screen');
        };
    }

    function openPartyManagementScreen() {
        const activeList = document.getElementById('active-party-list');
        const reserveList = document.getElementById('reserve-members-list');
        activeList.innerHTML = '';
        reserveList.innerHTML = '';

        const activeMembers = getActivePartyMembers();
        gameState.roster.forEach(char => {
            const card = document.createElement('div');
            card.className = 'character-card';
            card.innerHTML = `<span>${char.name} (${char.job} Lv.${char.level})</span>`;

            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'character-card-buttons';

            const moveBtn = document.createElement('button');
            if (activeMembers.includes(char)) {
                moveBtn.textContent = '待機させる';
                moveBtn.onclick = () => {
                    gameState.party = gameState.party.filter(id => id !== char.id);
                    openPartyManagementScreen();
                };
            } else {
                moveBtn.textContent = 'メンバーに入れる';
                moveBtn.disabled = activeMembers.length >= 4;
                moveBtn.onclick = () => {
                    gameState.party.push(char.id);
                    openPartyManagementScreen();
                };
            }
            buttonContainer.appendChild(moveBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '消去';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteCharacter(char.id);
            buttonContainer.appendChild(deleteBtn);

            card.appendChild(buttonContainer);

            if (activeMembers.includes(char)) {
                activeList.appendChild(card);
            } else {
                reserveList.appendChild(card);
            }
        });
        showScreen('party-management-screen');
    }

    function openTempleScreen() {
        const charList = document.getElementById('job-change-character-select');
        charList.innerHTML = '';
        document.getElementById('job-change-options').classList.add('hidden');

        gameState.roster.forEach(char => {
            const btn = document.createElement('button');
            btn.textContent = `${char.name} (${char.job} Lv.${char.level})`;
            btn.disabled = char.level < 30;
            btn.onclick = () => selectCharacterForJobChange(char);
            charList.appendChild(btn);
        });
        showScreen('temple-screen');
    }

    function selectCharacterForJobChange(character) {
        document.getElementById('job-change-info').textContent = `${character.name} の新しい職業を選択してください。転職するとレベル1に戻ります。`;
        const jobSelect = document.getElementById('new-job-select');
        jobSelect.innerHTML = '';
        Object.keys(JOB_MASTER_DATA).forEach(job => {
            if (job !== character.job) {
                const option = document.createElement('option');
                option.value = job;
                option.textContent = job;
                jobSelect.appendChild(option);
            }
        });
        document.getElementById('job-change-options').classList.remove('hidden');
        document.getElementById('execute-job-change-btn').onclick = () => {
            if(performJobChange(character, jobSelect.value)) {
                logMessage(`${character.name} が ${jobSelect.value} に転職した！`, 'hub', { clear: true, className: 'log-levelup' });
                updateHubUI();
                showScreen('hub-screen');
            }
        };
    }

    function openReincarnationScreen() {
        const charList = document.getElementById('reincarnation-character-select');
        charList.innerHTML = '';
        document.getElementById('reincarnation-options').classList.add('hidden');

        gameState.roster.forEach(char => {
            const btn = document.createElement('button');
            btn.textContent = `${char.name} (${char.job} Lv.${char.level})`;
            btn.disabled = char.level < 99;
            btn.onclick = () => selectCharacterForReincarnation(char);
            charList.appendChild(btn);
        });
        showScreen('reincarnation-screen');
    }

    let pointAllocation = {};
    function openSaveLoadScreen(mode) { // 'save' or 'load'
        const title = document.getElementById('save-load-title');
        const container = document.getElementById('save-slots-list');
        const importBtn = document.getElementById('import-game-btn');
        container.innerHTML = '';
        title.textContent = mode === 'save' ? 'セーブする場所を選択' : 'ロードするデータを選択';
        importBtn.style.display = mode === 'load' ? 'inline-block' : 'none';

        for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
            const key = `${SAVE_KEY_PREFIX}${i}`;
            const savedData = localStorage.getItem(key);
            const slotDiv = document.createElement('div');
            slotDiv.className = 'save-slot';

            let slotInfo = `<div class="slot-number">スロット ${i}</div>`;
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'slot-buttons';

            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    const saveDate = new Date(data.savedAt).toLocaleString('ja-JP');
                    const leader = data.roster.find(char => char.id === data.party[0]);
                    slotInfo += `<div class="slot-details">
                                    <span>${saveDate}</span>
                                    <span>${leader ? leader.name + ' Lv.' + leader.level : 'データなし'}</span>
                                 </div>`;

                    const loadBtn = document.createElement('button');
                    loadBtn.textContent = 'ロード';
                    loadBtn.onclick = () => loadGame(i);
                    buttonContainer.appendChild(loadBtn);

                    if (mode === 'save') {
                        const saveBtn = document.createElement('button');
                        saveBtn.textContent = '上書き';
                        saveBtn.onclick = () => {
                            if (confirm(`スロット ${i} に上書きしますか？`)) {
                                if(saveGame(i)) alert(`スロット ${i} にセーブしました。`);
                                openSaveLoadScreen(mode);
                            }
                        };
                        buttonContainer.appendChild(saveBtn);
                    }

                    const exportBtn = document.createElement('button');
                    exportBtn.textContent = 'エクスポート';
                    exportBtn.onclick = () => exportGame(i);
                    buttonContainer.appendChild(exportBtn);

                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = '削除';
                    deleteBtn.onclick = () => {
                        if (deleteGame(i)) {
                            openSaveLoadScreen(mode);
                        }
                    };
                    buttonContainer.appendChild(deleteBtn);

                } catch (e) {
                    console.error(`Error parsing save data for slot ${i}:`, e);
                    slotInfo += `<div class="slot-details">データが壊れています</div>`;
                    localStorage.removeItem(key); // 壊れたデータを削除
                }
            } else {
                slotInfo += `<div class="slot-details">空きスロット</div>`;
                if (mode === 'save') {
                    const saveBtn = document.createElement('button');
                    saveBtn.textContent = 'ここにセーブ';
                    saveBtn.onclick = () => {
                        if(saveGame(i)) alert(`スロット ${i} にセーブしました。`);
                        openSaveLoadScreen(mode);
                    };
                    buttonContainer.appendChild(saveBtn);
                }
                 const importBtnForSlot = document.createElement('button');
                 importBtnForSlot.textContent = 'インポート';
                 importBtnForSlot.onclick = () => {
                    const fileInput = document.getElementById('import-file-input');
                    fileInput.onchange = (e) => {
                       importGame(e.target.files[0], i);
                       fileInput.value = ''; // Reset for next import
                    };
                    fileInput.click();
                 };
                 buttonContainer.appendChild(importBtnForSlot);
            }

            slotDiv.innerHTML = slotInfo;
            slotDiv.appendChild(buttonContainer);
            container.appendChild(slotDiv);
        }
        showScreen('save-load-screen');
    }

    function selectCharacterForReincarnation(character) {
        document.getElementById('reincarnation-info').textContent = `${character.name} の永続ボーナスを割り振ってください。転生するとレベル1に戻ります。`;
        const allocator = document.getElementById('reincarnation-point-allocator');
        allocator.innerHTML = '<p>獲得ポイント: <span id="reincarnation-points-spent">0</span> / 5</p>';
        pointAllocation = { hp: 0, mp: 0, str: 0, vit: 0, int: 0, mnd: 0, agi: 0, luk: 0 };

        Object.keys(pointAllocation).forEach(stat => {
            const div = document.createElement('div');
            div.className = 'stat-allocator';
            div.innerHTML = `<span>${stat.toUpperCase()}</span>
                <button data-stat="${stat}" data-amount="-1">-</button>
                <span class="points" id="points-${stat}">0</span>
                <button data-stat="${stat}" data-amount="1">+</button>`;
            allocator.appendChild(div);
        });

        document.getElementById('reincarnation-options').classList.remove('hidden');
        document.getElementById('execute-reincarnation-btn').onclick = () => {
            if(performReincarnation(character, pointAllocation)) {
                logMessage(`${character.name} が転生した！`, 'hub', { clear: true, className: 'log-win' });
                updateHubUI();
                showScreen('hub-screen');
            }
        };
    }

    // ========================================================================
    // 8. イベントリスナー
    // ========================================================================

    function initEventListeners() {
        // バトルコマンドUIが正しく隠れるように、起動時にクラスを追加する
        document.getElementById('command-window').classList.add('sub-window');

        document.getElementById('start-new-game').addEventListener('click', () => {
            resetGameState();
            document.getElementById('character-creation-title').textContent = "主人公作成";
            document.getElementById('cancel-creation-btn').classList.add('hidden');
            showScreen('character-creation-screen');
        });

        // データ管理画面を開く
        document.getElementById('open-load-screen').addEventListener('click', () => openSaveLoadScreen('load'));
        document.getElementById('open-save-screen').addEventListener('click', () => openSaveLoadScreen('save'));

        // データ管理画面のボタン
        document.getElementById('back-from-save-load-screen').addEventListener('click', () => {
            // タイトル画面から来たか、拠点から来たかで戻る場所を変える
            const previousScreen = (gameState.roster.length === 0) ? 'title-screen' : 'hub-screen';
            showScreen(previousScreen);
        });

        document.getElementById('import-game-btn').addEventListener('click', () => {
            // 空きスロットを探してインポートを試みる
            let firstEmptySlot = -1;
            for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
                if (!localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`)) {
                    firstEmptySlot = i;
                    break;
                }
            }

            if (firstEmptySlot !== -1) {
                const fileInput = document.getElementById('import-file-input');
                fileInput.onchange = (e) => {
                   importGame(e.target.files[0], firstEmptySlot);
                   fileInput.value = '';
                };
                fileInput.click();
            } else {
                alert('インポートするための空きスロットがありません。');
            }
        });


        document.getElementById('create-character-btn').addEventListener('click', () => {
            const name = document.getElementById('char-name').value;
            if (!name) { alert('名前を入力してください。'); return; }
            const job = document.getElementById('char-job').value;
            const newChar = createCharacter(name, job);
            gameState.roster.push(newChar);

            if (gameState.party.length === 0) {
                gameState.party.push(newChar.id);
                updateHubUI();
                showScreen('hub-screen');
            } else {
                openPartyManagementScreen();
            }
            document.getElementById('char-name').value = '';
        });

        document.getElementById('cancel-creation-btn').addEventListener('click', openPartyManagementScreen);

        document.querySelectorAll('.back-to-hub').forEach(btn => {
            btn.addEventListener('click', () => {
                healAllCharacters();
                updateHubUI();
                showScreen('hub-screen');
            });
        });

        document.getElementById('go-to-dungeon-btn').addEventListener('click', () => {
            const list = document.getElementById('dungeon-list');
            list.innerHTML = '';
            for(const key in DUNGEON_MASTER_DATA) {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = `${DUNGEON_MASTER_DATA[key].name} (全${DUNGEON_MASTER_DATA[key].depth}階)`;
                button.onclick = () => enterDungeon(DUNGEON_MASTER_DATA[key]);
                li.appendChild(button);
                list.appendChild(li);
            }
            showScreen('dungeon-select-screen');
        });

        document.getElementById('go-to-party-management-btn').addEventListener('click', openPartyManagementScreen);
        document.getElementById('go-to-shop-btn').addEventListener('click', openShopScreen);
        document.getElementById('recruit-member-btn').addEventListener('click', () => {
            document.getElementById('character-creation-title').textContent = "新しい仲間を勧誘";
            document.getElementById('cancel-creation-btn').classList.remove('hidden');
            showScreen('character-creation-screen');
        });

        document.getElementById('next-battle-btn').addEventListener('click', () => {
            if (gameState.dungeon) {
                if (gameState.dungeon.currentFloor < gameState.dungeon.depth) {
                    gameState.dungeon.currentFloor++;
                } else {
                    // ダンジョンクリア、1階から再挑戦
                    gameState.dungeon.currentFloor = 1;
                }
                startNextBattle();
            }
        });

        document.getElementById('go-to-temple-btn').addEventListener('click', openTempleScreen);
        document.getElementById('cancel-job-change-btn').addEventListener('click', () => {
            document.getElementById('job-change-options').classList.add('hidden');
        });
        document.getElementById('go-to-reincarnation-btn').addEventListener('click', openReincarnationScreen);
        document.getElementById('cancel-reincarnation-btn').addEventListener('click', () => {
            document.getElementById('reincarnation-options').classList.add('hidden');
        });

        document.getElementById('reincarnation-point-allocator').addEventListener('click', e => {
            if (e.target.tagName !== 'BUTTON') return;
            const stat = e.target.dataset.stat;
            const amount = parseInt(e.target.dataset.amount);
            const totalPoints = Object.values(pointAllocation).reduce((a,b) => a+b, 0);
            if (amount > 0 && totalPoints < 5) pointAllocation[stat]++;
            else if (amount < 0 && pointAllocation[stat] > 0) pointAllocation[stat]--;
            document.getElementById(`points-${stat}`).textContent = pointAllocation[stat];
            document.getElementById('reincarnation-points-spent').textContent = Object.values(pointAllocation).reduce((a,b) => a+b, 0);
        });

        document.getElementById('command-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('back-to-command')) {
                showBattleCommandUI('command');
                return;
            }

            const commandBtn = e.target.closest('#command-window button');
            if(commandBtn) {
                const command = commandBtn.dataset.command;
                const actor = gameState.battle.activeCharacter;
                const validEnemies = gameState.battle.monsters.filter(m => m.hp > 0);

                switch(command) {
                    case 'attack':
                        gameState.battle.action = { type: 'attack', actor };
                        // [修正点] 敵が1体なら自動でターゲット
                        if (validEnemies.length === 1) {
                            gameState.battle.action.target = validEnemies[0];
                            executeTurn();
                        } else {
                            promptForTarget('enemy');
                        }
                        break;
                    case 'skill':
                        const skillWindow = document.getElementById('skill-window');
                        skillWindow.innerHTML = '<button class="back-to-command">戻る</button>';
                        actor.skills.forEach(skillName => {
                            const skill = SKILL_MASTER_DATA[skillName];
                            const btn = document.createElement('button');
                            btn.textContent = `${skill.name} (MP:${skill.mp})`;
                            btn.disabled = actor.mp < skill.mp;
                            // テキストがボタンからはみ出ないようにスタイルを調整
                            btn.style.whiteSpace = 'normal';
                            btn.style.wordBreak = 'break-word';
                            btn.style.height = 'auto';
                            btn.style.minHeight = '40px'; // 元のボタンの高さに近い値
                            btn.onclick = () => {
                                gameState.battle.action = { type: 'skill', actor, skill };
                                // スキルのターゲットタイプに応じて処理を分岐
                                if (skill.target === 'single_enemy' || skill.target === 'double_attack') {
                                    if (validEnemies.length === 1) {
                                        gameState.battle.action.target = validEnemies[0];
                                        executeTurn();
                                    } else {
                                        promptForTarget('enemy');
                                    }
                                } else if (skill.target.includes('all')) {
                                    executeTurn();
                                } else if (skill.target === 'self') {
                                    gameState.battle.action.target = actor;
                                    executeTurn();
                                } else { // single_ally など
                                    promptForTarget('ally');
                                }
                            };
                            skillWindow.insertBefore(btn, skillWindow.firstChild);
                        });
                        showBattleCommandUI('skill');
                        break;
                    case 'defend':
                        gameState.battle.action = { type: 'defend', actor, target: actor };
                        executeTurn();
                        break;
                    case 'item':
                         const itemWindow = document.getElementById('item-window');
                        itemWindow.innerHTML = '<button class="back-to-command">戻る</button>';
                        for(const itemName in gameState.inventory) {
                            if (gameState.inventory[itemName] > 0 && ITEM_MASTER_DATA[itemName].target) {
                                const item = ITEM_MASTER_DATA[itemName];
                                const btn = document.createElement('button');
                                btn.textContent = `${item.name} (x${gameState.inventory[itemName]})`;
                                btn.onclick = () => {
                                    gameState.battle.action = { type: 'item', actor, item };
                                    promptForTarget(item.target.includes('enemy') ? 'enemy' : 'ally');
                                };
                                itemWindow.insertBefore(btn, itemWindow.firstChild);
                            }
                        }
                        showBattleCommandUI('item');
                        break;
                }
            }
        });

        function promptForTarget(targetType) {
            showBattleCommandUI('target');
            const selector = targetType === 'enemy' ? '#monster-area .monster-info' : '#party-status-battle .party-member';
            document.querySelectorAll(selector).forEach(el => {
                const unit = targetType === 'enemy'
                    ? gameState.battle.monsters[el.dataset.index]
                    : getActivePartyMembers().find(p => p.id === el.dataset.id);
                if (unit && unit.hp > 0) el.classList.add('targetable');
            });
        }

        document.getElementById('monster-area').addEventListener('click', e => {
            const targetEl = e.target.closest('.monster-info.targetable');
            if (targetEl) {
                gameState.battle.action.target = gameState.battle.monsters[targetEl.dataset.index];
                document.querySelectorAll('.targetable').forEach(el => el.classList.remove('targetable'));
                executeTurn();
            }
        });
        document.getElementById('party-status-battle').addEventListener('click', e => {
            const targetEl = e.target.closest('.party-member.targetable');
            if (targetEl) {
                gameState.battle.action.target = gameState.roster.find(p => p.id === targetEl.dataset.id);
                document.querySelectorAll('.targetable').forEach(el => el.classList.remove('targetable'));
                executeTurn();
            }
        });
    }

    // ========================================================================
    // 初期化
    // ========================================================================
    resetGameState();
    initEventListeners();
    showScreen('title-screen');
});

