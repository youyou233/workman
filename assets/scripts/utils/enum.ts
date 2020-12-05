export enum ResType {
    main,
    battle,
    monster
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
    normol = 1,
    range = 2
}
export enum SkillType {
    selfStack = 1,//自身星星叠加
    addBuff = 2,//增加buff
    enemyBuff = 3,//给敌人加debuff
    intervalGenerate = 4,//间隔生产
}

export enum SelfStackType {
    atkSpd = 1,
    atk = 2
}

export enum SkillTargetType {
    singleEnemy = 1,//单个敌人
    group = 2,//自己全体
}