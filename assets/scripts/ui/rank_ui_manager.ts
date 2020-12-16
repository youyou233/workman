import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class RankUIManager extends cc.Component {
    static instance: RankUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null
    @property(cc.Button)
    testBtn: cc.Button = null

    onLoad() {
        RankUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
    }
    showUI() {
        this.content.active = true
        // this.clearContainers()
        // DD.instance.shopData.forEach((item) => {
        //     let good = PoolManager.instance.createObjectByName('shopItem', this.container)
        //     good.getComponent(ShopItem).init(item)
        // })
    }
    hideUI() {
        this.content.active = false
    }
    clearContainers() {
        for (let j = this.container.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('shopItem', this.container.children[j])
        }

    }

}