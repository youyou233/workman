import ResourceManager from "../manager/resources_manager"
import { RoleActionType, AtkType } from "../utils/enum"
import { Utils } from "../utils/utils"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import BattleUIManager from "../ui/battle_ui_manager"
import MonsterItem from "./monster_item"
import JsonManager from "../manager/json_manager"
import BossItem from "./boss_item"
import BattleManager from "../manager/battle_manager"

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

    atkType: AtkType = AtkType.normol
    atkTimer: number = 0
    atkCD: number = 0
    _atkDamage: number = 0
    set atkDamage(val: number) {
        this._atkDamage = val
    }
    get atkDamage() {
        return this._atkDamage * this.stack
    }
    watchMonster: boolean = false
    set stack(val: number) {
        this._stack = val
        this.stackContainer.children.forEach((item, index) => {
            item.active = index < val
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
        this.atkTimer = 999
        this.watchMonster = false

    }
    setNull() {
        this.stack = 1
        this.roleAnima.stop()
        this.roleAnima.node.getComponent(cc.Sprite).spriteFrame = null
        this.stackContainer.active = false
        this.id = null
    }
    showRole(id) {
        this.id = id
        this.stackContainer.active = true
        let roleData = JsonManager.instance.getDataByName('role')[id]
        this.atkCD = roleData.atkCD
        this.atkTimer = roleData.atkCD
        this.atkDamage = roleData.atk
        this.atkType = roleData.atkType
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
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.sing).then((res: cc.AnimationClip) => {
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
        switch (+type) {
            case RoleActionType.atk:
            case RoleActionType.sing:
                let name = 'role_' + this.id + '_' + RoleActionType.idle
                this.roleAnima.play(name)
                break

        }
    }
    onAtk() {
        let name = ''
        switch (this.atkType) {
            case AtkType.normol:
                let monster = BattleUIManager.instance.findAheadMonster()
                name = 'role_' + this.id + '_' + RoleActionType.atk
                this.roleAnima.play(name).speed = 1 / this.atkCD
                if (!monster) {
                    this.watchMonster = false
                } else {
                    this.watchMonster = true
                    if (monster.name == 'monsterItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(MonsterItem).oid)
                    } else if (monster.name == 'bossItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(BossItem).oid)
                    }
                }
                break
            case AtkType.range:
                //TODO: 范围攻击
                // this.watchMonster = true
                // name = 'role_' + this.id + '_' + RoleActionType.sing
                // this.roleAnima.play(name).speed = 1
                // BattleManager.instance.sun += this.atkDamage
                break
        }

    }
    onUpdate(dt) {
        if (this.id) {
            this.atkTimer -= dt
            if (this.atkTimer < 0) {
                this.atkTimer = this.atkCD /// this.atkSpd
                this.onAtk()
            }
        }
    }
}