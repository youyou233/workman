import ResourceManager from "../manager/resources_manager"
import { BattleType, ResType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleManager from "../manager/battle_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import MainManager from "../manager/main_manager"
import { BuffData } from "../interface/buff_data"
import CommonItem from "./common_item"
import JsonManager from "../manager/json_manager"
import EffectItem from "./effect_item"
import EffectManager from "../manager/effect_manager"
import BattleUIManager from "../ui/battle_ui_manager"
import DD from "../manager/dynamic_data_manager"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class MonsterItem extends cc.Component {
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
    monsterSpd: number = 0
    set hp(val: number) {
        this.hpProgress.node.active = this.maxHp > val
        this.hpProgress.progress = val / this.maxHp
        if (this.hp > 0 && val <= 0) {
            this.onDied()
        }
        this._hp = val
        if (this._hp > this.maxHp) {
            this._hp = this.maxHp
        }

    }
    get hp() {
        return this._hp
    }
    explosion: number = 0
    randomPos: cc.Vec3[] = []
    path: number = 0
    oid: number = 0
    buffMap: { [key: number]: BuffData } = {}
    wayId: number = 0
    onLoad() {
    }
    init(id: number, wayId: number = 0) {
        this.oid = new Date().getTime()//时间戳代表唯一id
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.monster, `monster (${id})`)
        let monsterData = JsonManager.instance.getDataByName('monster')[id]
        this.monsterSpd = Math.sqrt(monsterData.spd)
        let startPos = BattleUIManager.instance.getStartPos(wayId) //cc.v2(-250, -225)
        this.spd = cc.v2(0, 0)
        this.wayId = wayId
        this.node.setPosition(startPos)
        this.randomPos[0] = cc.v3(-250, 400)
        this.buffMap = {}
        this.sp.node.color = cc.Color.WHITE
        this.randomPos[1] = cc.v3(250, 400)
        this.maxHp = monsterData.hp * BattleManager.instance.getHpmult()
        this.hp = this.maxHp
        this.path = 0
        this.explosion = 0
        Emitter.fire('message_' + MessageType.addMonster)
    }
    checkNearPos() {
        let result = BattleUIManager.instance.checkWayPoint(cc.v3(this.node.x, this.node.y - 64), this.wayId)

        if (result == true) {
            this.getInCity()
        } else if (result) {
            if (this.spd != result[0]) {
                this.node.x -= result[1].x
                this.node.y -= result[1].y
            }

            this.spd = result[0]

        }
        // if (this.node.position.sub(this.randomPos[0]).mag() < 5) {
        //     this.spd = cc.v2(100, 0)
        // } else if (this.node.position.sub(this.randomPos[1]).mag() < 5) {
        //     this.spd = cc.v2(0, -100)
        // } else {
        //     let endPos = cc.v3(250, -225)
        //     if (this.node.position.sub(endPos).mag() < 5) {
        //         this.getInCity()
        //     }
        // }
    }
    beAtk(damage, param) {
        let str = damage + ''
        let buffData = BattleManager.instance.canDebuff(param)
        if (buffData) {
            this.addBuff(...buffData)
        }
        let multDamage = BattleManager.instance.canMultDamage(this.buffMap, param)
        let count = (+damage) * multDamage[0]
        this.explosion = 0
        if (multDamage[1]) {
            this.explosion = count
        }
        if (param.cri) {
            if (param.id == 28) {
                count *= 3
            } else {
                count *= 2
            }
        }
        this.hp -= count
        str = count + ''
        if (param.spike) {
            this.hp = 0
            str = '秒杀'
            console.log('触发了秒杀')
        }
        if (this.hp <= 0) {
            Emitter.fire('message_' + MessageType.monsterBeKilled, param, this)
        }
        EffectManager.instance.createDamageLabel(str, this.node.position, param.cri)

    }
    getInCity() {
        BattleManager.instance.hp--
        this.removeSelf()
    }
    onDied() {
        if (BattleManager.instance.type == BattleType.unlimited) {
            BattleManager.instance.sun += 10
        } else {
            BattleManager.instance.sun += 10 * BattleManager.instance.rank
        }
        if (this.explosion) {
            //发射爆炸
            EffectManager.instance.creatEffect(27, this.node.position)
            let monsters = BattleUIManager.instance.getRangeMonsters(this.node.position, 200)
            monsters.forEach((item) => {
                DD.instance.getMonsterByNode(item).beAtk(this.explosion, null)
            })
        }
        this.removeSelf()
    }
    removeSelf() {
        PoolManager.instance.removeObjectByName('monsterItem', this.node)
    }
    onUpdate(dt) {
        this.node.x += this.spd.x * dt * this.monsterSpd
        this.node.y += this.spd.y * dt * this.monsterSpd
        this.path += (Math.abs(this.spd.x * this.monsterSpd) * dt + Math.abs(this.spd.y * dt * this.monsterSpd))
        this.checkNearPos()
        for (let buffId in this.buffMap) {
            this.buffMap[buffId].time -= dt
            if (this.buffMap[5]) {
                this.hp -= dt * this.buffMap[5].lv * 100
            }
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