const JOB_MASTER_DATA = {
    '戦士': { tier: 1, hp: 'A', mp: 'E', str: 'A', vit: 'B', int: 'E', mnd: 'D', agi: 'C', luk: 'C', skills: ['スラッシュ', 'パワーアップ'] },
    '魔法使い': { tier: 1, hp: 'D', mp: 'A', str: 'E', vit: 'D', int: 'A', mnd: 'B', agi: 'C', luk: 'C', skills: ['ファイアボール'] },
    '僧侶': { tier: 1, hp: 'C', mp: 'B', str: 'D', vit: 'C', int: 'B', mnd: 'A', agi: 'D', luk: 'B', skills: ['ヒール', 'プロテス', 'リジェネ'] },
    '盗賊': { tier: 1, hp: 'C', mp: 'D', str: 'C', vit: 'D', int: 'D', mnd: 'C', agi: 'A', luk: 'S', skills: ['スティール'] },
    '狩人': { tier: 1, hp: 'B', mp: 'C', str: 'B', vit: 'C', int: 'D', mnd: 'C', agi: 'B', luk: 'D', skills: ['ダブルショット'] },

    // Tier 2 Jobs
    'パラディン': { tier: 2, requirements: { '戦士': 20, '僧侶': 20 }, hp: 'S', mp: 'D', str: 'A', vit: 'A', int: 'E', mnd: 'C', agi: 'D', luk: 'C', skills: ['シールドバッシュ', 'メガヒール'] },
    '賢者': { tier: 2, requirements: { '魔法使い': 20, '僧侶': 20 }, hp: 'D', mp: 'S', str: 'E', vit: 'D', int: 'A', mnd: 'A', agi: 'C', luk: 'B', skills: ['ジャッジメント', 'エリアヒール'] },
};
