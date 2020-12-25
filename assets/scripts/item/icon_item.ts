import { CardData } from "../interface/card_data"
import JsonManager from "../manager/json_manager"
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
            this.cb && this.cb(this.data)
        }, this)
    }
    init(data: CardData, cb: Function) {
        if (!data) {
            this.lvLabel.string = ''
            this.sp.spriteFrame = null
            this.qualitySp.spriteFrame = ResourceManager.instance.getSprite(
                ResType.main, 'rare_1'
            )
            return
        }
        this.sp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'role_' + data.id
        )
        this.lvSp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'level_' + Math.sqrt(data.lv).toFixed(0)
        )
        let roleData = JsonManager.instance.getDataByName('role')[data.id]
        this.qualitySp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'rare_' + roleData['quality']
        )
        this.data = data
        this.cb = cb
        this.lvLabel.string = data.lv + ''
    }

}