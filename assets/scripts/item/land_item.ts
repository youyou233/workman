import ResourceManager from "../manager/resources_manager"
import { RoleActionType, AtkType, SkillType, ResType } from "../utils/enum"
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
import { CardData } from "../interface/card_data"
import UIManager from "../manager/ui_manager"

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
    landSp: cc.Sprite = null
    id: number = 0
    cardData: CardData = null
    //对应位置
    curI: number = 0
    curJ: number = 0
    posI: number = 0
    posJ: number = 0
    atkTimer: number = 0
    role: Role = null
    watchMonster: boolean = false
    buffMap: { [key: number]: BuffData } = {}

    aroundBuffTimer: number = 0
    _stack: number
    otherSkillTimer: number = null
    _isDiz: boolean = false//是否眩晕

    pos: cc.Vec2 = cc.v2(0, 0)
    skilling: boolean = false
    get isDiz() {
        return this._isDiz
    }
    set isDiz(val: boolean) {
        this._isDiz = val
        if (val && this.id) {
            EffectManager.instance.creatEffect(18, this.pos)
            let name = 'role_' + this.id + '_' + RoleActionType.death
            this.roleAnima.play(name)
        } else if (!val && this.id) {
            let name = 'role_' + this.id + '_' + RoleActionType.idle
            this.roleAnima.play(name)
        }
    }
    set stack(val: number) {
        if (val > 7) {
            val = 7
            UIManager.instance.LoadTipsByStr('最高七级')
        }
        this._stack = val
        this.stackContainer.children.forEach((item, index) => {
            item.active = index < val
        })
    }
    get stack() {
        return this._stack
    }

    onLoad() {
        this.landSp = this.node.getChildByName('land_1').getComponent(cc.Sprite)
        //       this.roleAnima = this.node.getChildByName('role').getComponent(cc.Animation)
        Emitter.register('MessageType_' + MessageType.addMonster, (name) => {
            if (!this.watchMonster) this.onAtk()
        }, this)

        Emitter.register('MessageType_' + MessageType.addBuff, (name, buffId, buffData) => {
            this.addBuff(buffId, Utils.deepCopy(buffData) as any)
        }, this)
        Emitter.register('Message_' + MessageType.gameSuccess, (name) => {
            if (!this.id) return
            let success = 'role_' + this.id + '_' + RoleActionType.success
            this.roleAnima.play(success)
        }, this)
        Emitter.register('Message_' + MessageType.gameFail, (name) => {
            if (!this.id) return
            let fail = 'role_' + this.id + '_' + RoleActionType.fail
            this.roleAnima.play(fail)
        }, this)
    }
    init(i, j, posi, posj) {
        //  this.addAnimationClip()
        this.id = null
        this.curI = i
        this.curJ = j
        this.posI = posi
        this.posJ = posj
        //cc.log(i, j)
        let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
        if (!this.landSp) this.landSp = this.node.getChildByName('land_1').getComponent(cc.Sprite)
        this.landSp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, 'land_' + areaData.land)
        this.setNull()
        this.mergeStatus.active = false
        this.atkTimer = 999
        this.watchMonster = false
        this.isDiz = false
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
        this.isDiz = false
        this.updateBuffContainer()
    }
    showRole(id?, effect: number = 0) {
        if (id) {
            let index = 0
            for (let i = 0; i < 5; i++) {
                if (BattleManager.instance.team[i].id == id) {
                    index = i
                    break
                }
            }

            this.cardData = BattleManager.instance.team[index]
        } else {
            this.cardData = BattleManager.instance.team[Utils.getRandomNumber(4)]
        }
        // this.cardData = BattleManager.instance.team[0]
        this.id = this.cardData.id
        if (this.role && this.role.isAroundBuff()) {
            this.aroundBuffTimer = 1
        }
        this.stackContainer.active = true
        let roleData = JsonManager.instance.getDataByName('role')[this.id]
        this.atkTimer = roleData.atkCD
        this.role = new Role(this.id, this.cardData.lv)
        if (this.role.haveOtherSkill()) {
            let skillData = JsonManager.instance.getDataByName('skill')[this.id]
            this.otherSkillTimer = skillData.param.cold
        }
        this.isDiz = false
        this.addAnimationClip()
        this.updateBuffContainer()
        // console.log(this.curI, this.curJ, '生成')
        if (effect) {
            EffectManager.instance.createPartical(effect, cc.v2(this.pos.x, this.pos.y + 65))
        } else {
            EffectManager.instance.creatEffect(1, cc.v3(this.pos.x, this.pos.y + 65))
        }
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
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.death).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
            })
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.fail).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
            })
            ResourceManager.instance.getRoleAnimation(this.id, RoleActionType.success).then((res: cc.AnimationClip) => {
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
        if (!landItem.role) return false
        let mergeData = landItem.role.getMergeData()
        if (this != landItem && !landItem.isDiz &&
            ((!mergeData[1] && this.id) || this.id == landItem.id) &&
            (!mergeData[0] || this.stack == landItem.stack)) {
            return true
        } else {
            return false
        }
    }

    onMerge(land: LandItem) {
        let effect = 0
        if (land.id == 17) {
            this.stack = Math.ceil((land.stack + this.stack + 1) / 2)

            effect = 7
        } else {
            this.stack++
            if (this.stack == 7) {
                UIManager.instance.LoadTipsByStr('七星是最高星了')
            }
        }
        if (this.stack > 7) {
            this.stack = 7
        }
        if (land.id == 5) {
            effect = 6
        }
        if (this.id == 8) {
            BattleManager.instance.onSkillGenerate(this.id, this.stack)
        }
        if (this.id == 22) {
            BattleManager.instance.sun += this.stack * 60
            EffectManager.instance.createDamageLabel(this.stack * 60 + '', this.pos, false, { color: cc.Color.WHITE, outLineColor: cc.color(121, 0, 147), fontSize: 18 })
        }
        land.setNull()
        this.showRole(null, effect)
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
        if (this.isDiz) return
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
        if (this.isDiz) return
        let name = ''
        let monster = BattleUIManager.instance.findAheadMonster()
        if (!monster) {
            this.watchMonster = false
        } else {
            this.roleAnima.node.scaleX = monster.x < this.pos.x ? 2.5 : -2.5
            switch (this.role.getAtkType()) {
                case AtkType.normol:
                case AtkType.random:
                case AtkType.melee:
                case AtkType.chain:
                case AtkType.randomMelee:
                    if (this.role.getAtkType() == AtkType.random || this.role.getAtkType() == AtkType.randomMelee) {
                        monster = BattleUIManager.instance.findRandomMonster()
                    }
                    this.watchMonster = true
                    name = 'role_' + this.id + '_' + RoleActionType.atk
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.actionCb[RoleActionType.atk] = () => {
                        let param = {
                            id: this.id,
                            stack: this.stack,
                            cri: this.role.isCri(this),
                            spike: this.role.checkSpike(this)
                        }
                        if (this.role.getAtkType() == AtkType.melee || this.role.getAtkType() == AtkType.randomMelee) {
                            let target = DD.instance.getMonsterByNode(monster)
                            target.beAtk(this.role.getAtkDamege(this), param)
                            EffectManager.instance.creatEffect(DD.instance.getRoleEffect(this.id, 0), monster.position)
                        } else {
                            let time = this.role.getAtkType() == AtkType.chain ? 0.1 : 0.5
                            BattleUIManager.instance.addThrow(this.id, JSON.parse(JSON.stringify(this.pos)), monster.position, time, this.role.getAtkDamege(this),
                                DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), param)
                        }
                    }
                    break
                case AtkType.range://只有魔法是
                    name = 'role_' + this.id + '_' + RoleActionType.sing
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.watchMonster = true
                    this.actionCb[RoleActionType.sing] = () => {
                        BattleUIManager.instance.addThrow(this.id, JSON.parse(JSON.stringify(this.pos)), monster.position, 0.1, this.role.getAtkDamege(this),
                            DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), { cri: this.role.isCri(this), range: this.role.getAtkRange(this), spike: this.role.checkSpike(this) }
                        )
                        EffectManager.instance.createPartical(this.role.roleData.effect[2], cc.v2(monster.x, monster.y))
                    }
                    break
                case AtkType.randomRange:
                    monster = BattleUIManager.instance.findRandomMonster()
                    name = 'role_' + this.id + '_' + RoleActionType.throw
                    this.roleAnima.play(name).speed = 1.1 / this.role.getAtkCD(this)
                    this.watchMonster = true
                    this.actionCb[RoleActionType.throw] = () => {
                        BattleUIManager.instance.addThrow(this.id, JSON.parse(JSON.stringify(this.pos)), monster.position, 1, this.role.getAtkDamege(this),
                            DD.instance.getMonsterByNode(monster).oid, this.role.getAtkType(), { cri: this.role.isCri(this), range: this.role.getAtkRange(this), spike: this.role.checkSpike(this) }, true)
                    }
                    break
            }
        }
    }
    onOtherSkill() {
        if (this.isDiz) return
        this.watchMonster = true
        let name = 'role_' + this.id + '_' + RoleActionType.sing
        this.roleAnima.play(name).speed = 1
        this.skilling = true
        switch (this.id) {
            case 10:
                this.actionCb[RoleActionType.sing] = () => {
                    let num = this.stack * JsonManager.instance.getDataByName('skill')[this.id].param.num
                    BattleManager.instance.sun += num
                    this.skilling = false
                    EffectManager.instance.createDamageLabel(num + '', this.pos, false, { color: cc.Color.WHITE, outLineColor: cc.color(121, 0, 147), fontSize: 18 })
                    EffectManager.instance.creatEffect(this.role.roleData.effect[1], cc.v2(this.pos.x, this.pos.y + 65))
                }
                break
            case 24:
                this.actionCb[RoleActionType.sing] = () => {
                    this.skilling = false
                    let arrLand = BattleManager.instance.getNeedPure()
                    if (arrLand.length > 0) {
                        for (let i = 0; i < this.stack; i++) {
                            if (arrLand[i]) {
                                arrLand[i].onPure()
                                EffectManager.instance.createPartical(this.role.roleData.effect[1], arrLand[i].pos)
                            }
                        }
                    }
                }
                break
        }


    }
    onPure() {
        EffectManager.instance.creatEffect(24, this.pos)
        if (this.isDiz) {
            this.isDiz = false
            return
        }
        if (this.buffMap[8]) {
            this.buffMap[8] = { time: 0, lv: 1 }
            return
        }
        if (this.buffMap[9]) {
            this.buffMap[9] = { time: 0, lv: 1 }
            return
        }
    }
    onUpdate(dt) {
        if (this.id) {
            this.atkTimer -= dt
            if (this.atkTimer < 0 && !this.skilling) {
                //   console.log(this.role.getAtkCD(this))
                this.atkTimer = this.role.getAtkCD(this) /// this.atkSpd
                this.onAtk()
            }
            if (this.role.haveOtherSkill()) {
                this.otherSkillTimer -= dt
                if (this.otherSkillTimer < 0) {
                    this.otherSkillTimer = JsonManager.instance.getDataByName('skill')[this.id].param.cold
                    this.onOtherSkill()
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
                    BattleUIManager.instance.getRoundLand(this.curI, this.curJ, this.posI, this.posJ).forEach((item) => {
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
    addWuke() {
        if (this.buffMap[10]) {
            this.buffMap[10].lv++
        } else {
            this.buffMap[10] = { time: 999999999, lv: 1 }
        }
        this.updateBuffContainer()
    }
    removeBuff(buffId) {
        delete this.buffMap[buffId]
        this.updateBuffContainer()
    }
    updateBuffContainer() {
        this.clearBuffContainer()
        for (let buffId in this.buffMap) {
            let buff = PoolManager.instance.createObjectByName('commonItem', this.buffContainer)
            buff.getComponent(CommonItem).init(`buff_${buffId}`, null)
        }
    }
    clearBuffContainer() {
        for (let j = this.buffContainer.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('commonItem', this.buffContainer.children[j])
        }
    }
}