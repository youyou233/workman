import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import { BattleStatusType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class GuideUIManager extends cc.Component {
    static instance: GuideUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Button)
    certainBtn: cc.Button = null

    onLoad() {
        GuideUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.certainBtn.node.on('click', this.hideUI, this)
    }
    showUI() {
        this.content.active = true
        BattleManager.instance.status = BattleStatusType.pause
    }
    hideUI() {
        DD.instance.guide[1] = true
        BattleManager.instance.status = BattleStatusType.play
        // if (this.cb) this.cb()
        this.content.active = false
    }
}