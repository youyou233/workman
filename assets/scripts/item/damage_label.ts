import PoolManager from "../manager/pool_manager"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class DamageLabel extends cc.Component {
    //文字
    label: cc.Label = null
    outLine: cc.LabelOutline = null
    onLoad() {
        this.label = this.node.getComponent(cc.Label)
        this.outLine = this.node.getComponent(cc.LabelOutline)
    }
    init(str: string, pos: cc.Vec3 | cc.Vec2, cri: boolean = false, param?: any) {
        this.node.setPosition(pos)
        this.label.string = str
        this.node.opacity = 0
        if (param) {
            this.node.color = param.color
            this.outLine.color = param.outLineColor
            this.label.fontSize = param.fontSize
        } else {
            if (cri) {
                this.node.color = cc.Color.RED
                this.outLine.color = cc.Color.BLACK
                this.label.fontSize = 26
            } else {
                this.node.color = cc.Color.WHITE
                this.outLine.color = cc.Color.BLACK
                this.label.fontSize = 18
            }
        }

        this.showAni()
    }
    showAni() {
        // this.node.x += Utils.getRandomNumber(100) - 50
        this.node.y += 50
        this.node.opacity = 0
        let tween = new cc.Tween().target(this.node)
            .to(0.2, { opacity: 255, y: this.node.y + 50 }, cc.easeElasticOut(2))
            .delay(0.1)
            .call(() => {
                PoolManager.instance.removeObjectByName('damageLabel', this.node)
            })
            .start()
    }
}