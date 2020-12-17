import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import RewardItem from "../item/reward_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class RewardUIManager extends cc.Component {
    static instance: RewardUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null
    @property(cc.Button)
    certainBtn: cc.Button = null
    onLoad() {
        RewardUIManager.instance = this
        this.certainBtn.node.on('click', this.hideUI, this)

        this.mask.on('click', this.hideUI, this)

    }
    showUI(rewards) {
        this.content.active = true
        this.clearContainers()
        let keys = Object.keys(rewards)
        for (let i = 0; i < keys.length; i++) {
            let reward = PoolManager.instance.createObjectByName('rewardItem', this.container)
            let obj = {}
            obj[keys[i]] = rewards[keys[i]]
            reward.getComponent(RewardItem).init(obj)
        }
    }
    hideUI() {
        this.content.active = false
    }
    clearContainers() {
        for (let j = this.container.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('rewardItem', this.container.children[j])
        }

    }

}