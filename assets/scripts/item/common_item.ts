import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class CommonItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    data: any = null
    init(spName, data) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, spName
        )
        this.data = data
    }

}