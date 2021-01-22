import ResourceManager from "../manager/resources_manager"
import { ResType, BossStatusType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleManager from "../manager/battle_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import MainManager from "../manager/main_manager"
import { BuffData } from "../interface/buff_data"
import JsonManager from "../manager/json_manager"
import EffectManager from "../manager/effect_manager"
import { Utils } from "../utils/utils"
import LandItem from "./land_item"
import BattleUIManager from "../ui/battle_ui_manager"
import ThrowCbItem from "./throw_cb_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class BossItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null

    @property(cc.ProgressBar)
    hpProgress: cc.ProgressBar = null
    monsterSpd: number = 0
    @property(cc.Node)
    particalNode: cc.Node = null
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
        if (this._hp < 0 && val < 0) return
        this._hp = val
        this.hpProgress.node.active = this.maxHp > val
        this.hpProgress.progress = val / this.maxHp
        if (this.hp <= 0) {
            Emitter.fire('message_' + MessageType.killBoss)
            EffectManager.instance.creatSunEffect(0, this.node.position)
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
    skillTimer: number = 10
    buffMap: { [key: number]: BuffData } = {}
    id: number = 0
    onLoad() {
    }
    init(id: number, addHp: number = 0) {
        this.oid = new Date().getTime()//时间戳代表唯一id
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.monster, `monster (${id})`)
        let monsterData = JsonManager.instance.getDataByName('monster')[id]
        this.monsterSpd = Math.sqrt(monsterData.spd)
        this.id = id
        let startPos = BattleUIManager.instance.getStartPos(0)
        this.bossStatus = BossStatusType.skill
        this.node.setPosition(startPos)
        this.randomPos[0] = cc.v3(-250, 400)
        this.sp.node.color = cc.Color.WHITE
        this.buffMap = {}
        this.skillTimer = 4
        this.randomPos[1] = cc.v3(250, 400)
        this.maxHp = this.hp = (monsterData.hp * BattleManager.instance.getHpmult() + addHp)
        this.path = 0
        this.particalNode.children.forEach((item) => { item.active = false })

        Emitter.fire('message_' + MessageType.addMonster)
    }
    onGetHp(arr) {
        //TODO:增加一个吸收魂的特效
        for (let i = 0; i < arr.length; i++) {
            let partical = EffectManager.instance.createPartical(4, arr[i])
            let tween = new cc.Tween(partical).to(1, { x: this.node.x, y: this.node.y })
                .call(() => { this.bossStatus = BossStatusType.move }).start()
        }
        if (arr.length == 0) {
            this.bossStatus = BossStatusType.move
        }
    }
    checkNearPos() {
        let result = BattleUIManager.instance.checkWayPoint(cc.v3(this.node.x, this.node.y - 64), 0)

        if (result == true) {
            this.getInCity()
        } else if (result) {
            //判断方向与之前是否相同
            if (((this.spd.x != 0 && (this.spd.x * result[0].x < 0)) || (this.spd.x == 0 && result[0].x == 0)) &&
                ((this.spd.y != 0 && (this.spd.y * result[0].y < 0)) || (this.spd.y == 0 && result[0].y == 0))) {
                this.node.x -= result[1].x
                this.node.y -= result[1].y
            }
            // if (this.spd.x != result[0].x || this.spd.y != result[0].y) {
            //     this.node.x -= result[1].x
            //     this.node.y -= result[1].y
            // }

            this.spd = cc.v2(result[0].x, result[0].y)
        }
    }
    beAtk(damage, param) {
        let buffData = BattleManager.instance.canDebuff(param)
        if (buffData) {
            this.addBuff(...buffData)
        }
        let multDamage = BattleManager.instance.canMultDamage(this.buffMap, param)
        let count = damage * multDamage[0]
        if (param) {
            switch (param.id) {
                case 25:
                    count *= (param.stack + 1)
                    break
            }
        }
        let cri = param && param.cri
        if (cri) {
            if (param.id == 28) {
                count *= 3
            } else {
                count *= 2
            }
        }
        this.hp -= count
        if (this.hp <= 0) {
            Emitter.fire('message_' + MessageType.monsterBeKilled, param, this)
        }
        EffectManager.instance.createDamageLabel(count + '', this.node.position, cri)
    }
    getInCity() {
        BattleManager.instance.hp -= 2
        BattleManager.instance.bossInCity()
        this.removeSelf()
    }
    removeSelf() {
        if (this.onSkillTimer) clearTimeout(this.onSkillTimer)
        PoolManager.instance.removeObjectByName('bossItem', this.node)
    }
    onUpdate(dt) {
        if (this.bossStatus == BossStatusType.move) {
            this.node.x += this.spd.x * dt * this.monsterSpd
            this.node.y += this.spd.y * dt * this.monsterSpd
            this.path += (Math.abs(this.spd.x * this.monsterSpd) * dt + Math.abs(this.spd.y * this.monsterSpd * dt))
            this.checkNearPos()
            for (let buffId in this.buffMap) {
                this.buffMap[buffId].time -= dt
                if (this.buffMap[buffId].time <= 0) {
                    this.removeBuff(buffId)
                }
            }
            this.skillTimer -= dt
            if (this.skillTimer <= 0) {
                this.skillTimer = 4
                this.onSkill()
            }
        }
    }
    onSkillTimer: any = null
    onSkill() {
        // let bossData = JsonManager.instance.getDataByName('monster')[this.id]
        this.bossStatus = BossStatusType.skill
        if (this.onSkillTimer) clearTimeout(this.onSkillTimer)
        this.onSkillTimer = setTimeout(() => {
            this.bossStatus = BossStatusType.move
        }, 1000);
        let list: LandItem[] = null
        switch (+this.id) {
            case 6:
                let cure = (this.maxHp / 5).toFixed(0)
                this.hp += +cure
                EffectManager.instance.createDamageLabel(cure + '', this.node.position, false, { color: cc.Color.WHITE, outLineColor: cc.Color.GREEN, fontSize: 20 })
                EffectManager.instance.creatEffect(2, this.node.position)
                break
            case 12:
                for (let i = 0; i < 3; i++) {
                    let x = Utils.getRandomNumber(BattleManager.instance.mapData.length - 1)
                    let y = Utils.getRandomNumber(BattleManager.instance.mapData[x].length - 1)
                    let land = BattleManager.instance.mapData[x][y]
                    let tcb = PoolManager.instance.createObjectByName('throwCbItem', BattleUIManager.instance.content)
                    tcb.getComponent(ThrowCbItem).init(25, cc.v2(this.node.x, this.node.y), cc.v2(land.pos.x, land.pos.y + 65), 0.8, () => {
                        if (land && land.id) {
                            land.isDiz = true
                        }
                    }, false)

                }
                break
            case 18:
                list = BattleManager.instance.findAllLandItem()
                for (let i = 0; i < list.length; i++) {
                    list[i].showRole(null, 6)
                }
                // EffectManager.instance.createPartical(6, cc.v2(this.node.x, this.node.y))
                break
            case 21:
                for (let i = 0; i < 5; i++) {
                    BattleManager.instance.addMonster()
                }
                EffectManager.instance.createPartical(5, cc.v2(this.node.x, this.node.y))
                break
            case 32:
                //找到一个非空得
                list = BattleManager.instance.findAllLandItem()
                if (list.length > 0) {
                    let random = Utils.getRandomNumber(list.length - 1)
                    let rankChange = Utils.getRandomNumber(4) - 2
                    list[random].stack += rankChange
                    if (list[random].stack < 1) {
                        list[random].stack = 1
                    }
                    if (list[random].stack > 7) {
                        list[random].stack = 7
                    }
                    list[random].showRole(null, 7)
                }

                break
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
        //this.sp.node.color = cc.Color.WHITE
        this.particalNode.children.forEach((item) => { item.active = false })
        for (let buffId in this.buffMap) {
            this.particalNode.getChildByName(buffId + '').active = true
            // if (buffId && this.buffMap[buffId]) {
            //     this.sp.node.color = cc.Color.BLUE
            //     return
            // }
        }
    }
}