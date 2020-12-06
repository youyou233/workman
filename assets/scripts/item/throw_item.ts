import ResourceManager from "../manager/resources_manager"
import { ResType, AtkType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"
import BattleUIManager from "../ui/battle_ui_manager"
import MonsterItem from "./monster_item"
import BossItem from "./boss_item"
import EffectManager from "../manager/effect_manager"
import { Utils } from "../utils/utils"

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
                let monster: MonsterItem | BossItem = BattleUIManager.instance.findMonsterByOid(this.oid)
                if (!monster) {
                    let node = BattleUIManager.instance.findAheadMonster()
                    if (node && node.name == 'monsterItem') {
                        monster = node.getComponent(MonsterItem)
                    } else if (node && node.name == 'bossItem') {
                        monster = node.getComponent(BossItem)
                    }
                }
                if (monster) {
                    monster.beAtk(this.damage, this.param)
                    EffectManager.instance.createDamageLabel(this.damage + '', monster.node.position)
                }
                EffectManager.instance.creatEffect(Utils.getRandomNumber(6) + 3, this.node.position)

                break
            case AtkType.range:
                let list = BattleUIManager.instance.getRangeMonsters(this.node.position, 100)//TODO: 待定100
                for (let i = 0; i < list.length; i++) {
                    let monster = null
                    if (list[i] && list[i].name == 'monsterItem') {
                        monster = list[i].getComponent(MonsterItem)
                    } else if (list[i] && list[i].name == 'bossItem') {
                        monster = list[i].getComponent(BossItem)
                    }
                    monster.beAtk(this.damage, this.param)
                    EffectManager.instance.createDamageLabel(this.damage + '', list[i].position)
                }
                EffectManager.instance.creatEffect(24, this.node.position)
                break
        }
        PoolManager.instance.removeObjectByName('throwItem', this.node)

    }
}
