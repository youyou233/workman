import ResourceManager from "../manager/resources_manager"
import { RoleActionType } from "../utils/enum"
import { Utils } from "../utils/utils"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import BattleUIManager from "../ui/battle_ui_manager"
import MonsterItem from "./monster_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandItem extends cc.Component {
    @property(cc.Animation)
    roleAnima: cc.Animation = null
    @property(cc.Node)
    mergeStatus: cc.Node = null
    @property(cc.Node)
    stackContainer: cc.Node = null
    id: number
    _stack: number
    //对应位置
    curI: number = 0
    curJ: number = 0

    atkTimer: number = 0
    atkSpd: number = 3
    watchMonster: boolean = false
    set stack(val: number) {
        this._stack = val
        this.stackContainer.children.forEach((item, index) => {
            item.active = index <= val
        })
    }
    get stack() {
        return this._stack
    }
    onLoad() {
        //       this.roleAnima = this.node.getChildByName('role').getComponent(cc.Animation)
        Emitter.register('MessageType_' + MessageType.addMonster, (name) => {
            if (!this.watchMonster) this.onAtk()
        }, this)
    }
    init(i, j) {
        //  this.addAnimationClip()
        this.curI = i
        this.curJ = j
        this.setNull()
        this.mergeStatus.active = false
        this.atkTimer = 0
        this.watchMonster = false
    }
    setNull() {
        this.stack = 0
        this.roleAnima.stop()
        this.roleAnima.node.getComponent(cc.Sprite).spriteFrame = null
        this.stackContainer.active = false
        this.id = null
    }
    showRole(id) {
        this.id = id
        this.stackContainer.active = true
        this.addAnimationClip()
    }

    addAnimationClip() {
        let clips = this.roleAnima.getClips()
        let type = RoleActionType.idle
        let name = 'role_' + this.id + '_' + type
        if (clips.some((item) => {
            return item.name == name
        })) {
            this.roleAnima.play(name)
        } else {
            ResourceManager.instance.getRoleAnimation(this.id, type).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
                this.roleAnima.play(res.name)
            })
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.atk).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
            })
        }
    }
    checkMerge(landItem: LandItem) {
        // if (this.id != landItem.id || this == landItem) {
        //     return false
        // } else  {
        //     return true
        // }
        if (this != landItem && this.id == landItem.id && this.stack == landItem.stack) {
            return true
        } else {
            return false
        }
    }
    updateMergeStatus(close: boolean, landItem?: LandItem) {
        if (close) {
            this.mergeStatus.active = false
        } else {
            if (this.checkMerge(landItem)) {
                this.mergeStatus.color = cc.Color.YELLOW
                this.mergeStatus.active = true
            } else {
                if (this == landItem) {
                    this.mergeStatus.color = cc.Color.RED
                    this.mergeStatus.active = true
                }
            }
        }

    }
    aniCB(type: RoleActionType) {
        switch (type) {
            case RoleActionType.atk:
                let name = 'role_' + this.id + '_' + RoleActionType.idle
                this.roleAnima.play(name)
                break
        }
    }
    onAtk() {
        let monster = BattleUIManager.instance.findAheadMonster()
        let name = 'role_' + this.id + '_' + RoleActionType.atk
        this.roleAnima.play(name).speed = this.atkSpd
        if (!monster) {
            this.watchMonster = false
        } else {
            this.watchMonster = true
            BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 1 / this.atkSpd, 2, monster.getComponent(MonsterItem).oid)
        }
    }
    onUpdate(dt) {
        if (this.id) {
            this.atkTimer -= dt
            if (this.atkTimer < 0) {
                this.atkTimer = 1 /// this.atkSpd
                this.onAtk()
            }
        }
    }
}