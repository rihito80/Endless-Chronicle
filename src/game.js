document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // 1. データ定義 (企画書 2章準拠)
    // ========================================================================

    // ========================================================================
    // 2. ゲーム状態管理
    // ========================================================================

    let gameState = {};
    const initialGameState = {
        roster: [],
        party: [],
        inventory: { 'やくそう': 5, 'こん棒': 1, '布の服': 1, '皮の帽子': 1 },
        gold: 100,
        currentScreen: 'title',
        battle: null,
        dungeon: null,
        gachaRecruit: null,
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
        const raceKeys = Object.keys(RACE_MASTER_DATA);
        const traitKeys = Object.keys(TRAIT_MASTER_DATA);
        const char = {
            id: `char${Date.now()}`, name, level: 1, exp: 0, job,
            hp: 100, maxHp: 100, mp: 10, maxMp: 10,
            stats: { str: 10, vit: 10, int: 5, mnd: 5, agi: 7, luk: 5 },
            race: raceKeys[Math.floor(Math.random() * raceKeys.length)],
            traits: [traitKeys[Math.floor(Math.random() * traitKeys.length)]],
            skillPoints: 0,
            skills: [...JOB_MASTER_DATA[job].skills],
            learnedSkillTreeNodes: [], // スキルツリーでの習得済みノードを記録
            equipment: { weapon: null, head: null, torso: null, hands: null, feet: null, accessory: null },
            jobHistory: [{ job: job, level: 1 }],
            jobProgress: {}, // 職業ごとの進捗を保存
            permanentBonus: { hp: 0, mp: 0, str: 0, vit: 0, int: 0, mnd: 0, agi: 0, luk: 0 },
            reincarnationCount: 0,
            statusAilments: [],
            buffs: [], // バフ・デバフを格納する配列
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

        // 4. 種族によるボーナス
        const race = RACE_MASTER_DATA[character.race];
        if (race && race.stats) {
            for (const stat in race.stats) {
                total[stat] = (total[stat] || 0) + race.stats[stat];
            }
        }

        // 5. 特性によるボーナス
        if (character.traits) {
            character.traits.forEach(traitKey => {
                const trait = TRAIT_MASTER_DATA[traitKey];
                if (trait && trait.stats) {
                    for (const stat in trait.stats) {
                        total[stat] = (total[stat] || 0) + trait.stats[stat];
                    }
                }
            });
        }

        // 6. バフ・デバフによるボーナス
        if (character.buffs) {
            character.buffs.forEach(buffInstance => {
                const buffData = BUFF_DEBUFF_MASTER_DATA[buffInstance.id];
                if (buffData && buffData.stat && total[buffData.stat]) {
                    total[buffData.stat] = Math.round(total[buffData.stat] * buffData.modifier);
                }
            });
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
        const newJobData = JOB_MASTER_DATA[newJob];
        if (!newJobData || !checkJobRequirements(character, newJobData)) {
            return false;
        }

        // 1. Save current job progress
        character.jobProgress[character.job] = {
            level: character.level,
            exp: character.exp,
            skills: [...character.skills],
            learnedSkillTreeNodes: [...character.learnedSkillTreeNodes],
            stats: {...character.stats}, // Save base stats too
            maxHp: character.maxHp,
            maxMp: character.maxMp,
        };

        // Add to job history for requirement checking, if it's not already there at a lower level
        const historyIndex = character.jobHistory.findIndex(h => h.job === character.job);
        if (historyIndex > -1) {
            if (character.level > character.jobHistory[historyIndex].level) {
                character.jobHistory[historyIndex].level = character.level;
            }
        } else {
            character.jobHistory.push({ job: character.job, level: character.level });
        }


        // 2. Load new job progress or initialize it
        character.job = newJob;
        const savedProgress = character.jobProgress[newJob];

        if (savedProgress) {
            // Load from progress
            character.level = savedProgress.level;
            character.exp = savedProgress.exp;
            character.skills = [...savedProgress.skills];
            character.learnedSkillTreeNodes = [...savedProgress.learnedSkillTreeNodes];
            character.stats = {...savedProgress.stats};
            character.maxHp = savedProgress.maxHp;
            character.maxMp = savedProgress.maxMp;
        } else {
            // Initialize new job
            const baseChar = createCharacter("temp", newJob);
            character.level = 1;
            character.exp = 0;
            character.skills = [...baseChar.skills];
            character.learnedSkillTreeNodes = [];
            character.stats = { ...baseChar.stats };
            character.maxHp = baseChar.maxHp;
            character.maxMp = baseChar.maxMp;
        }

        // 3. Refresh HP/MP
        character.hp = getTotalStats(character).maxHp;
        character.mp = getTotalStats(character).maxMp;

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
        if (!item || !['weapon', 'head', 'torso', 'hands', 'feet', 'accessory'].includes(item.type)) return;

        // Check for job restrictions
        if (item.jobRestriction && !item.jobRestriction.includes(character.job)) {
            alert(`この装備は ${item.jobRestriction.join('か')} のキャラクターのみが装備できます。`);
            return;
        }

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

    function unequipItem(character, slot) {
        const itemName = character.equipment[slot];
        if (!itemName) return;

        // Add item back to inventory
        gameState.inventory[itemName] = (gameState.inventory[itemName] || 0) + 1;
        // Remove from character's equipment
        character.equipment[slot] = null;

        // Refresh the screen
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

    function getBuyPrice(item) {
        const rarity = RARITY_MASTER_DATA[item.rarity];
        if (!rarity) return item.buyPrice;
        return Math.round(item.buyPrice * rarity.priceMultiplier);
    }

    function getSellPrice(item) {
        const rarity = RARITY_MASTER_DATA[item.rarity];
        if (!rarity) return item.sellPrice;
        return Math.round(item.sellPrice * rarity.priceMultiplier);
    }

    function buyItem(itemName) {
        const item = ITEM_MASTER_DATA[itemName];
        if (!item || !item.buyPrice) return;
        const price = getBuyPrice(item);

        if (gameState.gold >= price) {
            gameState.gold -= price;
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
        const price = getSellPrice(item);

        gameState.gold += price;
        gameState.inventory[itemName]--;

        if (gameState.inventory[itemName] <= 0) {
            delete gameState.inventory[itemName];
        }

        openShopScreen(); // UIを更新
    }

    function openShopScreen() {
        document.getElementById('player-gold').textContent = `💰 ${gameState.gold.toLocaleString()}`;

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

            const rarity = RARITY_MASTER_DATA[item.rarity];
            const rarityInfo = rarity ? `<span style="color: ${rarity.color}; font-weight: bold;">[${rarity.name}]</span> ` : '';

            const buyPrice = getBuyPrice(item);
            const sellPrice = getSellPrice(item);

            const mainText = isBuying
                ? `${rarityInfo}${item.name} (${buyPrice}G)`
                : `${rarityInfo}${item.name} (x${quantity}) - 売値: ${sellPrice}G`;

            entryDiv.innerHTML = `
                <div style="flex-grow: 1; overflow: hidden;">
                    <span style="word-break: break-all;">${mainText}</span>
                    <div class="skill-desc" style="font-size: 12px; opacity: 0.8; margin-top: 4px; word-break: break-all;">${details}</div>
                </div>
            `;

            const btn = document.createElement('button');
            if (isBuying) {
                btn.textContent = '購入';
                btn.disabled = gameState.gold < buyPrice;
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
                ❤️ HP: ${p.hp}/${pStats.maxHp} | 💧 MP: ${p.mp}/${pStats.maxMp}
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
            let buffIcons = m.buffs.map(b => BUFF_DEBUFF_MASTER_DATA[b.id]?.icon || '').join('');
            monsterArea.innerHTML += (m.hp > 0) ?
                `<div class="monster-info" data-index="${index}">${m.name} ${statusIcons}${buffIcons}<br>HP: ${m.hp}/${m.maxHp}</div>` :
                `<div class="monster-info defeated">${m.name}<br>倒した</div>`;
        });

        const partyStatus = document.getElementById('party-status-battle');
        partyStatus.innerHTML = '';
        getActivePartyMembers().forEach((p) => {
            const pStats = getTotalStats(p);
            let statusIcons = p.statusAilments.map(s => STATUS_AILMENTS[s.type.toUpperCase()]?.icon || '').join('');
            let buffIcons = p.buffs.map(b => BUFF_DEBUFF_MASTER_DATA[b.id]?.icon || '').join('');
             partyStatus.innerHTML += `
                <div class="party-member ${p === gameState.battle.activeCharacter ? 'active-turn' : ''}" data-id="${p.id}">
                     <strong>${p.name} ${statusIcons}${buffIcons}</strong> (Lv.${p.level})<br>
                     ❤️ HP: ${p.hp}/${pStats.maxHp} | 💧 MP: ${p.mp}/${pStats.maxMp}
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
            const variance = monsterData.statVariance || 0.1;
            const stats = {
                str: monsterData.str,
                vit: monsterData.vit,
                int: monsterData.int,
                mnd: monsterData.mnd,
                agi: monsterData.agi,
                luk: monsterData.luk || 5,
            };

            for (const stat in stats) {
                const randomFactor = 1 + (Math.random() * 2 - 1) * variance;
                stats[stat] = Math.round(stats[stat] * randomFactor);
            }

            const isRare = Math.random() < 0.1; // 10% chance to be rare
            if (isRare) {
                monsterData.name = `Rare ${monsterData.name}`;
                monsterData.exp = Math.round(monsterData.exp * 2);
                for (const stat in stats) {
                    stats[stat] = Math.round(stats[stat] * 1.5);
                }
                monsterData.hp = Math.round(monsterData.hp * 1.5);
            }

            return {
                ...monsterData,
                id: `monster${Date.now()}${index}`,
                maxHp: monsterData.hp,
                stats: stats,
                permanentBonus: {},
                statusAilments: [],
                buffs: [],
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

    function applyBuff(character, buffId) {
        const buffData = BUFF_DEBUFF_MASTER_DATA[buffId];
        if (!buffData) return;

        // すでに同じバフ/デバフがかかっているか確認
        const existingBuff = character.buffs.find(b => b.id === buffId);
        if (existingBuff) {
            // かかっている場合はターン数をリセット
            existingBuff.turns = buffData.turns;
        } else {
            // かかっていない場合は新しく追加
            character.buffs.push({ id: buffId, turns: buffData.turns });
        }
    }

    function applyEndOfTurnEffects(character) {
        let effectMessages = [];
        const ailmentsToRemove = [];
        const buffsToRemove = [];

        // 1. 状態異常の処理
        character.statusAilments.forEach(ailment => {
            // 毒ダメージ
            if (ailment.type === STATUS_AILMENTS.POISON.id) {
                const poisonDamage = Math.max(1, Math.floor(getTotalStats(character).maxHp * 0.05));
                character.hp = Math.max(0, character.hp - poisonDamage);
                effectMessages.push({
                    message: `${character.name}は毒のダメージを受けた！ (${poisonDamage})`,
                    className: 'log-damage'
                });
            }

            // ターン経過
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

        // 2. バフ・デバフの処理
        character.buffs.forEach(buff => {
            const buffData = BUFF_DEBUFF_MASTER_DATA[buff.id];
            if (!buffData) return;

            // リジェネ効果
            if (buffData.effect === 'regen_hp') {
                const healAmount = Math.max(1, Math.floor(getTotalStats(character).maxHp * buffData.value));
                character.hp = Math.min(getTotalStats(character).maxHp, character.hp + healAmount);
                 effectMessages.push({
                    message: `${character.name}はリジェネでHPが${healAmount}回復した。`,
                    className: 'log-heal'
                });
            }

            // ターン経過
            buff.turns--;
            if (buff.turns <= 0) {
                buffsToRemove.push(buff.id);
                effectMessages.push({
                    message: `${character.name}の${buffData.name}の効果が切れた。`,
                    className: 'log-info'
                });
            }
        });


        // 3. 期限切れの効果を削除
        if (ailmentsToRemove.length > 0) {
            character.statusAilments = character.statusAilments.filter(a => !ailmentsToRemove.includes(a.type));
        }
        if (buffsToRemove.length > 0) {
            character.buffs = character.buffs.filter(b => !buffsToRemove.includes(b.id));
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

        // Status Ailment Check (Paralysis, Stun)
        const isImmobilized = active.statusAilments.find(s => s.type === STATUS_AILMENTS.PARALYSIS.id || s.type === STATUS_AILMENTS.STUN.id);
        if (isImmobilized && Math.random() < 0.5) { // 50% chance to be immobilized
            const ailmentName = Object.values(STATUS_AILMENTS).find(a => a.id === isImmobilized.type)?.name || '状態異常';
            logMessage(`${active.name}は${ailmentName}で動けない！`, 'battle', { className: 'log-info' });
            setTimeout(() => {
                 applyEndOfTurnEffects(active);
                 gameState.battle.turnIndex = (gameState.battle.turnIndex + 1) % gameState.battle.turnOrder.length;
                 nextTurn();
            }, 1000);
            return;
        }


        if (active.job) {
            // Player turn
            // Re-enable command buttons
            document.querySelectorAll('#command-window button').forEach(btn => btn.disabled = false);

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

                    // 2回攻撃スキルの特別処理
                    if (action.skill.target === 'double_attack') {
                        const target = targets[0];
                        if (target) {
                            for (let i = 0; i < 2; i++) {
                                if (target.hp > 0) {
                                    const damageResult = { damage: Math.round(calculatePhysicalDamage(actor, target) * action.skill.power), multiplier: ELEMENT_RELATIONSHIPS.NORMAL };
                                    target.hp = Math.max(0, target.hp - damageResult.damage);
                                    message += ` ${target.name}に${damageResult.damage}のダメージ！`;
                                    if(target.hp <= 0) {
                                        message += ` ${target.name}を倒した！`;
                                        break; // ターゲットが倒れたら攻撃を止める
                                    }
                                }
                            }
                            className = 'log-damage';
                        }
                    } else {
                        // 通常のスキル処理
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

                            // Apply buffs from skill
                            if (action.skill.appliesBuff) {
                                action.skill.appliesBuff.forEach(buffId => {
                                    applyBuff(target, buffId);
                                    const buffData = BUFF_DEBUFF_MASTER_DATA[buffId];
                                    if(buffData) {
                                       message += ` ${target.name}に${buffData.name}の効果！`;
                                    }
                                });
                            }
                        });
                    }
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
        applyEndOfTurnEffects(actor);

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
            let baseExpGained = 0, baseGoldGained = 0, allDrops = [];
            let expBonus = 1.0, goldBonus = 1.0;

            // Calculate bonuses from equipment
            getActivePartyMembers().forEach(p => {
                if (p.hp <= 0) return; // Skip dead members
                Object.values(p.equipment).forEach(itemName => {
                    if (itemName) {
                        const itemData = ITEM_MASTER_DATA[itemName];
                        if (itemData && itemData.specialEffects) {
                            itemData.specialEffects.forEach(effect => {
                                if (effect.effect === 'exp_gain_up') {
                                    expBonus += effect.value;
                                } else if (effect.effect === 'gold_gain_up') {
                                    goldBonus += effect.value;
                                }
                            });
                        }
                    }
                });
            });


            const partyLuck = getActivePartyMembers().reduce((sum, p) => sum + getTotalStats(p).luk, 0);
            const luckFactor = 1 + (partyLuck / 200);

            gameState.battle.monsters.forEach(m => {
                baseExpGained += m.exp;
                baseGoldGained += m.gold || 0;
                if (m.drops) {
                    m.drops.forEach(drop => {
                        if (Math.random() < drop.chance * luckFactor) {
                            allDrops.push(drop.itemName);
                        }
                    });
                }
            });

            const finalExpGained = Math.round(baseExpGained * expBonus);
            const finalGoldGained = Math.round(baseGoldGained * goldBonus);
            gameState.gold += finalGoldGained;

            resultText.innerHTML += `<p class="log-info">${finalExpGained} の経験値を獲得した。</p>`;
            if(finalGoldGained > 0) {
                resultText.innerHTML += `<p class="log-item">${finalGoldGained}G を手に入れた。</p>`;
            }

            getActivePartyMembers().forEach((p, index) => {
                if (p.hp > 0) {
                    p.exp += finalExpGained;
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

            allDrops.forEach(dropName => {
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

                // --- Data Migration Logic ---
                // Add new properties to characters if they don't exist in the save file.
                gameState.roster.forEach(char => {
                    if (!char.buffs) {
                        char.buffs = [];
                    }
                    if (!char.jobProgress) {
                        char.jobProgress = {};
                        // Save the current job's state into the new structure
                        // Note: We can't reconstruct history, but we can preserve the current state.
                        char.jobProgress[char.job] = {
                            level: char.level,
                            exp: char.exp,
                            skills: [...char.skills],
                            learnedSkillTreeNodes: [...char.learnedSkillTreeNodes],
                            stats: {...char.stats},
                            maxHp: char.maxHp,
                            maxMp: char.maxMp,
                        };
                    }
                    if (!char.jobHistory) {
                        char.jobHistory = [{ job: char.job, level: char.level }];
                    }
                    // Migrate old armor slot to new slots
                    if (char.equipment && char.equipment.armor !== undefined) {
                        if (!char.equipment.torso) {
                           char.equipment.torso = char.equipment.armor;
                        }
                        delete char.equipment.armor;
                        if (char.equipment.head === undefined) char.equipment.head = null;
                        if (char.equipment.hands === undefined) char.equipment.hands = null;
                        if (char.equipment.feet === undefined) char.equipment.feet = null;
                    }
                });
                // --- End Migration Logic ---

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
        const race = RACE_MASTER_DATA[character.race];
        const traits = character.traits.map(t => TRAIT_MASTER_DATA[t].name).join(', ');
        document.getElementById('char-detail-header').innerHTML = `<h2>${character.name} <small>(${character.job} Lv.${character.level})</small></h2>
        <p><strong>種族:</strong> ${race.name} | <strong>特性:</strong> ${traits}</p>`;

        const statsContainer = document.getElementById('char-detail-stats');
        statsContainer.innerHTML = `
            <span>❤️ HP: ${character.hp} / ${stats.maxHp}</span>
            <span>💧 MP: ${character.mp} / ${stats.maxMp}</span>
            <span>⚔️ STR: ${stats.str}</span><span>🛡️ VIT: ${stats.vit}</span>
            <span>🧙 INT: ${stats.int}</span><span>🙏 MND: ${stats.mnd}</span>
            <span>🏃 AGI: ${stats.agi}</span><span>🍀 LUK: ${stats.luk}</span>
        `;

        // EXPバーを更新
        const nextLevelExp = getNextLevelExp(character.level);
        const expPercentage = Math.round((character.exp / nextLevelExp) * 100);
        document.getElementById('char-detail-exp-fill').style.width = `${expPercentage}%`;
        document.getElementById('char-detail-exp-text').textContent = `${character.exp} / ${nextLevelExp}`;

        const equipContainer = document.getElementById('char-detail-equipment');
        equipContainer.innerHTML = '';
        const slotEmojis = { weapon: '🗡️', head: '🎓', torso: '👕', hands: '🧤', feet: '👢', accessory: '💍' };
        ['weapon', 'head', 'torso', 'hands', 'feet', 'accessory'].forEach(slot => {
            const itemName = character.equipment[slot];
            const slotDiv = document.createElement('div');
            slotDiv.className = 'equip-slot';

            let content = `<span>${slotEmojis[slot]} ${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                           <span>${itemName || 'なし'}</span>`;

            if (itemName) {
                const unequipBtn = document.createElement('button');
                unequipBtn.textContent = '外す';
                unequipBtn.onclick = () => unequipItem(character, slot);
                slotDiv.innerHTML = content;
                slotDiv.appendChild(unequipBtn);
            } else {
                slotDiv.innerHTML = content;
            }
            equipContainer.appendChild(slotDiv);
        });

        const inventoryContainer = document.getElementById('char-detail-inventory');
        inventoryContainer.innerHTML = '';
        for (const itemName in gameState.inventory) {
            const item = ITEM_MASTER_DATA[itemName];
            if (['weapon', 'head', 'torso', 'hands', 'feet', 'accessory'].includes(item.type)) {
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
                if (item.jobRestriction && !item.jobRestriction.includes(character.job)) {
                    equipBtn.disabled = true;
                    equipBtn.title = `この装備は ${item.jobRestriction.join('か')} のキャラクターのみが装備できます。`;
                }
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

    function updateGachaRecruitUI() {
        const char = gameState.gachaRecruit;
        if (!char) return;

        const display = document.getElementById('gacha-result-display');
        const stats = getTotalStats(char);
        const race = RACE_MASTER_DATA[char.race];
        const traits = char.traits.map(t => TRAIT_MASTER_DATA[t].name).join(', ');

        display.innerHTML = `
            <p><strong>ジョブ:</strong> ${char.job}</p>
            <p><strong>種族:</strong> ${race.name} | <strong>特性:</strong> ${traits}</p>
            <p><strong>ステータス:</strong></p>
            <ul>
                <li>❤️ HP: ${stats.maxHp}</li>
                <li>💧 MP: ${stats.maxMp}</li>
                <li>⚔️ STR: ${stats.str}</li>
                <li>🛡️ VIT: ${stats.vit}</li>
                <li>🧙 INT: ${stats.int}</li>
                <li>🙏 MND: ${stats.mnd}</li>
                <li>🏃 AGI: ${stats.agi}</li>
                <li>🍀 LUK: ${stats.luk}</li>
            </ul>
        `;
    }

    function startGachaRecruitment() {
        // Create a temporary character. The name will be set later.
        const jobKeys = Object.keys(JOB_MASTER_DATA);
        const randomJob = jobKeys[Math.floor(Math.random() * jobKeys.length)];
        gameState.gachaRecruit = createCharacter('（まだ仲間になっていない）', randomJob);

        updateGachaRecruitUI();
        document.getElementById('gacha-name-input-section').classList.add('hidden');
        document.getElementById('gacha-recruit-buttons').classList.remove('hidden');
        showScreen('gacha-recruit-screen');
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
            btn.onclick = () => selectCharacterForJobChange(char);
            charList.appendChild(btn);
        });
        showScreen('temple-screen');
    }

    function getJobMaxLevels(character) {
        const maxLevels = {};

        // 1. Check saved progress in jobProgress
        for (const jobName in character.jobProgress) {
            const level = character.jobProgress[jobName].level;
            if (!maxLevels[jobName] || level > maxLevels[jobName]) {
                maxLevels[jobName] = level;
            }
        }

        // 2. Check current job's level
        if (!maxLevels[character.job] || character.level > maxLevels[character.job]) {
            maxLevels[character.job] = character.level;
        }

        // 3. Check jobHistory for backward compatibility with older saves
        if (character.jobHistory) {
            character.jobHistory.forEach(record => {
                if (!maxLevels[record.job] || record.level > maxLevels[record.job]) {
                    maxLevels[record.job] = record.level;
                }
            });
        }
        return maxLevels;
    }

    function checkJobRequirements(character, jobData) {
        if (!jobData.requirements) {
            // Tier 1 jobs are available if the character is level 10 or higher.
            return character.level >= 10;
        }

        const maxLevels = getJobMaxLevels(character);

        for (const requiredJob in jobData.requirements) {
            const requiredLevel = jobData.requirements[requiredJob];
            if ((maxLevels[requiredJob] || 0) < requiredLevel) {
                return false; // Did not meet a requirement
            }
        }
        return true; // All requirements met
    }

    function selectCharacterForJobChange(character) {
        document.getElementById('job-change-options').classList.remove('hidden');
        const jobSelect = document.getElementById('new-job-select');
        jobSelect.innerHTML = ''; // Clear previous options

        const availableJobs = Object.keys(JOB_MASTER_DATA).filter(jobName => {
            if (jobName === character.job) return false;

            const jobData = JOB_MASTER_DATA[jobName];
            return checkJobRequirements(character, jobData);
        });

        if (availableJobs.length > 0) {
            availableJobs.forEach(jobName => {
                const option = document.createElement('option');
                option.value = jobName;
                option.textContent = jobName;
                jobSelect.appendChild(option);
            });
        } else {
            jobSelect.innerHTML = '<option>転職できる職業がありません</option>';
        }

        // Update info text and button logic when selection changes
        const updateInfo = () => {
            const selectedJobName = jobSelect.value;
            const selectedJobData = JOB_MASTER_DATA[selectedJobName];
            let requirementsText = `<strong>${selectedJobName}</strong><br>転職条件: `;
            if (selectedJobData && selectedJobData.requirements) {
                requirementsText += Object.entries(selectedJobData.requirements)
                    .map(([job, level]) => `${job} Lv.${level}`)
                    .join(', ');
            } else if (selectedJobData) {
                 requirementsText += 'Lv.10 以上';
            } else {
                 requirementsText = '転職できる職業がありません';
            }

            document.getElementById('job-change-info').innerHTML = requirementsText;
            document.getElementById('execute-job-change-btn').disabled = availableJobs.length === 0;
        };

        jobSelect.onchange = updateInfo;
        updateInfo(); // Initial call

        document.getElementById('execute-job-change-btn').onclick = () => {
            if (performJobChange(character, jobSelect.value)) {
                logMessage(`${character.name} が ${jobSelect.value} に転職した！`, 'hub', { clear: true, className: 'log-levelup' });
                updateHubUI();
                showScreen('hub-screen');
            } else {
                alert('転職に失敗しました。');
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
        // Populate job dropdown
        const jobSelect = document.getElementById('char-job');
        jobSelect.innerHTML = ''; // Clear existing options
        for (const jobName in JOB_MASTER_DATA) {
            const option = document.createElement('option');
            option.value = jobName;
            option.textContent = jobName;
            jobSelect.appendChild(option);
        }

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
                const dungeon = DUNGEON_MASTER_DATA[key];
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.textContent = `${dungeon.name} (全${dungeon.depth}階) - 推奨Lv: ${dungeon.recommendedLevel}`;
                button.onclick = () => enterDungeon(dungeon);
                li.appendChild(button);
                list.appendChild(li);
            }
            showScreen('dungeon-select-screen');
        });

        document.getElementById('go-to-party-management-btn').addEventListener('click', openPartyManagementScreen);
        document.getElementById('go-to-shop-btn').addEventListener('click', openShopScreen);
        document.getElementById('recruit-member-btn').addEventListener('click', startGachaRecruitment);

        // Gacha Screen Listeners
        document.getElementById('reroll-recruit-btn').addEventListener('click', startGachaRecruitment);
        document.getElementById('back-to-party-from-gacha').addEventListener('click', openPartyManagementScreen);

        document.getElementById('accept-recruit-btn').addEventListener('click', () => {
            document.getElementById('gacha-recruit-buttons').classList.add('hidden');
            document.getElementById('gacha-name-input-section').classList.remove('hidden');
            document.getElementById('gacha-char-name').focus();
        });

        document.getElementById('confirm-recruit-name-btn').addEventListener('click', () => {
            const name = document.getElementById('gacha-char-name').value;
            if (!name) {
                alert('名前を入力してください。');
                return;
            }
            const newChar = gameState.gachaRecruit;
            newChar.name = name;
            gameState.roster.push(newChar);
            gameState.gachaRecruit = null;
            document.getElementById('gacha-char-name').value = '';

            logMessage(`${name} が仲間に加わった！`, 'hub', { className: 'log-levelup' });
            openPartyManagementScreen();
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
        document.getElementById('go-to-help-btn').addEventListener('click', () => showScreen('help-screen'));
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
                // メインコマンドのボタンを再有効化
                document.querySelectorAll('#command-window button').forEach(btn => btn.disabled = false);
                const active = gameState.battle.activeCharacter;
                // 沈黙状態ならスキルボタンは無効のまま
                if (active && active.statusAilments.some(s => s.type === STATUS_AILMENTS.SILENCE.id)) {
                    document.querySelector('button[data-command="skill"]').disabled = true;
                }
                showBattleCommandUI('command');
                return;
            }

            const commandBtn = e.target.closest('#command-window button');
            if(commandBtn && !commandBtn.disabled) {
                // Disable all command buttons to prevent multiple actions
                document.querySelectorAll('#command-window button').forEach(btn => btn.disabled = true);

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

