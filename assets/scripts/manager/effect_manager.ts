
import PoolManager from "./pool_manager";
import MainManager from "./main_manager";
import DD from "./dynamic_data_manager";
import EffectItem from "../item/effect_item";
import { Utils } from "../utils/utils";
import BattleManager from "./battle_manager";
import BattleUIManager from "../ui/battle_ui_manager";
import DamageLabel from "../item/damage_label";
import ResourceManager from "./resources_manager";
import { ResType, SysType } from "../utils/enum";

const { ccclass, property } = cc._decorator;
/**
 * UI动画管理器
 */

@ccclass
export default class EffectManager extends cc.Component {

    static _instance: EffectManager = null


    static get instance() {
        if (this._instance == null) {
            this._instance = new EffectManager()
        }
        return this._instance
    }
    getWorldPos(node: cc.Node, parent: cc.Node) {
        let pos = node.convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(window.winSize.width / 2, window.winSize.height / 2))//.sub(parent.convertToNodeSpaceAR(cc.v2(0, 0))).neg()
        // console.log(node.convertToWorldSpaceAR(cc.v2(0, 0)), parent.convertToNodeSpaceAR(cc.v2(0, 0)))
        return pos
    }

    creatEffect(id: number, pos: cc.Vec3 | cc.Vec2, node: cc.Node = BattleUIManager.instance.effectContainer) {
        if (!DD.instance.config[SysType.effect]) return
        if (id == 0) return
        let effect = PoolManager.instance.createObjectByName('effectItem', node)
        effect.getComponent(EffectItem).init(id, pos, true)
    }

    // createMoneyEffect(startPos: cc.Vec3, num: number = 1, node: cc.Node = BattleUIManager.instance.effectContainer) {
    //     let floor = startPos.y - 25
    //     for (let i = 0; i < num; i++) {
    //         let effect = PoolManager.instance.createObjectByName('effectItem', node)
    //         effect.getComponent(EffectItem).init('icon', startPos, false)
    //         let highPos = cc.v2(startPos.x + Utils.getRandomNumber(80) - 40, startPos.y + Utils.getRandomNumber(30) + 10)
    //         effect.stopAllActions()
    //         effect.scale = 0.3
    //         let tween = new cc.Tween().target(effect).to(0.2, { scale: 1, x: highPos.x, y: highPos.y }, cc.easeOut(1))
    //             .to(0.5, { opacity: 150, x: highPos.x, y: floor }, cc.easeBounceOut()).call(() => {
    //                 PoolManager.instance.removeObjectByName('effectItem', effect)
    //             }).start()
    //     }
    // }

    createDamageLabel(str: string, pos: cc.Vec3 | cc.Vec2, cri: boolean = false, param?: any) {
        if (!DD.instance.config[SysType.damageLabel]) return

        let label = PoolManager.instance.createObjectByName('damageLabel', BattleUIManager.instance.damageLabelContainer)
        label.getComponent(DamageLabel).init(str, pos, cri, param)
    }

    createPartical(id: number, pos: cc.Vec2, node: cc.Node = BattleUIManager.instance.particalContaiher) {
        if (id == 0) return
        if (!DD.instance.config[SysType.effect]) return
        let partical = PoolManager.instance.createObjectByName('particalItem', node)
        partical.setPosition(pos)
        ResourceManager.instance.getPartical(id).then((res: cc.ParticleAsset) => {
            let par = partical.getComponent(cc.ParticleSystem)
            par.stopSystem()
            par.file = res
            par.custom = true
            let sf = ['', '', 'p3', '2_power', 'p5', 'p6', 'p7', 'p8', 'p7', '2_power']
            par.spriteFrame = ResourceManager.instance.getSprite(ResType.main, sf[id - 1])
            par.custom = false
            par.resetSystem()
        })
        return partical
        //  console.log(BattleUIManager.instance.particalContaiher.children.length)
    }

    creatSunEffect(num: number, startPos) {
        let pos = this.getWorldPos(BattleUIManager.instance.sunLabel.node, null)
        let parNode = this.createPartical(10, startPos)
        let tween = new cc.Tween(parNode).to(0.5, { x: pos.x, y: pos.y }, cc.easeIn(2)).call(() => {
            BattleManager.instance.sun += num
        }).start()
    }
}
