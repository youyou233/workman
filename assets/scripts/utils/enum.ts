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
    sameStar = 14,
    bingo = 15
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