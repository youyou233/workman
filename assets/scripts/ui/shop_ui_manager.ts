import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import AudioManager from "../manager/audio_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import UIManager from "../manager/ui_manager"
import config from "../utils/config"
import { GuideType } from "../utils/enum"
import { Utils } from "../utils/utils"
import GuideUIManager from "./guide_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class ShopUIManager extends cc.Component {
    static instance: ShopUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null
    @property(cc.Button)
    freashBtn: cc.Button = null
    @property(cc.Label)
    lastFrashLabel: cc.Label = null
    frashTimer: any = null
    @property(cc.Button)
    guideBtn: cc.Button = null
    onLoad() {
        ShopUIManager.instance = this
        this.freashBtn.node.on('click', this.freash, this)
        this.guideBtn.node.on('click', this.showGuide, this)
    }
    showUI() {
        this.content.active = true
        this.clearContainers()
        DD.instance.shopData.forEach((item) => {
            let good = PoolManager.instance.createObjectByName('shopItem', this.container)
            good.getComponent(ShopItem).init(item)
        })
        this.freashBtn.node.active = DD.instance.ticket >= 10
        if (this.frashTimer) clearInterval(this.frashTimer)
        let leftTime = DD.instance.lastShopFrashTime + 100 * 60 * 1000 - new Date().getTime()
        if (leftTime > 0) {
            this.lastFrashLabel.string = '刷新倒计时' + Utils.getTimeFormat(Math.floor(leftTime / 1000))
            this.frashTimer = setInterval(() => {
                let left = DD.instance.lastShopFrashTime + 100 * 60 * 1000 - new Date().getTime()
                if (left > 0) {
                    this.lastFrashLabel.string = '刷新倒计时' + Utils.getTimeFormat(Math.floor(left / 1000))
                } else {
                    this.timeFrash()
                }
            }, 1000)
        } else {
            this.timeFrash()
        }
        if (DD.instance.guide[GuideType.main] && !DD.instance.guide[GuideType.main2]) {
            this.showGuide()
        }
    }
    showGuide() {
        UIManager.instance.openUI(GuideUIManager, {
            name: config.uiName.guideUI, param: [() => {
                DD.instance.guide[GuideType.main2] = true
            }, GuideType.main2]
        })
    }
    hideUI() {
        this.content.active = false
    }
    clearContainers() {
        for (let j = this.container.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('shopItem', this.container.children[j])
        }
    }
    freash() {
        AudioManager.instance.playAudio('click')

        if (DD.instance.ticket >= 10) {
            UIManager.instance.LoadMessageBox('刷新', '是否花费10张招待券立即刷新', (isOK) => {
                if (isOK) {
                    DD.instance.ticket -= 10
                    DD.instance.frashShop()
                    this.showUI()
                }
            })
        }
    }
    timeFrash() {
        if (this.frashTimer) clearInterval(this.frashTimer)
        if (this.content.active) {
            DD.instance.frashShop()
            this.showUI()
        }
    }
}