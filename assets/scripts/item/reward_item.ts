import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import JsonManager from "../manager/json_manager"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"
import IconItem from "./icon_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class RewardItem extends cc.Component {
    @property(IconItem)
    icon: IconItem = null
    @property(cc.Label)
    label: cc.Label = null
    @property(cc.Node)
    currencyNode: cc.Node = null
    @property(cc.Sprite)
    currencySp: cc.Sprite = null

    init(data) {
        let key = Object.keys(data)[0]
        this.currencyNode.active = false
        this.icon.node.active = false
        switch (key) {
            case 'money':
                this.currencyNode.active = true
                this.currencySp.spriteFrame = ResourceManager.instance.getSprite(
                    ResType.main, 'icon (3)'
                )
                this.label.string = '获得金币*' + data[key]
                break
            case 'ticket':
                this.currencyNode.active = true
                this.currencySp.spriteFrame = ResourceManager.instance.getSprite(
                    ResType.main, 'icon (11)'
                )
                this.label.string = '获得招待券*' + data[key]
                break
            case 'bag':
                this.currencyNode.active = true
                this.currencySp.spriteFrame = ResourceManager.instance.getSprite(
                    ResType.main, 'bg_' + data[key].quality
                )
                this.label.string = '获得新的背包'
                break
            default:
                this.icon.node.active = true
                let card: CardData = {
                    id: +key, lv: data[key]
                }
                this.icon.init(card, null)
                let roleName = JsonManager.instance.getDataByName('role')[key].name
                this.label.string = `获得Lv${data[key]}${roleName}`
                break
        }
    }

}