import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import BattleManager from "../manager/battle_manager"
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
    @property(cc.Node)
    certainNode: cc.Node = null
    @property(cc.Button)
    difficultyBtns: cc.Button[] = []
    @property(cc.Button)
    moreMapBtn: cc.Button = null
    @property(cc.Button)
    mapMaskNode: cc.Button = null
    @property(cc.Node)
    mapAreaContainer: cc.Node = null
    @property(cc.Node)
    mapNode: cc.Node = null
    onLoad() {
        RankUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.container.children.forEach((item, index) => {
            item.on('click', () => {
                BattleManager.instance.initBattle()
                this.hideUI()
            }, this)
        })
        this.difficultyBtns.forEach((item, index) => {
            item.node.on('click', () => {
                this.certainNode.setPosition(item.node.position)
            }, this)
        })
        this.moreMapBtn.node.on('click', () => {
            this.mapNode.active = true
        }, this)
        this.mapMaskNode.node.on('click', () => {
            this.mapNode.active = false
        }, this)
    }
    showUI() {
        this.content.active = true
        this.mapNode.active = false
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