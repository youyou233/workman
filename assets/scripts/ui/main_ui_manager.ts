import GiftItem from "../item/gift_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import GroupUIManager from "./group_ui_manager"
import ShopUIManager from "./shop_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class MainUIManager extends cc.Component {
    static instance: MainUIManager = null

    @property(cc.Node)
    headerNode: cc.Node = null
    @property(cc.Label)
    moneyLabel: cc.Label = null
    @property(cc.Label)
    ticketLabel: cc.Label = null
    @property(cc.Node)
    btmNode: cc.Node = null
    @property(cc.Button)
    groupBtn: cc.Button = null
    @property(cc.Button)
    battleBtn: cc.Button = null
    @property(cc.Button)
    shopBtn: cc.Button = null

    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    giftContainer: cc.Node = null
    @property(cc.Button)
    levelBtn: cc.Button = null
    @property(cc.Button)
    bossBtn: cc.Button = null
    @property(cc.Button)
    unlimitedBtn: cc.Button = null

    onLoad() {
        MainUIManager.instance = this
        this.groupBtn.node.on('click', () => {
            this.switchUI(2)
        }, this)
        this.battleBtn.node.on('click', () => {
            this.switchUI(1)
        }, this)
        this.shopBtn.node.on('click', () => {
            this.switchUI(3)
        }, this)
    }
    showUI() {
        this.content.active = true
        // this.clearContainer()
        this.giftContainer.children.forEach((item: cc.Node, index) => {
            item.getComponent(GiftItem).init(DD.instance.giftData[index])
        })
    }
    hideUI() {
        this.content.active = false
    }
    clearContainer() {
        // for (let j = this.giftContainer.children.length - 1; j >= 0; j--) {
        //     PoolManager.instance.removeObjectByName('gitfItem', this.giftContainer.children[j])
        // }
    }
    /**
     * 
     * @param type 1主界面 2 队伍 3商店
     */
    switchUI(type: number) {
        if (type == 1) MainUIManager.instance.showUI()
        if (type != 1 && MainUIManager.instance.content.active) {
            MainUIManager.instance.hideUI()
        }
        if (type == 2) GroupUIManager.instance.showUI()
        if (type != 2 && GroupUIManager.instance.content.active) {
            GroupUIManager.instance.hideUI()
        }
        if (type == 3) ShopUIManager.instance.showUI()
        if (type != 3 && ShopUIManager.instance.content.active) {
            ShopUIManager.instance.hideUI()
        }
    }
}