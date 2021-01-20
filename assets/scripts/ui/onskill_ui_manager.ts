import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import RewardItem from "../item/reward_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import JsonManager from "../manager/json_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class OnskillUIManager extends cc.Component {
    static instance: OnskillUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Sprite)
    roleIcon: cc.Sprite = null
    @property(cc.Label)
    skillLabel: cc.Label = null
    // @property(cc.Sprite)
    // cardBg: cc.Sprite = null
    onLoad() {
        OnskillUIManager.instance = this
        // this.mask.on('click', this.hideUI, this)
    }
    showUI(id: number) {
        let skillData = JsonManager.instance.getDataByName('skill')[id]
        this.roleIcon.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'role_' + id
        )
        this.skillLabel.string = skillData.name
        // this.cardBg.spriteFrame = ResourceManager.instance.getSprite(
        //     ResType.main, 'card_' + id
        // )
        this.content.active = true
        setTimeout(() => {
            this.hideUI()
        }, 1000)
    }
    hideUI() {
        this.content.active = false
    }

}