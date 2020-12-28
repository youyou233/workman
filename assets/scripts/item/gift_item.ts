import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import DD from "../manager/dynamic_data_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import MainUIManager from "../ui/main_ui_manager"
import RewardUIManager from "../ui/reward_ui_manager"
import config from "../utils/config"
import { ResType } from "../utils/enum"
import { Utils } from "../utils/utils"

const { ccclass, property } = cc._decorator

@ccclass
export default class GiftItem extends cc.Component {
    @property(cc.Sprite)
    sp: cc.Sprite = null
    @property(cc.Label)
    timeLabel: cc.Label = null
    @property(cc.Button)
    removeBtn: cc.Button = null
    data: GiftData = null
    timer: any = null
    index: number = 0
    onLoad() {
        this.node.on('click', this.onClick, this)
        this.removeBtn.node.on('click', this.remove, this)
    }
    init(data: GiftData, index) {
        this.index = index
        this.data = data
        if (this.timer) {
            clearInterval(this.timer)
        }
        if (!data.isHave) {
            this.timeLabel.string = '空'
            this.sp.node.active = false
            return
        } else {
            this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, 'bg_' + data.quality)
            this.sp.node.active = true
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
                if (this.timeLabel.string == '点击领取') {
                    let reward = this.getGiftData()
                    UIManager.instance.openUI(RewardUIManager, { name: config.uiName.rewardUI, param: [reward, '打开背包'] })
                    DD.instance.giftData[this.index] = { isHave: false, isStart: false }
                    DD.instance.getReward(reward)
                    MainUIManager.instance.frashGitfs()
                } else {
                    UIManager.instance.LoadMessageBox('提示', '是否要取消解锁', (isOK) => {
                        if (isOK) {
                            clearInterval(this.timer)
                            DD.instance.pauseGift(this.index)
                        }
                    })
                }
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
        let left = this.data.startTime + this.data.needTime - new Date().getTime() / 1000
        if (left < 0) {
            this.timeLabel.string = '点击领取'
            clearInterval(this.timer)
        } else {
            this.timeLabel.string = Utils.getTimeFormat(left)
        }
        this.timer = setInterval(() => {
            let left = this.data.startTime + this.data.needTime - new Date().getTime() / 1000
            if (left < 0) {
                this.timeLabel.string = '点击领取'
                clearInterval(this.timer)
            } else {
                this.timeLabel.string = Utils.getTimeFormat(left)
            }
        }, 1000)
    }
    getGiftData() {
        let reward = { 'money': Math.floor(this.data.needTime / 10 * this.data.quality) }
        if (this.data.quality >= 3) {
            reward['ticket'] = this.data.quality * 10
        }
        if (this.data.needTime >= 600) {
            for (let i = 0; i < this.data.needTime / 600; i++) {
                let card = DD.instance.getRandomCard()
                if (reward[card.id]) {
                    reward[card.id]++
                } else {
                    reward[card.id] = 1
                }
            }
        }
        return reward
    }
    remove() {
        UIManager.instance.LoadMessageBox('确认删除', '是否确认删除该背包？', (isOK) => {
            if (isOK) {
                DD.instance.giftData[this.index] = { isHave: false, isStart: false }
                MainUIManager.instance.frashGitfs()
                if (this.timer) {
                    clearInterval(this.timer)
                }
            }
        })

    }
}