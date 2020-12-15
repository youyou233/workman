import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"

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

    isChange: boolean = false
    onLoad() {
        GroupUIManager.instance = this
        this.maskNode.on('click', this.touchMask, this)
    }
    showUI() {
        this.content.active = true
        this.touchMask()
        this.clearContainers()
        DD.instance.group.forEach((item) => {
            let icon = PoolManager.instance.createObjectByName('iconItem', this.curGroupNode)
            icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
        })
        DD.instance.cards.forEach((item) => {
            let icon = PoolManager.instance.createObjectByName('iconItem', this.allGroupNode)
            icon.getComponent(IconItem).init(item, this.onChoose.bind(this))
        })
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
    onChange() {
        this.isChange = true
        this.maskNode.active = true
    }
    onChoose(data: CardData) {
        if (this.isChange) {
            //
            this.showUI()
        } else {

        }
    }
    touchMask() {
        this.isChange = false
        this.maskNode.active = false
    }
}