import ActionManager from "../manager/action_manager"
import AudioManager from "../manager/audio_manager"
import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import { BattleStatusType, GuideType } from "../utils/enum"

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
    @property(cc.Node)
    guideContent: cc.Node[] = []
    cb: Function = null
    onLoad() {
        GuideUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.certainBtn.node.on('click', this.hideUI, this)
    }
    showUI(cb: Function, type: GuideType) {
        AudioManager.instance.playAudio('openDialog')
        ActionManager.instance.showDialog(this.content, this.mask)
        this.cb = cb
        this.guideContent.forEach((item, index) => {
            item.active = ((type - 1) == index)
        })
    }
    hideUI() {
        AudioManager.instance.playAudio('closeDialog')
        // DD.instance.guide[1] = true
        // BattleManager.instance.status = BattleStatusType.play
        this.content.active = false

        if (this.cb) {
            this.cb()
        }
    }
}