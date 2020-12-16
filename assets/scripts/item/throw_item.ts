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
                EffectManager.instance.creatEffect(Utils.getRandomNumber(6) + 3, this.node.position)

                break
            case AtkType.range:
            case AtkType.randomRange:
                list = BattleUIManager.instance.getRangeMonsters(this.node.position, this.param.range)//TODO: 待定100
                for (let i = 0; i < list.length; i++) {
                    let monster = DD.instance.getMonsterByNode(list[i])
                    monster.beAtk(this.damage, this.param)
                }
                EffectManager.instance.creatEffect(24, this.node.position)
                break
            case AtkType.chain:
                let num = this.param.stack + 2
                list = BattleUIManager.instance.findArrMonster(num)
                for (let i = 0; i < list.length; i++) {
                    let monster = DD.instance.getMonsterByNode(list[i])
                    monster.beAtk(this.damage, this.param)
                }
                EffectManager.instance.creatEffect(18, this.node.position)
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
                EffectManager.instance.creatEffect(Utils.getRandomNumber(6) + 3, this.node.position)
                break
        }
        PoolManager.instance.removeObjectByName('throwItem', this.node)

    }
}
