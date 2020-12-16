import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import DD from "../manager/dynamic_data_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import { ResType } from "../utils/enum"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class GiftItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    @property(cc.Label)
    timeLabel: cc.Label = null

    data: GiftData = null
    timer: any = null
    index: number = 0
    onLoad() {
        this.node.on('click', this.onClick, this)
    }
    init(data: GiftData, index) {
        this.index = index
        this.data = data
        if (!data.isHave) {
            this.timeLabel.string = '空'
            this.sp.spriteFrame = null
            return
        }
        if (this.timer) {
            clearInterval(this.timer)
        }
        if (data.isStart) {
            this.startTimer()
        } else {
            this.timeLabel.string = '待开启'
        }
    }
    onClick() {
        if (this.data.isHave) {
            if (this.data.isStart) {
                UIManager.instance.LoadMessageBox('提示', '是否要取消解锁', (isOK) => {
                    if (isOK) {
                        this.data.isStart = false
                    }
                })
            } else {
                if (DD.instance.checkCanUnlockGift()) {
                    DD.instance.giftData[this.index].isStart = true
                    DD.instance.giftData[this.index].startTime = new Date().getTime() / 1000
                    this.data = DD.instance.giftData[this.index]
                    this.startTimer()
                } else {
                    UIManager.instance.LoadTipsByStr('已经有其他礼物在解锁')
                }
            }
        }

    }
    startTimer() {
        this.timer = setInterval(() => {
            let left = this.data.startTime + this.data.needTime - new Date().getTime() / 1000
            if (left < 0) {
                this.timeLabel.string = '点击领取'
            } else {
                this.timeLabel.string = Utils.getTimeFormat(left)
            }
        }, 1000)
    }
}