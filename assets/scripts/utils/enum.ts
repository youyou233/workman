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