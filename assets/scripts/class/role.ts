import { AtkType, SkillType, SelfStackType } from "../utils/enum"
import JsonManager from "../manager/json_manager"
import LandItem from "../item/land_item"
import BattleManager from "../manager/battle_manager"
import { Utils } from "../utils/utils"

export class Role {
    atkType: AtkType = AtkType.normol
    atkCD: number = 0
    atk: number = 0
    id: number = 0
    lv: number = 0
    roleData: any = null
    constructor(id: number, lv: number) {
        this.roleData = JsonManager.instance.getDataByName('role')[id]
        this.id = id
        this.lv = lv
        this.atkType = this.roleData.atkType
        this.atkCD = this.roleData.atkCD
        this.atk = this.roleData.atk
    }

    getAtkDamege(land: LandItem) {
        let rate = 1
        let add = 0
        rate += this.getAllBuffStr(land.buffMap, 'atk')
        rate += this.getSkillStr(land, SelfStackType.atk)
        if (this.id == 12) {
            add = BattleManager.instance.sun * (2.5 + land.stack * 0.3) / 100
        }

        //  console.log(this.atk * land.stack * rate)
        return ((this.atk * Math.pow(1.2, this.lv - 1) + add) * land.stack * rate).toFixed(0)
    }

    getAtkCD(land: LandItem) {
        // return 0.1
        let cd = this.atkCD / (1 + this.getAllBuffStr(land.buffMap, 'atkspd') + this.getSkillStr(land, SelfStackType.atkSpd))
        //  console.log(cd)
        return cd
    }

    getAtkType() {
        //暂时没有可以改变攻击类型的Buff和被动
        return this.atkType
    }
    /**
     * 计算所有Buff中是否有当前字段的增益 有则返回增益数量
     * @param str 
     */
    getAllBuffStr(buffMap, str) {
        for (let buffId in buffMap) {
            let buffData = JsonManager.instance.getDataByName('buff')[buffId]
            if (buffData.param.str == str) {
                return buffData.param.num / 100 + buffData.param.add / 100 * buffMap[buffId].lv
            }
        }
        return 0
    }
    getSkillStr(land, type: SelfStackType) {
        //计算Skill中是否有当前字段的增益
        let skillData = JsonManager.instance.getDataByName('skill')[this.id]
        switch (skillData.skillType) {
            case SkillType.selfStack:
                switch (skillData.param.type) {
                    case SelfStackType.atk:
                        return (land.stack - 1) * skillData.param.num
                    case SelfStackType.atkSpd:
                        return (land.stack - 1) * skillData.param.num
                }
                break
            case SkillType.sameRoleStar:
                if (this.id == 15 && skillData.param.type == SelfStackType.atk) {
                    let list = BattleManager.instance.getSameRole(this.id)
                    let add = -1
                    list.forEach((item: LandItem) => {
                        add += skillData.param.num * item.stack
                    })
                    return add
                }
            case SkillType.bingo:
                switch (type) {
                    case SelfStackType.atk:
                        if (BattleManager.instance.checkBingo(land)[0]) {
                            return skillData.param.row
                        }
                        break
                    case SelfStackType.atkSpd:
                        if (BattleManager.instance.checkBingo(land)[1]) {
                            return skillData.param.col
                        }
                        break
                }
                break
        }
        return 0
    }
    isCri(land: LandItem) {
        //暴击率 判断是否能暴击 如果能暴击则判断暴击率 
        let chance = false
        switch (this.roleData.typeName) {
            case '攻击型角色':
                if (this.id == 28) {
                    let skillData = JsonManager.instance.getDataByName('skill')[this.id]
                    chance = Utils.getRandomNumber(1000) < skillData.param.num * 10 + skillData.param.add * land.stack * 10
                } else {
                    chance = Utils.getRandomNumber(1000) < 25
                }
        }
        return chance
    }
    getAtkRange(land: LandItem) {
        switch (this.roleData.atkType) {
            case AtkType.range:
                return this.roleData.param.range
            case AtkType.randomRange:
                let skillData = JsonManager.instance.getDataByName('skill')[this.id]
                return skillData.param.num + (land.stack - 1) * skillData.param.add
        }
    }
    haveOtherSkill() {
        let skillData = JsonManager.instance.getDataByName('skill')[this.id]
        switch (skillData.skillType) {
            case SkillType.intervalGenerate:
            case SkillType.purify:
                return true
        }
        return false
    }
    isAroundBuff(lv?: number) {
        let skillData = JsonManager.instance.getDataByName('skill')[this.id]
        switch (skillData.skillType) {
            case SkillType.roundBuff:
                return [skillData.param.buff, { time: 2, lv }]
        }
        return false
    }
    getMergeData() {
        let skillData = JsonManager.instance.getDataByName('skill')[this.id]
        switch (skillData.skillType) {
            case SkillType.merge:
                return [skillData.param.stack, skillData.param.id]
        }
        return [true, true]
    }
    checkSpike(land: LandItem) {
        if (this.id == 13) {
            return Utils.getRandomNumber(1000) < 15 + 4 * land.stack
        }
        if (land.buffMap[7]) {
            return Utils.getRandomNumber(1000) < 15 + 4 * land.buffMap[7].lv
        }
        return false
    }
}