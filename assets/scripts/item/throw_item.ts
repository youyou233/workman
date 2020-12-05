import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleUIManager from "../ui/battle_ui_manager"
import MonsterItem from "./monster_item"
import BossItem from "./boss_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class ThrowItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    oid: number = null
    damage: number = null
    init(id: number, start: cc.Vec2, end: cc.Vec2, time: number, damage: number, oid: number) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, `throw (${id})`)
        this.node.stopAllActions()
        this.oid = oid
        this.damage = damage
        this.node.angle = 0
        // let rote = [true, false, true, false, true]
        start.y += 65
        this.node.setPosition(start)
        // if (rote[id]) {
        //     let angle = start.sub(end).signAngle(cc.v2(1, 0))
        //     this.node.angle = angle * 180 / Math.PI
        //     let tween = new cc.Tween().target(this.node)
        //         .to(time, { x: end.x, y: end.y }).call(this.endAni.bind(this)).start()
        // } else {
        let tween = new cc.Tween().target(this.node)
            .to(time, { x: end.x, y: end.y, angle: 900 }).call(this.endAni.bind(this)).start()
        //}

    }
    endAni() {
        let monster = BattleUIManager.instance.findMonsterByOid(this.oid)
        if (monster) {
            monster.beAtk(this.damage)
        } else {
            let node = BattleUIManager.instance.findAheadMonster()
            if (node && node.name == 'monsterItem') {
                node.getComponent(MonsterItem).beAtk(this.damage)
            } else if (node && node.name == 'bossItem') {
                node.getComponent(BossItem).beAtk(this.damage)
            }
        }
        PoolManager.instance.removeObjectByName('throwItem', this.node)
    }
}
