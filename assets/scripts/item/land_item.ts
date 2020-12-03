import ResourceManager from "../manager/resources_manager"
import { RoleActionType } from "../utils/enum"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandItem extends cc.Component {
    @property(cc.Animation)
    roleAnima: cc.Animation = null
    @property(cc.Node)
    mergeStatus: cc.Node = null
    @property(cc.Node)
    stackContainer: cc.Node = null
    id: number
    _stack: number
    //对应位置
    curI: number = 0
    curJ: number = 0
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
    init(i, j) {
        //  this.addAnimationClip()
        this.curI = i
        this.curJ = j
        this.setNull()
        this.mergeStatus.active = false
    }
    setNull() {
        this.stack = 0
        this.roleAnima.stop()
        this.roleAnima.node.getComponent(cc.Sprite).spriteFrame = null
        this.stackContainer.active = false
        this.id = null
    }
    showRole(id) {
        this.id = id
        this.stackContainer.active = true
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
    checkMerge(landItem: LandItem) {
        if (this.id != landItem.id || this == landItem) {
            return false
        } else {
            return true
        }
    }
    updateMergeStatus(close: boolean, landItem?: LandItem) {
        if (close) {
            this.mergeStatus.active = false
        } else {
            if (this.checkMerge(landItem)) {
                this.mergeStatus.color = cc.Color.YELLOW
                this.mergeStatus.active = true
            } else {
                if (this == landItem) {
                    this.mergeStatus.color = cc.Color.RED
                    this.mergeStatus.active = true
                }
            }
        }

    }
}