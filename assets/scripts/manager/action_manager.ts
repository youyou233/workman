
const { ccclass, property } = cc._decorator;
/**
 * UI动画管理器
 */

@ccclass
export default class ActionManager extends cc.Component {

    static _instance: ActionManager = null


    static get instance() {
        if (this._instance == null) {
            this._instance = new ActionManager()
        }
        return this._instance
    }

    showDialog(content: cc.Node, mask?: cc.Node) {
        content.active = true
        content.opacity = 255
        content.scale = 0.5
        new cc.Tween()
            .target(content)
            .to(0.2, { scale: 1 }, cc.easeElasticOut(1))
            .start()
        if (mask) {
            mask.opacity = 0
            mask.scale = 5
            new cc.Tween()
                .target(mask)
                .to(0.2, { opacity: 155 }, cc.easeIn(1))
                .start()
        }
    }
    showFullPage(content: cc.Node) {
        content.opacity = 0
        content.active = true
        new cc.Tween()
            .target(content)
            .to(0.2, { opacity: 255 }, cc.easeIn(1))
            .start()
    }

    hideUI(content: cc.Node) {
        new cc.Tween()
            .target(content)
            .to(0.2, { opacity: 0 }, null)
            .call(() => {
                content.active = false
            })
            .start()
    }


}
