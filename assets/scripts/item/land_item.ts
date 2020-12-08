import ResourceManager from "../manager/resources_manager"
import { RoleActionType, AtkType, SkillType } from "../utils/enum"
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
import EffectManager from "../manager/effect_manager"
import DD from "../manager/dynamic_data_manager"

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

    aroundBuffTimer: number = 0
    _stack: number
    generateTimer: number = null
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
        this.id = null
        this.curI = i
        this.curJ = j
        cc.log(i, j)
        this.setNull()
        this.mergeStatus.active = false
        this.atkTimer = 999
        this.watchMonster = false

    }
    setNull() {
        if (this.id) {
            Emitter.fire('message_' + MessageType.removeRole, this.id)
        }
        this.stack = 1
        this.roleAnima.stop()
        this.roleAnima.node.getComponent(cc.Sprite).spriteFrame = null
        this.stackContainer.active = false
        this.id = null
        this.aroundBuffTimer = 0
        this.role = null
        this.buffMap = {}
        this.updateBuffContainer()
    }
    showRole() {
        this.id = BattleManager.instance.team[Utils.getRandomNumber(4)].id
        if (this.role && this.role.isAroundBuff()) {
            this.aroundBuffTimer = 1
        }
        this.stackContainer.active = true
        let roleData = JsonManager.instance.getDataByName('role')[this.id]
        this.atkTimer = roleData.atkCD
        this.role = new Role(this.id)
        if (this.role.isIntervalGenerate()) {
            let skillData = JsonManager.instance.getDataByName('skill')[this.id]
            this.generateTimer = skillData.param.cold
        }
        this.addAnimationClip()
        this.updateBuffContainer()
        EffectManager.instance.creatEffect(1, cc.v3(this.node.position.x, this.node.position.y + 65))
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
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.throw).then((res: cc.AnimationClip) => {
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
        let mergeData = landItem.role.getMergeData()
        if (this != landItem &&
            ((!mergeData[1] && this.id) || this.id == landItem.id) &&
            (!mergeData[0] || this.stack == landItem.stack)) {
            return true
        } else {
            return false
        }
    }
    onMerge(land: LandItem) {
        if (land.id == 17) {
            this.stack = Math.ceil((land.stack + this.stack + 1) / 2)
        } else {
            this.stack++
        }
        if (land.id == 8) {
            BattleManager.instance.onSkillGenerate(this.id, this.stack)
        }
        land.setNull()
        this.showRole()
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
        let name = 'role_' + this.id + '_' + RoleActionType.idle
        switch (+type) {
            case RoleActionType.atk:
                this.actionCb[RoleActionType.atk]()
                this.roleAnima.play(name)
                break
            case RoleActionType.sing:
                this.actionCb[RoleActionType.sing]()
                this.roleAnima.play(name)
                break
            case RoleActionType.throw:
                this.actionCb[RoleActionType.throw]()
                this.roleAnima.play(name)
                break

        }
    }
    actionCb: { [key: number]: Function } = {}
    onAtk() {
        let name = ''
        let monster = BattleUIManager.instance.findAheadMonster()
        if (!monster) {
            this.watchMonster = false
        } else {
            switch (this.role.getAtkType()) {
                case AtkType.normol:
                case AtkType.random:
                case AtkType.chain:
                    if (this.role.getAtkType() == AtkType.random) {
                        monster = BattleUIManager.instance.findRandomMonster()
                    }
                    this.watchMonster = true
                    name = 'role_' + this.id + '_' + RoleActionType.atk
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.actionCb[RoleActionType.atk] = () => {
                        let param = {
                            id: this.id,
                            stack: this.stack
                        }
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, this.role.getAtkDamege(this),
                            DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), param)
                    }
                    break
                case AtkType.range:
                    name = 'role_' + this.id + '_' + RoleActionType.sing
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.watchMonster = true
                    this.actionCb[RoleActionType.sing] = () => {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, this.role.getAtkDamege(this),
                            DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), { range: this.role.getAtkRange(this) }
                        )
                    }
                    break
                case AtkType.randomRange:
                    monster = BattleUIManager.instance.findRandomMonster()
                    name = 'role_' + this.id + '_' + RoleActionType.throw
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.watchMonster = true
                    this.actionCb[RoleActionType.throw] = () => {
                        BattleUIManager.instance.addThrow(this.id, this.node.position, monster.position, 0.5, this.role.getAtkDamege(this),
                            DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), { range: this.role.getAtkRange(this) })
                    }
                    break



            }
        }
    }
    onGenerate() {
        this.watchMonster = true
        let name = 'role_' + this.id + '_' + RoleActionType.sing
        this.roleAnima.play(name).speed = 1
        this.actionCb[RoleActionType.sing] = () => {
            let num = this.stack * JsonManager.instance.getDataByName('skill')[this.id].param.num
            BattleManager.instance.sun += num
            EffectManager.instance.createDamageLabel(num + '', this.node.position, false, { color: cc.Color.WHITE, outLineColor: cc.color(121, 0, 147), fontSize: 18 })
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
            if (this.role.isIntervalGenerate()) {
                this.generateTimer -= dt
                if (this.generateTimer < 0) {
                    this.generateTimer = JsonManager.instance.getDataByName('skill')[this.id].param.cold
                    this.onGenerate()
                }
            }
            for (let buffId in this.buffMap) {
                this.buffMap[buffId].time -= dt
                if (this.buffMap[buffId].time <= 0) {
                    this.removeBuff(buffId)
                }
            }
            if (this.role && this.role.isAroundBuff()) {
                this.aroundBuffTimer -= dt
                if (this.aroundBuffTimer < 0) {
                    this.aroundBuffTimer = 1
                    let buffData = this.role.isAroundBuff(this.stack)
                    BattleUIManager.instance.getRoundLand(this.curI, this.curJ).forEach((item) => {
                        item.addBuff(buffData[0], Utils.deepCopy(buffData[1]) as any)
                    })
                }
                //增加周围的Buff

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