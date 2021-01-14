import ResourceManager from "../manager/resources_manager"
import { ResType, AtkType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleUIManager from "../ui/battle_ui_manager"
import MonsterItem from "./monster_item"
import BossItem from "./boss_item"
import EffectManager from "../manager/effect_manager"
import { Utils } from "../utils/utils"
import DD from "../manager/dynamic_data_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class ThrowItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    oid: number = null
    damage: number = null
    type: AtkType = null
    param: any = null
    id: number = 0
    init(id: number, start: cc.Vec2, end: cc.Vec2, time: number, damage: number, cri: boolean, oid: number, type: AtkType, param?, jump: boolean = false) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, `throw (${id})`)
        this.node.stopAllActions()
        this.oid = oid
        this.id = id
        this.damage = damage
        this.node.angle = 0
        this.type = type
        this.param = param
        start.y += 65
        this.node.setPosition(start)
        let rote = true
        if ([2, 5, 8, 11, 17, 20].indexOf(+id) != -1) {
            rote = false
            let angle = end.sub(start).signAngle(cc.v2(0, 1)) * 180 / Math.PI
            // console.log(angle)
            this.node.angle = -angle
        }
        if (jump) {
            let jumpPos = cc.v2((start.x + end.x) / 2, (start.y + end.y) + 200)
            let tween = new cc.Tween().target(this.node)
                .to(time / 2, { x: jumpPos.x, y: jumpPos.y, angle: rote ? 450 : this.node.angle }, cc.easeOut(2))
                .to(time / 2, { x: end.x, y: end.y, angle: rote ? 900 : this.node.angle }, cc.easeIn(2))
                .call(this.endAni.bind(this)).start()
        } else {
            let tween = new cc.Tween().target(this.node)
                .to(time, { x: end.x, y: end.y, angle: rote ? 900 : this.node.angle }).call(this.endAni.bind(this)).start()
        }
    }
    endAni() {
        let monster: MonsterItem | BossItem = null
        let list = []
        switch (this.type) {
            case AtkType.normol:
                monster = BattleUIManager.instance.findMonsterByOid(this.oid)
                if (!monster) {
                    let node = BattleUIManager.instance.findAheadMonster()
                    if (node && node.name == 'monsterItem') {
                        monster = node.getComponent(MonsterItem)
                    } else if (node && node.name == 'bossItem') {
                        monster = node.getComponent(BossItem)
                    }
                }
                if (monster) {
                    monster.beAtk(this.damage, this.param)//param是buff内容
                }

                break
            case AtkType.range:
            case AtkType.randomRange:
                list = BattleUIManager.instance.getRangeMonsters(this.node.position, this.param.range)
                for (let i = 0; i < list.length; i++) {
                    let monster = DD.instance.getMonsterByNode(list[i])
                    monster.beAtk(this.damage, this.param)
                }
                break
            case AtkType.chain:
                let num = this.param.stack + 2
                list = BattleUIManager.instance.findArrMonster(num)
                for (let i = 0; i < list.length; i++) {
                    let monster = DD.instance.getMonsterByNode(list[i])
                    monster.beAtk(this.damage, this.param)
                }
                break
            case AtkType.random:
                monster = BattleUIManager.instance.findMonsterByOid(this.oid)
                if (!monster) {
                    let node = BattleUIManager.instance.getRangeMonsters(this.node.position, 50)[0]
                    if (node && node.name == 'monsterItem') {
                        monster = node.getComponent(MonsterItem)
                    } else if (node && node.name == 'bossItem') {
                        monster = node.getComponent(BossItem)
                    }
                }
                if (monster) {
                    monster.beAtk(this.damage, this.param)//param是buff内容
                }
                break
        }
        EffectManager.instance.creatEffect(DD.instance.getRoleEffect(this.id, 0), this.node.position)
        PoolManager.instance.removeObjectByName('throwItem', this.node)

    }
}
