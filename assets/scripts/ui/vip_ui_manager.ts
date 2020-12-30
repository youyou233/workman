import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import RewardItem from "../item/reward_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"

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
        this.content.active = true
        // this.clearContainers()
    }
    hideUI() {
        // if (this.cb) this.cb()
        this.content.active = false
    }
    clearContainers() {
        // for (let j = this.container.children.length - 1; j >= 0; j--) {
        //     PoolManager.instance.removeObjectByName('rewardItem', this.container.children[j])
        // }

    }

}