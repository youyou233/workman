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
export default class ThrowCbItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    cb: Function = null
    init(id: number, start: cc.Vec2, end: cc.Vec2, time: number, cb: Function, jump: boolean) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, `throw (${id})`)
        this.node.stopAllActions()
        this.node.angle = 0
        start.y += 65
        this.node.setPosition(start)
        if (jump) {
            let jumpPos = cc.v2((start.x + end.x) / 2, (start.y + end.y) + 200)
            let tween = new cc.Tween().target(this.node)
                .to(time / 2, { x: jumpPos.x, y: jumpPos.y, angle: 450 }, cc.easeIn(3))
                .to(time / 2, { x: end.x, y: end.y, angle: 900 }, cc.easeOut(3))
                .call(this.endAni.bind(this)).start()
        } else {
            let tween = new cc.Tween().target(this.node)
                .to(time, { x: end.x, y: end.y, angle: 900 }).call(this.endAni.bind(this)).start()
        }

    }
    endAni() {
        this.cb()
        PoolManager.instance.removeObjectByName('throwItem', this.node)

    }
}
