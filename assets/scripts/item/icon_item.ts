import { CardData } from "../interface/card_data"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class IconItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    @property(cc.Sprite)
    qualitySp: cc.Sprite = null
    @property(cc.Label)
    lvLabel: cc.Label = null
    @property(cc.Sprite)
    lvSp: cc.Sprite = null
    data: any = null
    cb: Function = null
    onLoad() {
        this.node.on('click', () => {
            this.cb(this.data)
        }, this)
    }
    init(data: CardData, cb: Function) {
        // this.sp.spriteFrame = ResourceManager.instance.getSprite(
        //     ResType.main, spName
        // )
        this.data = data
        this.cb = cb
    }

}