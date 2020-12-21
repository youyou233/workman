import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import DD from "../manager/dynamic_data_manager"
import JsonManager from "../manager/json_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import RoleInfoUIManager from "../ui/role_info_ui_manager"
import ShopUIManager from "../ui/shop_ui_manager"
import config from "../utils/config"
import { ResType } from "../utils/enum"
import IconItem from "./icon_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class ShopItem extends cc.Component {
    @property(IconItem)
    icon: IconItem = null
    @property(cc.Label)
    moneyLabel: cc.Label = null
    @property(cc.Label)
    nameLabel: cc.Label = null
    data: ShopData = null
    @property(cc.Button)
    buyBtn: cc.Button = null
    onLoad() {
        this.buyBtn.node.on('click', this.onBuy.bind(this), this)
    }
    init(data: ShopData) {
        this.data = data
        this.moneyLabel.string = data.price + ''
        if (DD.instance.money >= data.price) {
            this.moneyLabel.node.color = cc.Color.WHITE
        } else {
            this.moneyLabel.node.color = cc.Color.RED
        }
        this.icon.init(data.cardData, () => {
            UIManager.instance.openUI(RoleInfoUIManager, { name: config.uiName.roleInfoUI, param: [data.cardData, false] })
        })
        let role = JsonManager.instance.getDataByName('role')[data.cardData.id]
        this.nameLabel.string = 'Lv' + data.cardData.lv + role.name
    }
    onBuy() {
        if (DD.instance.money >= this.data.price) {
            DD.instance.money -= this.data.price
            DD.instance.cards.push(this.data.cardData)
            let index = DD.instance.shopData.indexOf(this.data)
            DD.instance.shopData.splice(index, 1)
            ShopUIManager.instance.showUI()
            UIManager.instance.LoadTipsByStr('购买成功')
        } else {
            UIManager.instance.LoadTipsByStr('您的金币不足')
        }

    }

}