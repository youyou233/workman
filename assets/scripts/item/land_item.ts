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
import { Role } from "../class/role"
import { BuffData } from "../interface/buff_data"
import PoolManager from "../manager/pool_manager"
import CommonItem from "./common_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandItem extends cc.Component {
    @property(cc.Animation)
    roleAnima: cc.Animation = null
    @property(cc.Node)
    mergeStatus: cc.Node = null
    @property(cc.Node)
    stackContainer: cc.Node = null
    @property(cc.Node)
    buffContainer: cc.Node = null
    id: number

    //对应位置
    curI: number = 0
    curJ: number = 0

    atkTimer: number = 0
    role: Role = null
    watchMonster: boolean = false
    buffMap: { [key: number]: BuffData } = {}

    _stack: number
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

        Emitter.register('MessageType_' + MessageType.addBuff, (name, buffId, buffData) => {
            this.addBuff(buffId, Utils.deepCopy(buffData) as any)
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
    showRole() {
        this.id = BattleManager.instance.team[Utils.getRandomNumber(4)].id
        this.stackContainer.active = true
        let roleData = JsonManager.instance.getDataByName('role')[this.id]
        this.atkTimer = roleData.atkCD
        this.role = new Role(this.id)
        this.addAnimationClip()
        this.updateBuffContainer()
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
    onMerge() {
        this.showRole()
        this.stack++
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
        let monster = BattleUIManager.instance.findAheadMonster()
        switch (this.role.getAtkType()) {
            case AtkType.normol:
                name = 'role_' + this.id + '_' + RoleActionType.atk
                this.roleAnima.play(name).speed = 1 / this.role.getAtkCD(this)
                if (!monster) {
                    this.watchMonster = false
                } else {
                    this.watchMonster = true
                    if (monster.name == 'monsterItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(MonsterItem).oid, this.role.getAtkType())
                    } else if (monster.name == 'bossItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(BossItem).oid, this.role.getAtkType())
                    }
                }
                break
            case AtkType.range:
                name = 'role_' + this.id + '_' + RoleActionType.sing
                this.roleAnima.play(name).speed = 1 / this.role.getAtkCD(this)
                if (!monster) {
                    this.watchMonster = false
                } else {
                    this.watchMonster = true
                    if (monster.name == 'monsterItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(MonsterItem).oid, this.role.getAtkType())
                    } else if (monster.name == 'bossItem') {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, 2, monster.getComponent(BossItem).oid, this.role.getAtkType())
                    }
                }

                break
        }

    }
    onUpdate(dt) {
        if (this.id) {
            this.atkTimer -= dt
            if (this.atkTimer < 0) {
                //   console.log(this.role.getAtkCD(this))
                this.atkTimer = this.role.getAtkCD(this) /// this.atkSpd
                this.onAtk()
            }
            for (let buffId in this.buffMap) {
                this.buffMap[buffId].time -= dt
                if (this.buffMap[buffId].time <= 0) {
                    this.removeBuff(buffId)
                }
            }
        }
    }
    addBuff(buffId, buffData: BuffData) {
        if (this.id && this.id > 0) {
            this.buffMap[buffId] = buffData
            this.updateBuffContainer()
        }
    }
    removeBuff(buffId) {
        delete this.buffMap[buffId]
        this.updateBuffContainer()
    }
    updateBuffContainer() {
        this.clearBuffContainer()
        for (let buffId in this.buffMap) {
            let buff = PoolManager.instance.createObjectByName('commonItem', this.buffContainer)
            buff.getComponent(CommonItem).init(`skill (${buffId})`, null)
        }
    }
    clearBuffContainer() {
        for (let j = this.buffContainer.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('commonItem', this.buffContainer.children[j])
        }
    }
}