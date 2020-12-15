import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import ResourceManager from "../manager/resources_manager"
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
    data: any = null
    onLoad() {

    }
    init(data: ShopData) {
        this.moneyLabel.string = data.price + ''
        this.icon.init(data.cardData, null)
    }

}