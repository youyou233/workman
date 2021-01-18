import GiftItem from "../item/gift_item"
import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import config from "../utils/config"
import { BattleType, ResType } from "../utils/enum"
import GroupUIManager from "./group_ui_manager"
import RankUIManager from "./rank_ui_manager"
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
    onLoad() {
        MainUIManager.instance = this
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
            this.bossNumLabel.string = 'Boss Rush(' + DD.instance.changeTime['1'] + '/3)'
            this.unlimitedNumLabel.string = '无尽模式(' + DD.instance.changeTime['2'] + '/3)'
        })
        this.morePageMask.on('click', () => {
            this.moreTypePage.active = false
        })
        this.moreCloseBtn.on('click', () => {
            this.moreTypePage.active = false
        })
        this.vipBtn.node.on('click', () => {
            UIManager.instance.openUI(VipUIManager, { name: config.uiName.vipUI })
        })
        this.sysBtn.node.on('click', () => {
            UIManager.instance.openUI(SysUIManager, { name: config.uiName.sysUI })
        })
        this.unlimitedBtn.node.on('click', () => {
            if (DD.instance.changeTime['2'] <= 0) {
                UIManager.instance.LoadTipsByStr('今天没有次数了')
                return
            }
            BattleManager.instance.initBattle(BattleType.unlimited)
            this.moreTypePage.active = false
        }, this)
        this.bossBtn.node.on('click', () => {
            if (DD.instance.changeTime['1'] <= 0) {
                UIManager.instance.LoadTipsByStr('今天没有次数了')
                return
            }
            BattleManager.instance.initBattle(BattleType.boss)
            this.moreTypePage.active = false
        }, this)
    }
    showUI() {
        this.content.active = true
        // this.clearContainer()
        this.frashGitfs()
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
}