
import { ResType } from "../utils/enum"
import PoolManager from "../manager/pool_manager"

import EffectManager from "../manager/effect_manager"
import ResourceManager from "../manager/resources_manager"
import config from "../utils/config"


const { ccclass, property } = cc._decorator

@ccclass
export default class EffectItem extends cc.Component {
    //文字
    anima: cc.Animation = null
    isMoney: boolean = false
    recycle: boolean = false
    onLoad() {
        this.anima = this.node.getComponent(cc.Animation)
    }
    /**
     * @param effectId  特效id
     * @param pos 特效位置
     * @param recycle 是否回收特效
     */
    init(effectId: number | string, pos: cc.Vec3 | cc.Vec2, recycle: boolean = false) {
        let name = 'effect_' + effectId
        this.recycle = recycle
        let clips = this.anima.getClips()
        this.node.setPosition(pos)
        this.node.scale = 1
        this.node.opacity = 255
        if (this.timer) clearTimeout(this.timer)
        //  this.node.getComponent(cc.Sprite).spriteFrame = null
        if (clips.some((item: cc.AnimationClip) => {
            return item.name == name
        })) {
            this.playAnima(name)
        } else {
            ResourceManager.instance.getAnimation('effect_' + effectId, config.aniConfig[name], true).then((res: cc.AnimationClip) => {
                this.anima.addClip(res)
                this.playAnima(name)
            })
        }
    }
    timer: any = null

    playAnima(name) {
        this.anima.play(name)
        this.timer = setTimeout(() => {
            if (this.recycle) {
                this.node.getComponent(cc.Sprite).spriteFrame = null
                PoolManager.instance.removeObjectByName('effectItem', this.node)
            }
        }, 1000 / config.aniConfig[name].speed)
    }


}
