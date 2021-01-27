import GiftItem from "../item/gift_item"
import AudioManager from "../manager/audio_manager"
import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import SDKManager from "../manager/sdk_manager"
import UIManager from "../manager/ui_manager"
import config from "../utils/config"
import { BattleType, FristDataType, GuideType, ResType } from "../utils/enum"
import GroupUIManager from "./group_ui_manager"
import GuideUIManager from "./guide_ui_manager"
import RankUIManager from "./rank_ui_manager"
import RewardUIManager from "./reward_ui_manager"
import ShopUIManager from "./shop_ui_manager"
import SysUIManager from "./sys_ui_manager"
import VipUIManager from "./vip_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class MainUIManager extends cc.Component {
    static instance: MainUIManager = null

    @property(cc.Node)
    headerNode: cc.Node = null
    @property(cc.Label)
    moneyLabel: cc.Label = null
    @property(cc.Label)
    ticketLabel: cc.Label = null
    @property(cc.Label)
    rankLabel: cc.Label = null
    @property(cc.Node)
    btmNode: cc.Node = null
    @property(cc.Button)
    groupBtn: cc.Button = null
    @property(cc.Button)
    battleBtn: cc.Button = null
    @property(cc.Button)
    shopBtn: cc.Button = null

    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    giftContainer: cc.Node = null
    @property(cc.Button)
    levelBtn: cc.Button = null
    @property(cc.Button)
    bossBtn: cc.Button = null
    @property(cc.Button)
    unlimitedBtn: cc.Button = null
    @property(cc.Node)
    moreTypePage: cc.Node = null
    @property(cc.Node)
    morePageMask: cc.Node = null
    @property(cc.Node)
    moreBtn: cc.Node = null
    @property(cc.Node)
    moreCloseBtn: cc.Node = null
    @property(cc.Label)
    unlimitedNumLabel: cc.Label = null
    @property(cc.Label)
    bossNumLabel: cc.Label = null
    @property(cc.Button)
    vipBtn: cc.Button = null
    @property(cc.Button)
    sysBtn: cc.Button = null
    @property(cc.Node)
    haveGiftNode: cc.Node = null
    @property(cc.Node)
    mainHeader: cc.Node = null
    @property(cc.Node)
    battleHeader: cc.Node = null
    @property(cc.Node)
    spNode: cc.Node = null
    @property(cc.Node)
    UINode: cc.Node = null
    @property(cc.ProgressBar)
    expProgress: cc.ProgressBar = null
    @property(cc.Label)
    expLabel: cc.Label = null
    @property(cc.Button)
    guideBtn: cc.Button = null
    @property(cc.Button)
    openVipBtn: cc.Button = null
    @property(cc.Node)
    leftVipNode: cc.Node = null
    @property(cc.Node)
    shareNode: cc.Node = null
    @property(cc.Node)
    shareGiftNode: cc.Node = null
    onLoad() {
        MainUIManager.instance = this
        this.UINode.active = false
        this.spNode.active = true
        this.shareNode.on('click', this.onShare, this)
        this.groupBtn.node.on('click', () => {
            this.switchUI(2)
        }, this)
        this.battleBtn.node.on('click', () => {
            this.switchUI(1)
        }, this)
        this.shopBtn.node.on('click', () => {
            this.switchUI(3)
        }, this)
        this.levelBtn.node.on('click', () => {
            UIManager.instance.openUI(RankUIManager, { name: config.uiName.rankUI })
        }, this)
        this.moreBtn.on('click', () => {
            this.moreTypePage.active = true
            AudioManager.instance.playAudio('openDialog')
            this.bossNumLabel.string = 'Boss Rush(' + DD.instance.changeTime['1'] + '/3)'
            this.unlimitedNumLabel.string = '无尽模式(' + DD.instance.changeTime['2'] + '/3)'
        })
        this.morePageMask.on('click', () => {
            this.moreTypePage.active = false
            AudioManager.instance.playAudio('closeDialog')
        })
        this.moreCloseBtn.on('click', () => {
            AudioManager.instance.playAudio('closeDialog')
            this.moreTypePage.active = false
        })
        this.vipBtn.node.on('click', () => {
            UIManager.instance.openUI(VipUIManager, { name: config.uiName.vipUI })
        })
        this.sysBtn.node.on('click', () => {
            UIManager.instance.openUI(SysUIManager, { name: config.uiName.sysUI })
        })
        this.unlimitedBtn.node.on('click', () => {
            AudioManager.instance.playAudio('click')
            if (DD.instance.changeTime['2'] <= 0) {
                UIManager.instance.LoadTipsByStr('今天没有次数了')
                return
            }
            BattleManager.instance.initBattle(BattleType.unlimited)
            this.moreTypePage.active = false
        }, this)
        this.bossBtn.node.on('click', () => {
            AudioManager.instance.playAudio('click')
            if (DD.instance.changeTime['1'] <= 0) {
                UIManager.instance.LoadTipsByStr('今天没有次数了')
                return
            }
            BattleManager.instance.initBattle(BattleType.boss)
            this.moreTypePage.active = false
        }, this)
        this.guideBtn.node.on('click', this.showGuide, this)
        this.openVipBtn.node.on('click', () => {
            if (!DD.instance.isVip()) {
                UIManager.instance.LoadMessageBox('开通精英', '是否花费100张招待券兑换一周精英', (isOK) => {
                    if (isOK) {
                        if (DD.instance.ticket > 100) {
                            DD.instance.openVip()
                            this.frashVipNode()
                        } else {
                            UIManager.instance.LoadTipsByStr('您的招待券不足')
                        }
                    }
                })
            }
        }, this)
    }
    showUI() {
        this.content.active = true
        // this.clearContainer()
        this.frashGitfs()
        if (DD.instance.guide[GuideType.battle] && !DD.instance.guide[GuideType.main]) {
            this.showGuide()
        }
        this.frashVipNode()
    }
    showGuide() {
        UIManager.instance.openUI(GuideUIManager, {
            name: config.uiName.guideUI, param: [() => {
                DD.instance.guide[GuideType.main] = true
            }, GuideType.main]
        })
    }
    frashVipNode() {
        let iconNode = this.leftVipNode.getChildByName('icon')
        if (DD.instance.isVip()) {
            let left = Math.ceil((DD.instance.vip - new Date().getTime()) / 1000 / 24 / 60)
            this.leftVipNode.getComponent(cc.Label).string = '剩余' + left + '天'
            iconNode.active = false
        } else {
            this.leftVipNode.getComponent(cc.Label).string = '100   /周'
            iconNode.active = true
        }
    }
    frashGitfs() {
        this.giftContainer.children.forEach((item: cc.Node, index) => {
            item.getComponent(GiftItem).init(DD.instance.giftData[index], index)
        })
    }
    hideUI() {
        this.content.active = false
    }
    clearContainer() {
        // for (let j = this.giftContainer.children.length - 1; j >= 0; j--) {
        //     PoolManager.instance.removeObjectByName('gitfItem', this.giftContainer.children[j])
        // }
    }
    /**
     * 
     * @param type 1主界面 2 队伍 3商店
     */
    switchUI(type: number) {
        AudioManager.instance.playAudio('openDialog')
        if (type == 1) MainUIManager.instance.showUI()
        if (type != 1 && MainUIManager.instance.content.active) {
            MainUIManager.instance.hideUI()
        }
        if (type == 2) GroupUIManager.instance.showUI()
        if (type != 2 && GroupUIManager.instance.content.active) {
            GroupUIManager.instance.hideUI()
        }
        if (type == 3) ShopUIManager.instance.showUI()
        if (type != 3 && ShopUIManager.instance.content.active) {
            ShopUIManager.instance.hideUI()
        }
        let btns = [this.battleBtn, this.groupBtn, this.shopBtn]
        btns.forEach((item, index) => {
            let name = '1_mainMenu'
            if (index == type - 1) {
                name = '1_mainBtnchoose'
            }
            item.node.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(ResType.main, name)
        })
    }
    onShare() {
        //this.shareGiftNode.active = false
        //UIManager.instance.LoadTipsByStr('分享','是否分享给好友')
        SDKManager.instance.onShare(() => {
            if (!DD.instance.fristDate[FristDataType.fristShare]) {
                DD.instance.fristDate[FristDataType.fristShare] = true
                this.shareGiftNode.active = false
                let reward = { ticket: 50, 5: 1 }
                UIManager.instance.openUI(RewardUIManager, {
                    name: config.uiName.rewardUI, param: [reward, '分享奖励', () => {
                        DD.instance.getReward(reward)
                    }]
                })
            }
        })

    }
}