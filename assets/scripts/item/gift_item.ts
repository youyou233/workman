import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class GiftItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    @property(cc.Label)
    timeLabel: cc.Label = null

    data: any = null
    onLoad() {

    }
    init(data: GiftData) {

    }

}