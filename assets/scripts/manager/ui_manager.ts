import MessageBoxUIManager from "../ui/message_box_ui_manager"
import TipsUIManager from "../ui/tip_ui_manager"
//import TipsUIManager from "../ui/tips_ui_manager"

const { ccclass, property } = cc._decorator
interface OkCalBack {
    (isOK: boolean, param?: {}): void
}
@ccclass
export default class UIManager extends cc.Component {
    static _instance: UIManager = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new UIManager()
        }
        return this._instance
    }
    static Z_ORDER_1: number = 100
    static Z_ORDER_2: number = 200
    static Z_ORDER_3: number = 300
    static Z_ORDER_4: number = 400
    static Z_ORDER_5: number = 500
    static Z_ORDER_6: number = 600

    keyLock: { [key: string]: boolean } = {}
    loadUIRes(resUrl: string, depth: number, callBack: any) {
        if (UIManager.instance.keyLock[resUrl] == null) {
            UIManager.instance.keyLock[resUrl] = false
        }
        if (UIManager.instance.keyLock[resUrl] == false) {
            UIManager.instance.keyLock[resUrl] = true

            cc.loader.loadRes(resUrl, cc.Prefab, function (err, prefab) {
                if (err == null) {
                    let newNode = cc.instantiate(prefab) as cc.Node
                    let canvas = cc.director.getScene().getChildByName("Canvas")
                    canvas.addChild(newNode, depth)
                    callBack()

                    if (UIManager.instance.keyLoadTime[resUrl]) {
                        delete UIManager.instance.keyLoadTime[resUrl]
                        //GameManager.instance.clsoeLoadUITip()
                    }

                    delete UIManager.instance.keyLock[resUrl]
                } else {
                    console.error('加载失败', err, resUrl)
                    UIManager.instance.keyLock[resUrl] = false
                }
            })
        }
    }
    preLoadUI() {

        this.loadUIRes('ui/messagebox_ui', UIManager.Z_ORDER_5, function () {
        })
    }
    keyLoadTime: { [key: string]: number } = {}
    updateLoadTime(dt) {
        for (let item in this.keyLock) {
            if (this.keyLock[item] == true) {
                if (this.keyLoadTime[item] == null) {
                    this.keyLoadTime[item] = 0
                }
                if (this.keyLoadTime[item] != -1) {
                    this.keyLoadTime[item] += dt
                    if (this.keyLoadTime[item] > 1 && this.keyLoadTime[item] < 5) {
                        //GameManager.instance.loadingUI()
                    } else if (this.keyLoadTime[item] > 5) {
                        //GameManager.instance.loadUIFail()
                        this.keyLoadTime[item] = -1
                    }
                }
            }
        }
    }
    checkUIIsOpen(uiComponent: any) {
        return (uiComponent.instance && uiComponent.instance.content.active)
    }

    openUI(uiComponent: any, param: { name: string, param?: any[] }, zIndex = UIManager.Z_ORDER_2) {
        if (uiComponent.instance) {
            uiComponent.instance.showUI(...param.param)
        } else {
            this.loadUIRes('ui/' + param.name, zIndex, () => {
                uiComponent.instance.showUI(...param.param)
            })
        }
    }
    LoadTipsByStr(desc: string) {
        if (TipsUIManager.instance) {
            TipsUIManager.instance.showTipsByStr(desc)
        } else {
            this.loadUIRes("ui/tips_ui", UIManager.Z_ORDER_6, function () {
                TipsUIManager.instance.showTipsByStr(desc)
            })
        }
    }
    LoadMessageBox(title: string, desc: string, callback: OkCalBack = null, param: {} = null, isNormal: boolean = true, labels: string[] = null) {
        if (MessageBoxUIManager.instance) {
            MessageBoxUIManager.instance.showUI(title, desc, callback, param, isNormal, labels)
        } else {
            this.loadUIRes("ui/messagebox_ui", UIManager.Z_ORDER_4 + 1, function () {
                MessageBoxUIManager.instance.showUI(title, desc, callback, param, isNormal, labels)
            })
        }
    }
}