import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import AudioManager from "../manager/audio_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import StorageManager from "../manager/storage_manager"
import UIManager from "../manager/ui_manager"
import config from "../utils/config"
import { Utils } from "../utils/utils"
import RoleInfoUIManager from "./role_info_ui_manager"
import SortUIManager from "./sort_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class GroupUIManager extends cc.Component {
    static instance: GroupUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    curGroupNode: cc.Node = null
    @property(cc.Node)
    allGroupNode: cc.Node = null
    @property(cc.Node)
    maskNode: cc.Node = null
    @property(cc.Button)
    autoBetterBtn: cc.Button = null
    @property(cc.Button)
    sortBtn: cc.Button = null
    @property(cc.Button)
    allBtn: cc.Button = null
    isChange: boolean = false
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null

    onLoad() {
        GroupUIManager.instance = this
        this.maskNode.on('click', this.touchMask, this)
        this.autoBetterBtn.node.on('click', this.changeBetter, this)
        this.allBtn.node.on('click', this.resetSort, this)
        this.sortBtn.node.on('click', this.openSortUI, this)
    }
    showUI(list?) {
        this.touchMask()
        this.clearContainers()
        this.content.active = true
        DD.instance.group.forEach((item) => {
            let icon = PoolManager.instance.createObjectByName('iconItem', this.curGroupNode)
            icon.y = 0
            icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
        })
        if (SortUIManager.instance) {
            list = SortUIManager.instance.getList()
        }
        if (list) {
            list.forEach((item, index) => {
                if (index < 25) {
                    let icon = PoolManager.instance.createObjectByName('iconItem', this.allGroupNode)
                    icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
                }
            })
            if (list.length > 25) {
                //  UIManager.instance.LoadTipsByStr('最多只展示25个角色')
            }
        } else {
            DD.instance.cards.forEach((item, index) => {
                if (index < 25) {
                    let icon = PoolManager.instance.createObjectByName('iconItem', this.allGroupNode)
                    icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
                }
            })
            if (DD.instance.cards.length > 25) {
                // UIManager.instance.LoadTipsByStr('最多只展示25个角色')
            }
        }
        setTimeout(() => {
            this.maskNode.height = this.allGroupNode.height + 50
        }, 100);
    }
    hideUI() {
        this.content.active = false
    }
    clearContainers() {
        for (let j = this.curGroupNode.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('iconItem', this.curGroupNode.children[j])
        }
        for (let j = this.allGroupNode.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('iconItem', this.allGroupNode.children[j])
        }
    }
    changeBetter() {
        if (this.isChange) return
        for (let i = 0; i < 5; i++) {
            let group = Utils.deepCopy(DD.instance.group[i]) as CardData
            let change = group
            let changeIndex = -1
            for (let j = 0; j < DD.instance.cards.length; j++) {
                let card = DD.instance.cards[j]
                if (card.id == change.id && card.lv > change.lv) {
                    change = Utils.deepCopy(card) as CardData
                    changeIndex = j
                }
            }
            if (changeIndex != -1) {
                DD.instance.group[i] = change
                DD.instance.group[i].group = true
                DD.instance.cards[changeIndex] = group
                DD.instance.cards[changeIndex].group = false
            }
        }
        UIManager.instance.LoadTipsByStr('更新最强成功')
        this.showUI()
    }
    change: CardData = null
    onChange(changeData: CardData) {
        this.isChange = true
        this.maskNode.active = true
        this.change = changeData
        this.scroll.scrollToTop(0.2)
        AudioManager.instance.playAudio('click')
    }
    onChoose(data: CardData) {
        AudioManager.instance.playAudio('click')
        if (this.isChange) {
            let groupIndex = DD.instance.group.indexOf(data)
            let index = DD.instance.cards.indexOf(this.change)
            let newCard = Utils.deepCopy(data) as CardData
            newCard.group = false
            let newGroup = Utils.deepCopy(this.change) as CardData
            newGroup.group = true
            DD.instance.cards.splice(index, 1)
            DD.instance.cards.push(newCard)
            DD.instance.group[groupIndex] = newGroup
            this.showUI()
            StorageManager.instance.savePlayerData()

        } else {
            UIManager.instance.openUI(RoleInfoUIManager, { name: config.uiName.roleInfoUI, param: [data] }, 300)
        }
    }
    touchMask() {
        this.isChange = false
        this.maskNode.active = false
        AudioManager.instance.playAudio('closeDialog')

    }
    openSortUI() {
        UIManager.instance.openUI(SortUIManager, { name: config.uiName.sortUI })
    }
    onSort() {
        if (this.isChange) return

    }
    resetSort() {
        if (this.isChange) return
        this.showUI()
    }
}