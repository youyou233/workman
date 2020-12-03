import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class MonsterItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    onLoad() {
        //       this.roleAnima = this.node.getChildByName('role').getComponent(cc.Animation)
    }
    init(id: number) {
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.monster, `monster (${id})`)
    }
    onUpdate(dt) {

    }
}