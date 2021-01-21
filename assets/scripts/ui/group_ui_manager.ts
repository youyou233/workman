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
    onLoad() {
        GroupUIManager.instance = this
        this.maskNode.on('click', this.touchMask, this)
    }
    showUI() {
        this.touchMask()
        this.clearContainers()
        this.content.active = true
        DD.instance.group.forEach((item) => {
            let icon = PoolManager.instance.createObjectByName('iconItem', this.curGroupNode)
            icon.y = 0
            icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
        })
        DD.instance.cards.forEach((item) => {
            let icon = PoolManager.instance.createObjectByName('iconItem', this.allGroupNode)
            icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
        })
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
    change: CardData = null
    onChange(changeData: CardData) {
        this.isChange = true
        this.maskNode.active = true
        this.change = changeData
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
}