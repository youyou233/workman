import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import StorageManager from "../manager/storage_manager"
import UIManager from "../manager/ui_manager"
import { Utils } from "../utils/utils"
import GroupUIManager from "./group_ui_manager"
import RoleInfoUIManager from "./role_info_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class MixUIManager extends cc.Component {
    static instance: MixUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    // @property(cc.Button)
    // addGroupBtn: cc.Button = null
    @property(cc.Button)
    mixBtn: cc.Button = null
    @property(IconItem)
    curIcon: IconItem = null
    @property(IconItem)
    mixIcon: IconItem = null
    @property(cc.Node)
    container: cc.Node = null
    @property(cc.Label)
    chanceLabel: cc.Label = null
    @property(cc.Label)
    numLabel: cc.Label = null
    card: CardData = null
    _choosedCards: CardData[] = []
    set choosedCards(cards: CardData[]) {
        this._choosedCards = cards
        let level = 0
        cards.forEach((item) => {
            level += item.lv
        })
        this.numLabel.string = 'x' + level + ''
        if (level == 0) {
            this.chanceLabel.string = '0%'
        } else {
            if (this.card.lv - level >= 10) {
                this.chanceLabel.string = '1%'
            } else {
                this.chanceLabel.string = 100 - (this.card.lv - level) * 10 + '%'
            }
        }
    }

    get choosedCards() {
        return this._choosedCards
    }
    onLoad() {
        MixUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.mixBtn.node.on('click', this.onMix, this)
    }
    showUI(card: CardData) {
        this.content.active = true
        this.curIcon.init(card, null)
        this.card = card
        this.mixIcon.init(null, null)
        this.choosedCards = []
        this.frashContainer()
    }
    frashContainer() {
        this.clearContainers()
        let list = DD.instance.cards.filter((item) => { return item.id == this.card.id })
        for (let i = 0; i < list.length; i++) {
            let node = PoolManager.instance.createObjectByName('iconItem', this.container)
            node.getComponent(IconItem).init(list[i], this.onAdd.bind(this))
        }
    }
    hideUI() {
        DD.instance.cards.push(...this._choosedCards)
        GroupUIManager.instance.showUI()
        RoleInfoUIManager.instance.showUI(this.card)
        this.content.active = false
    }
    clearContainers() {
        for (let j = this.container.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('iconItem', this.container.children[j])
        }
    }
    onAdd(card: CardData) {
        let index = DD.instance.cards.indexOf(card)
        if (card.lv > this.card.lv) {
            let oriIndex = DD.instance.group.indexOf(this.card)
            let swtichCard = Utils.deepCopy(card) as any
            let groupCard = Utils.deepCopy(DD.instance.group[oriIndex]) as any
            swtichCard.group = true
            groupCard.group = false
            DD.instance.group[oriIndex] = swtichCard
            this.card = DD.instance.group[oriIndex]
            this.choosedCards = this.choosedCards.concat(groupCard)
            DD.instance.cards.splice(index, 1)
            this.curIcon.init(swtichCard, null)
            this.mixIcon.init(groupCard, null)
            UIManager.instance.LoadTipsByStr('自动将高级的替换到队伍了')
            this.frashContainer()
        } else {
            this.mixIcon.init(card, null)
            this.choosedCards = this.choosedCards.concat(Utils.deepCopy(DD.instance.cards[index]) as any)
            DD.instance.cards.splice(index, 1)
            this.frashContainer()
        }


    }
    onMix() {
        let level = 0
        this.choosedCards.forEach((item) => {
            level += item.lv
        })
        if (level == 0) {
            UIManager.instance.LoadTipsByStr('请放入卡片')
            return
        }
        let chance = Utils.getRandomNumber(100)
        let target = 100 - (this.card.lv - level) * 10
        if (target <= 0) target = 0
        if (chance <= target) {
            UIManager.instance.LoadTipsByStr('强化成功')
            let index = DD.instance.group.indexOf(this.card)
            DD.instance.group[index].lv++
            this.curIcon.init(DD.instance.group[index], null)
        } else {
            UIManager.instance.LoadTipsByStr('强化失败')
        }
        this.choosedCards = []
        StorageManager.instance.savePlayerData()
    }
}