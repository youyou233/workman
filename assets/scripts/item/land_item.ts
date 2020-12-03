import ResourceManager from "../manager/resources_manager"
import { RoleActionType } from "../utils/enum"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandItem extends cc.Component {
    @property(cc.Animation)
    roleAnima: cc.Animation = null
    onLoad() {
        //       this.roleAnima = this.node.getChildByName('role').getComponent(cc.Animation)
    }
    init() {
        this.addAnimationClip()
    }
    addAnimationClip() {
        let clips = this.roleAnima.getClips()
        let type = Utils.getRandomNumber(7)
        let name = 'role_4_' + type
        if (clips.some((item) => {
            return item.name == name
        })) {
            this.roleAnima.play(name)
        } else {
            ResourceManager.instance.getRoleAnimation(4, type).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
                this.roleAnima.play(res.name)
            }).catch((err) => {
                cc.log(err)
            })
        }
    }
}