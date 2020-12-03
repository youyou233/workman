import ResourceManager from "../manager/resources_manager"
import { RoleActionType } from "../utils/enum"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandItem extends cc.Component {
    @property(cc.Animation)
    roleAnima: cc.Animation = null
    @property(cc.Node)
    stackContainer: cc.Node = null
    id: number
    _stack: number
    set stack(val: number) {
        this._stack = val
        this.stackContainer.children.forEach((item, index) => {
            item.active = index <= val
        })
    }
    get stack() {
        return this._stack
    }
    onLoad() {
        //       this.roleAnima = this.node.getChildByName('role').getComponent(cc.Animation)
    }
    init() {
        //  this.addAnimationClip()
        this.stack = 0
        this.roleAnima.stop()
        this.roleAnima.node.getComponent(cc.Sprite).spriteFrame = null
    }
    showRole(id) {
        this.id = id
        this.addAnimationClip()
    }

    addAnimationClip() {
        let clips = this.roleAnima.getClips()
        let type = Utils.getRandomNumber(7)
        let name = 'role_' + this.id + '_' + type
        if (clips.some((item) => {
            return item.name == name
        })) {
            this.roleAnima.play(name)
        } else {
            ResourceManager.instance.getRoleAnimation(this.id, type).then((res: cc.AnimationClip) => {
                this.roleAnima.addClip(res)
                this.roleAnima.play(res.name)
            }).catch((err) => {
                cc.log(err)
            })
        }
    }
}