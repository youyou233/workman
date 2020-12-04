import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleManager from "../manager/battle_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import MainManager from "../manager/main_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class MonsterItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null

    @property(cc.ProgressBar)
    hpProgress: cc.ProgressBar = null
    spd: cc.Vec2 = cc.v2(0, 0)
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

    randomPos: cc.Vec3[] = []
    path: number = 0
    oid: number = 0
    onLoad() {
    }
    init(id: number) {
        this.oid = new Date().getTime()//时间戳代表唯一id
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.monster, `monster (${id})`)
        let startPos = cc.v2(-250, -225)
        this.spd = cc.v2(0, 100)
        this.node.setPosition(startPos)
        this.randomPos[0] = cc.v3(-250, 400)
        this.randomPos[1] = cc.v3(250, 400)
        this.maxHp = this.hp = 10
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
    beAtk(damage) {
        this.hp -= damage
    }
    getInCity() {
        BattleManager.instance.hp--
        this.removeSelf()
    }
    removeSelf() {
        PoolManager.instance.removeObjectByName('monsterItem', this.node)
    }
    onUpdate(dt) {
        this.node.x += this.spd.x * dt
        this.node.y += this.spd.y * dt
        this.path += (Math.abs(this.spd.x) * dt + Math.abs(this.spd.y * dt))
        this.checkNearPos()
    }
}