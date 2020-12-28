//import CostItem from "../controller/ui/cost_items"

// import UIAnimaManager from "../manager/action_manager"

const { ccclass, property } = cc._decorator

interface OkCalBack {
    (isOK: boolean, param?: {}): void
}

@ccclass
export default class MessageBoxUIManager extends cc.Component {
    static instance: MessageBoxUIManager = null

    @property(cc.Node)
    uiNode: cc.Node = null

    @property(cc.Node)
    maskNode: cc.Node = null

    @property(cc.Label)
    labelTitle: cc.Label = null

    @property(cc.Label)
    labelDesc: cc.Label = null

    @property(cc.Button)
    buttonCancel: cc.Button = null
    @property(cc.Button)
    buttonConfirm: cc.Button = null

    @property(cc.Label)
    labelCancel: cc.Label = null
    @property(cc.Label)
    labelConfirm: cc.Label = null
    // @property(CostItem)
    // costItems: CostItem = null


    curCallBack: OkCalBack = null
    curParam: any = null


    _isClick: boolean = false

    onLoad() {
        // console.log("PoolManager Onload");
        MessageBoxUIManager.instance = this

        this.maskNode.on('click', this.cancel, this);

        this.buttonCancel.node.on("click", this.cancel, this)
        this.buttonConfirm.node.on("click", this.confirm, this)

        if (this.uiNode.active) {
            this.uiNode.active = false
        }
    }

    showUI(title: string, desc: string, callback: OkCalBack = null, param: {} = null, isNormal: boolean = true, labels: string[] = null) {
        if (!this.uiNode.active) {
            this.uiNode.active = true
            //  UIAnimaManager.instance.showDialog(this.uiNode, this.maskNode)
        }
        //  AudioManager.instance.playAudio('ui_open')
        if (labels) {
            this.labelCancel.string = labels[1]
            this.labelConfirm.string = labels[2]
        } else {
            this.labelCancel.string = '取 消'
            this.labelConfirm.string = '确 定'
        }
        this.labelTitle.string = title
        this.labelDesc.string = desc
        if (callback != null) {
            //console.log("需要回调函数")
            this.curCallBack = callback
        } else {
            this.curCallBack = null
        }
        this.curParam = param

        if (isNormal) {
            this.buttonCancel.node.active = true
            this.buttonConfirm.node.position = new cc.Vec3(100, -140)
        } else {
            this.buttonCancel.node.active = false
            this.buttonConfirm.node.position = new cc.Vec3(0, -140)
        }
        //   console.log('打开', this.node.parent.name)
    }

    cancel() {
        //console.log("取消")
        if (this.curCallBack != null) {
            this.curCallBack(false, this.curParam)
        }
        this.hideUI()
    }

    confirm() {
        //console.log("确定")
        if (this._isClick) {
            return
        }
        this._isClick = true
        this.scheduleOnce(function () {
            this._isClick = false
        }, 0.2)

        if (this.curCallBack != null) {
            this.curCallBack(true, this.curParam)
        }
        this.hideUI()
    }
    hideUI() {
        this.uiNode.active = false
        //  AudioManager.instance.playAudio('ui_close')

    }
}
