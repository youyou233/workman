import BattleManager from "../manager/battle_manager"
import ResourceManager from "../manager/resources_manager"
import { ResType, SkillType, SkillTargetType, TouchStatusType } from "../utils/enum"
import JsonManager from "../manager/json_manager"
import DD from "../manager/dynamic_data_manager"
import { BuffData } from "../interface/buff_data"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import UIManager from "../manager/ui_manager"
import OnskillUIManager from "../ui/onskill_ui_manager"
import config from "../utils/config"
import BattleUIManager from "../ui/battle_ui_manager"
import ChangeRoleUI from "../ui/change_role_ui"
import LandItem from "./land_item"
import AudioManager from "../manager/audio_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class CardItem extends cc.Component {
    index: number = 0

    @property(cc.Sprite)
    roleIcon: cc.Sprite = null
    @property(cc.Sprite)
    qualitySp: cc.Sprite = null
    @property(cc.ProgressBar)
    coolProgress: cc.ProgressBar = null
    @property(cc.Sprite)
    passiveSp: cc.Sprite = null
    // @property(cc.Label)
    // passiveLabel: cc.Label = null
    @property(cc.Node)
    costNode: cc.Node = null
    @property(cc.Label)
    costLabel: cc.Label = null
    data: any = null
    coolTimer: number = 0
    id: number = 0
    onLoad() {
        Emitter.register('message_' + MessageType.onSkill, (name) => {
            this.costLabel.string = 30 * Math.pow(BattleManager.instance.skillTimes, 2) + ''
        }, this)
    }
    init(index) {
        let roleId = BattleManager.instance.team[index].id
        this.id = roleId
        this.roleIcon.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'role_' + roleId
        )

        this.coolProgress.node.active = false
        this.data = JsonManager.instance.getDataByName('skill')[roleId]
        // this.skillSp.spriteFrame = ResourceManager.instance.getSprite(
        //     ResType.main, `skill_${roleId}`
        // )
        // this.cardBG.spriteFrame = ResourceManager.instance.getSprite(
        //     ResType.main, 'card_' + this.data.bgName
        // )
        this.passiveSp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, this.data.isActive ? 'skill_active' : 'skill_unactive'
        )
        let roleData = JsonManager.instance.getDataByName('role')[roleId]
        this.qualitySp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'rare_' + roleData.quality
        )
        this.costNode.active = this.data.isActive
        this.coolTimer = 0
        if (this.data.isActive) {
            this.qualitySp.node.y = 105
        } else {
            this.qualitySp.node.y = 60
        }
        // this.node.on('click', () => {
        //     UIManager.instance.LoadMessageBox(this.data.name, this.data.dec, null, null, false)
        // }, this)
    }
    onSkill() {
        if (!this.data.isActive && this.qualitySp.node.y == 60) return
        if (BattleManager.instance.sun < 30 * Math.pow(BattleManager.instance.skillTimes, 2)) {
            UIManager.instance.LoadTipsByStr('打工魂不足')
            return
        }
        switch (this.data.skillType) {
            case SkillType.addBuff:
                switch (this.data.param.targetType) {
                    case SkillTargetType.group:
                        let buffData: BuffData = {
                            time: this.data.param.time,
                            lv: 1 //DD.instance.roleMap[this.data.id]
                        }
                        Emitter.fire('MessageType_' + MessageType.addBuff,
                            this.data.param.buff, buffData
                        )
                        break
                }
                UIManager.instance.openUI(OnskillUIManager, { name: config.uiName.onskillUI, param: [this.id] })

                break
            case SkillType.skillGenerate:
                BattleManager.instance.onSkillGenerate(this.id)
                UIManager.instance.openUI(OnskillUIManager, { name: config.uiName.onskillUI, param: [this.id] })
                break
            case SkillType.changeRole:
                let cur = BattleUIManager.instance.curTouch
                if (cur && BattleUIManager.instance.touchStatus == TouchStatusType.clicked) {
                    UIManager.instance.openUI(ChangeRoleUI, { name: config.uiName.changeRoleUI, param: [cur.getComponent(LandItem).id] })
                } else {
                    UIManager.instance.LoadTipsByStr('请指定一个角色')
                    return
                }
                break
        }
        AudioManager.instance.playAudio('mix')

        BattleManager.instance.sun -= 30 * Math.pow(BattleManager.instance.skillTimes, 2)
        this.qualitySp.node.y = 60
        this.coolTimer = this.data.cool
        this.coolProgress.node.active = true
        // this.passiveNode.active = true
        // this.passiveLabel.string = '冷却中'
        BattleManager.instance.skillTimes++
    }
    coolDown() {
        this.qualitySp.node.y = 105
        this.coolProgress.node.active = false
        // this.passiveNode.active = false
    }
    onUpdate(dt) {
        if (this.data.isActive) {
            if (this.coolTimer > 0) {
                this.coolTimer -= dt
                this.coolProgress.progress = this.coolTimer / this.data.cool
            } else {
                if (this.qualitySp.node.y == 60) {
                    this.coolTimer = 0
                    this.coolDown()
                }
            }
        }
    }
}