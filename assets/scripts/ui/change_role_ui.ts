import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import LvItem from "../item/lv_item"
import RewardItem from "../item/reward_item"
import ShopItem from "../item/shop_item"
import ActionManager from "../manager/action_manager"
import AudioManager from "../manager/audio_manager"
import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import BattleUIManager from "./battle_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class ChangeRoleUI extends cc.Component {
    static instance: ChangeRoleUI = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null

    onLoad() {
        ChangeRoleUI.instance = this
        // this.mask.on('click', this.hideUI, this)
    }
    showUI(id: number) {
        let index = 0
        AudioManager.instance.playAudio('openDialog')
        ActionManager.instance.showDialog(this.content, this.mask)

        for (let i = 0; i < 5; i++) {
            let card = BattleManager.instance.team[i]
            if (card.id != id) {
                let icon = this.container.children[index].getComponent(IconItem)
                icon.init(card, this.onChoose.bind(this))
                index++
            }
        }
    }
    onChoose(data) {
        BattleUIManager.instance.changeRole(data.id)
        AudioManager.instance.playAudio('click_2')
        this.hideUI()
    }
    hideUI() {
        // if (this.cb) this.cb()
        this.content.active = false
    }


}