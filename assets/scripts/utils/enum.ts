export enum ResType {
    main,
    battle,
    monster,
    bg
}

export enum RoleActionType {
    idle,//012
    atk,//345
    throw,//48 12 49 13
    success,//15 16 17
    sing,//18 19 20
    shot,//21 22 23
    fail,//21
    death//51
}

export enum BattleStatusType {
    before,
    play,
    pause,
    end
}
export enum TouchStatusType {
    unTouch,
    touching,//稍稍长按拽起人物
    clicked,//短暂点击选中人物
}

export enum BossStatusType {
    move,
    skill
}

export enum AtkType {
    none = 0,
    normol = 1,//普通扔东西
    range = 2,
    randomRange = 3,
    chain = 4,//立即释放
    random = 5,
    melee = 6,
    randomMelee = 7,
}
export enum SkillType {
    none = 0,
    selfStack = 1,//自身星星叠加
    addBuff = 2,//增加buff
    enemyBuff = 3,//给敌人加debuff
    intervalGenerate = 4,//间隔生产
    roundBuff = 5,//给周围加buff
    merge = 6,//合成技能
    debuffMultDamage = 7,//异常状态增伤
    debuffKillExplosion = 8,//异常状态死亡爆炸
    mergeGenerate = 9,
    skillGenerate = 10,
    reputation = 11,
    kill = 12,
    sameRoleStar = 13,
    switch = 14,
    bingo = 15,
    mergeProduct = 16,//合成时生成阳光
    purify = 17,
    bossKill = 18,
    wuke = 19,
    killSteal = 20,
    crit = 21,
    changeRole = 22
}

export enum SelfStackType {
    atkSpd = 1,
    atk = 2
}

export enum SkillTargetType {
    singleEnemy = 1,//单个敌人
    group = 2,//自己全体
    around = 3
}

export enum BattleType {
    normal = 1,
    boss = 2,
    unlimited = 3
}

export enum ArrType {
    up = 1,
    down = 2,
    left = 3,
    right = 4
}
export enum SysType {
    bgm = 1,
    fx = 2,
    damageLabel = 3,
    effect = 4//特效
}

export enum GuideType {
    battle = 1,
    group = 2,
    main = 3,
    main2 = 4
}