import ResourceManager from "../manager/resources_manager"
import { ResType, BossStatusType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleManager from "../manager/battle_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import MainManager from "../manager/main_manager"
import { BuffData } from "../interface/buff_data"
import JsonManager from "../manager/json_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class BossItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null

    @property(cc.ProgressBar)
    hpProgress: cc.ProgressBar = null
    _spd: cc.Vec2 = cc.v2(0, 0)
    set spd(val: cc.Vec2) {
        this._spd = val
    }
    get spd() {
        if (this.buffMap[2]) {
            let buffData = JsonManager.instance.getDataByName('buff')[2]
            let rate = 100 + buffData.param.num + buffData.param.add * this.buffMap[2].lv
            return this._spd.mul(rate / 100)
        } else {
            return this._spd
        }
    }
    maxHp: number = 0
    _hp: number = 0
    set hp(val: number) {
        this._hp = val
        this.hpProgress.node.active = this.maxHp > val
        this.hpProgress.progress = val / this.maxHp
        if (this.hp <= 0) {
            this.removeSelf()
        }
    }
    get hp() {
        return this._hp
    }
    bossStatus: BossStatusType = BossStatusType.move
    randomPos: cc.Vec3[] = []
    path: number = 0
    oid: number = 0
    //TODO:给boss增加放技能
    skillTimer: number = 10
    buffMap: { [key: number]: BuffData } = {}

    onLoad() {
    }
    init(id: number, addHp: number = 0) {
        this.oid = new Date().getTime()//时间戳代表唯一id
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.monster, `monster (${id})`)
        let startPos = cc.v2(-250, -225)
        this.spd = cc.v2(0, 100)
        this.node.setPosition(startPos)
        this.randomPos[0] = cc.v3(-250, 400)
        this.sp.node.color = cc.Color.WHITE
        this.buffMap = {}
        this.randomPos[1] = cc.v3(250, 400)
        this.maxHp = this.hp = 50 * BattleManager.instance.rank + addHp
        this.path = 0
        Emitter.fire('message_' + MessageType.addMonster)
    }
    checkNearPos() {
        if (this.node.position.sub(this.randomPos[0]).mag() < 5) {
            this.spd = cc.v2(100, 0)
        } else if (this.node.position.sub(this.randomPos[1]).mag() < 5) {
            this.spd = cc.v2(0, -100)
        } else {
            let endPos = cc.v3(250, -225)
            if (this.node.position.sub(endPos).mag() < 5) {
                this.getInCity()
            }
        }
    }
    beAtk(damage, param) {
        this.hp -= damage
        let buffData = BattleManager.instance.canDebuff(param)
        if (buffData) {
            this.addBuff(...buffData)
        }
    }
    getInCity() {
        BattleManager.instance.hp -= 2
        this.removeSelf()
    }
    removeSelf() {
        PoolManager.instance.removeObjectByName('bossItem', this.node)
        Emitter.fire('message_' + MessageType.killBoss)
    }
    onUpdate(dt) {
        this.node.x += this.spd.x * dt
        this.node.y += this.spd.y * dt
        this.path += (Math.abs(this.spd.x) * dt + Math.abs(this.spd.y * dt))
        this.checkNearPos()
        for (let buffId in this.buffMap) {
            this.buffMap[buffId].time -= dt
            if (this.buffMap[buffId].time <= 0) {
                this.removeBuff(buffId)
            }
        }
    }
    addBuff(buffId, buffData: BuffData) {
        this.buffMap[buffId] = buffData
        this.showBuffEffect()
    }
    removeBuff(buffId) {
        delete this.buffMap[buffId]
        this.showBuffEffect()
    }
    showBuffEffect() {
        this.sp.node.color = cc.Color.WHITE
        for (let buffId in this.buffMap) {
            if (buffId && this.buffMap[buffId]) {
                this.sp.node.color = cc.Color.BLUE
                return
            }
        }
    }
}