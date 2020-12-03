//import DataManager from "../manager/data_manager";

const { ccclass, property } = cc._decorator

//interface StoreItemCalBack{
//   (itemID:number):void;
//}

@ccclass
export default class TipsUIManager extends cc.Component {
    static instance: TipsUIManager = null

    @property(cc.Label)
    labelDesc: cc.Label = null

    @property(cc.Node)
    contentNode: cc.Node = null

    @property(cc.Label)
    labelDesc2: cc.Label = null
    @property(cc.Node)
    contentNode2: cc.Node = null

    @property(cc.Label)
    labelDesc3: cc.Label = null
    @property(cc.Node)
    contentNode3: cc.Node = null

    curShowIndex: number = 1

    onLoad() {
        // console.log("PoolManager Onload");
        TipsUIManager.instance = this
        this.contentNode.opacity = 0
        this.contentNode2.opacity = 0
        this.contentNode3.opacity = 0
    }


    showTipsByStr(info: string) {
        this.showTipByIndex(info)
        //this.labelDesc.string = info
        //this.contentNode.getComponent(cc.Animation).play("fade_out")
    }

    showTipByIndex(info: string) {
        let fadeoutAction = cc.sequence(cc.delayTime(1.2), cc.fadeOut(0.3))
        if (this.curShowIndex == 1) {
            this.labelDesc.string = info
            this.contentNode.stopAllActions()
            this.contentNode.opacity = 255
            this.contentNode.runAction(fadeoutAction)
        } else if (this.curShowIndex == 2) {
            this.labelDesc2.string = info
            this.contentNode2.stopAllActions()
            this.contentNode2.opacity = 255
            this.contentNode2.runAction(fadeoutAction)
        } else if (this.curShowIndex == 3) {
            this.labelDesc3.string = info
            this.contentNode3.stopAllActions()
            this.contentNode3.opacity = 255
            this.contentNode3.runAction(fadeoutAction)
        }
        this.curShowIndex++
        if (this.curShowIndex > 3) {
            this.curShowIndex = 1
        }
    }
}
