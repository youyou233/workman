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
    lvNode: cc.Node = null
    onLoad() {
        this.lvNode = this.node.getChildByName('ui (11)')
        this.node.on('click', () => {
            this.cb && this.cb(this.data)
        }, this)
    }
    init(data: CardData, cb: Function, showLv: boolean = true) {
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
        let level = +Math.sqrt(data.lv).toFixed(0)
        if (level > 10) level = 10
        this.lvSp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'level_' + level
        )
        let roleData = JsonManager.instance.getDataByName('role')[data.id]
        this.qualitySp.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'rare_' + roleData['quality']
        )
        let colors = [cc.Color.WHITE, cc.Color.WHITE, cc.Color.WHITE, cc.color(14, 30, 0), cc.color(14, 30, 0),
        cc.Color.WHITE, cc.Color.WHITE, cc.Color.WHITE, cc.Color.WHITE, cc.color(72, 42, 0), cc.Color.WHITE]
        this.lvLabel.node.color = colors[level - 1]
        this.data = data
        this.cb = cb
        this.lvLabel.string = data.lv + ''
        setTimeout(() => {
            if (this.lvNode) {
                this.lvNode.active = showLv
            }
        });
    }

}