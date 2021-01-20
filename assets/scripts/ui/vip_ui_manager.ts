import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import LvItem from "../item/lv_item"
import RewardItem from "../item/reward_item"
import ShopItem from "../item/shop_item"
import ActionManager from "../manager/action_manager"
import AudioManager from "../manager/audio_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import MainUIManager from "./main_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class VipUIManager extends cc.Component {
    static instance: VipUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null

    onLoad() {
        VipUIManager.instance = this

        this.mask.on('click', this.hideUI, this)
    }
    showUI() {
        AudioManager.instance.playAudio('openDialog')
        ActionManager.instance.showDialog(this.content, this.mask)
        this.clearContainers()
        for (let i = 1; i <= DD.instance.rank; i++) {
            let node = PoolManager.instance.createObjectByName('lvItem', this.container)
            if (!DD.instance.rankGift[i - 1]) {
                DD.instance.rankGift[i - 1] = [false, false]
            }
            node.getComponent(LvItem).init(i, DD.instance.rankGift[i - 1])
        }
    }
    hideUI() {
        // if (this.cb) this.cb()
        AudioManager.instance.playAudio('closeDialog')
        this.content.active = false
        MainUIManager.instance.haveGiftNode.active = DD.instance.haveGift()

    }
    clearContainers() {
        for (let j = this.container.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('lvItem', this.container.children[j])
        }

    }

}