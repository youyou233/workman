import { AtkType, SkillType, SelfStackType } from "../utils/enum"
import JsonManager from "../manager/json_manager"
import LandItem from "../item/land_item"

export class Role {
    atkType: AtkType = AtkType.normol
    atkCD: number = 0
    atk: number = 0
    id: number = 0
    constructor(id: number) {
        let roleData = JsonManager.instance.getDataByName('role')[id]
        this.id = id
        this.atkType = roleData.atkType
        this.atkCD = roleData.atkCD
        this.atk = roleData.atk
    }

    getAtkDamege(land: LandItem) {
        let rate = 1
        rate += this.getAllBuffStr(land.buffMap, 'atk')
        rate += this.getSkillStr(land, SelfStackType.atk)
        return this.atk * land.stack * rate
    }

    getAtkCD(land: LandItem) {
        return this.atkCD - this.getSkillStr(land, SelfStackType.atkSpd)
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
                        return (land.stack - 1) * skillData.param.num / 100
                    case SelfStackType.atkSpd:
                        return (land.stack - 1) * skillData.param.num
                }
                break
        }
        return 0
    }
}