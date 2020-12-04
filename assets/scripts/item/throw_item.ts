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
    init(id: number, start: cc.Vec3, end: cc.Vec3, time: number, damage: number, oid: number) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, `throw (${id})`)
        this.node.stopAllActions()
        this.node.setPosition(start.x, start.y + 65)
        let tween = new cc.Tween().target(this.node)
            .to(time, { x: end.x, y: end.y }).call(() => {
                let monster = BattleUIManager.instance.findMonsterByOid(oid)
                if (monster) {
                    monster.beAtk(damage)
                } else {
                    let node = BattleUIManager.instance.findAheadMonster()
                    if (node && node.name == 'monsterItem') {
                        node.getComponent(MonsterItem).beAtk(damage)
                    } else if (node && node.name == 'bossItem') {
                        node.getComponent(BossItem).beAtk(damage)
                    }
                }
                PoolManager.instance.removeObjectByName('throwItem', this.node)
            }).start()
    }
}
