let resConfig = {
    altasArr: ['main', 'battle', 'monster', 'bg'],
    jsonArr: ['role', 'skill', 'buff', 'monster', 'area'],
    prefabArr: ['cardItem', 'landItem', 'monsterItem', 'bossItem', 'throwItem', 'commonItem', 'effectItem', 'damageLabel', 'iconItem', 'giftItem',
        'shopItem', 'rewardItem', 'areaItem']
}

let uiName = {
    messageBox: 'messagebox_ui',
    rankUI: 'rank_ui',
    roleInfoUI: 'role_info_ui',
    mixUI: 'mix_ui',
    rewardUI: 'reward_ui',

}

let aniConfig = {
    'effect_1': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_2': {
        sample: 6, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_3': {
        sample: 3, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_4': {
        sample: 3, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_5': {
        sample: 5, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_6': {
        sample: 6, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_7': {
        sample: 6, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_8': {
        sample: 6, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_9': {
        sample: 6, speed: 3, wrapMode: cc.WrapMode.Normal
    },
    'effect_10': {
        sample: 4, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_11': {
        sample: 4, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_12': {
        sample: 4, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_13': {
        sample: 4, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_14': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_15': {
        sample: 5, speed: 3, wrapMode: cc.WrapMode.Normal
    }, 'effect_16': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_17': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_18': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    }, 'effect_19': {
        sample: 6, speed: 1, wrapMode: cc.WrapMode.Normal
    },
    'effect_21': {
        sample: 8, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_22': {
        sample: 5, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_23': {
        sample: 6, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_24': {
        sample: 6, speed: 2, wrapMode: cc.WrapMode.Normal
    },
    'effect_icon': {
        sample: 8, speed: 2, wrapMode: cc.WrapMode.Loop
    }
}

let lvString = ['初窥门径', '略知一二', '粗通皮毛', '半生不熟', '渐入佳境', '了然于胸', '心领神会', '炉火纯青', '融会贯通',
    '略有小成', '出类拔萃', '运斤成风', '技冠群雄', '登峰造极', '鬼斧神工', '出神入化', '震古烁今', '绝代宗师', '巧夺天工', '举世无双']
let version = '0.0.1'

export default { resConfig, uiName, aniConfig }