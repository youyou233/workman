import ResourceManager from "../manager/resources_manager"
import { ResType, AtkType } from "../utils/enum"
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
    type: AtkType = null
    param: any = null
    init(id: number, start: cc.Vec2, end: cc.Vec2, time: number, damage: number, oid: number, type: AtkType, param?) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, `throw (${id})`)
        this.node.stopAllActions()
        this.oid = oid
        this.damage = damage
        this.node.angle = 0
        this.type = type
        this.param = param
        start.y += 65
        this.node.setPosition(start)
        let tween = new cc.Tween().target(this.node)
            .to(time, { x: end.x, y: end.y, angle: 900 }).call(this.endAni.bind(this)).start()
    }
    endAni() {
        switch (this.type) {
            case AtkType.normol:
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
                break
            case AtkType.range:
                let list = BattleUIManager.instance.getRangeMonsters(this.node.position, 100)//TODO: 待定100
                for (let i = 0; i < list.length; i++) {
                    list[i].getComponent(MonsterItem).beAtk(this.damage)
                }
                break
        }
        PoolManager.instance.removeObjectByName('throwItem', this.node)

    }
}
