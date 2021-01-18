import PoolManager from "../manager/pool_manager"
import CardItem from "../item/card_item"
import UIManager from "../manager/ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleSkillUIManager extends cc.Component {
    static instance: BattleSkillUIManager = null
    @property(cc.Node)
    cardContainer: cc.Node = null
    @property(cc.Node)
    touchGround: cc.Node = null
    onLoad() {
        BattleSkillUIManager.instance = this
        this.touchGround.on(cc.Node.EventType.TOUCH_START, this.startTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_END, this.endTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_CANCEL, this.endTouch, this)
    }
    initBattle() {
        this.clearContainer()
        for (let i = 0; i < 5; i++) {
            let card = PoolManager.instance.createObjectByName('cardItem', this.cardContainer)
            card.getComponent(CardItem).init(i)
        }
    }
    clearContainer() {
        for (let j = this.cardContainer.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('cardItem', this.cardContainer.children[j])
        }
    }
    onUpdate(dt) {
        this.cardContainer.children.forEach((item) => {
            item.getComponent(CardItem).onUpdate(dt)
        })
    }
    curCard: cc.Node = null
    touchStart: number = 0
    startTouch(event) {
        this.curCard = this.getTouchedCard(event)
        this.touchStart = new Date().getTime()
    }
    moveTouch(event) {
        if (this.curCard && this.curCard.getComponent(CardItem).data.isActive) {
            let cardSp = this.curCard.getComponent(CardItem).qualitySp.node
            cardSp.y += event.getDelta().y
            //console.log(event.getDelta())
            if (cardSp.y > 105) {
                cardSp.y = 105
            } else if (cardSp.y < 60) {
                cardSp.y = 59
            }
        }
    }
    endTouch(event) {
        if (this.curCard) {
            let cardSp = this.curCard.getComponent(CardItem).qualitySp.node
            if (new Date().getTime() - this.touchStart < 100) {
                let data = this.curCard.getComponent(CardItem).data
                UIManager.instance.LoadMessageBox(data.name, data.dec, null, null, false)
            } else if (cardSp.y < 80) {
                this.curCard.getComponent(CardItem).onSkill()
            }
        }
    }
    getTouchedCard(event): cc.Node {
        for (let i = 0; i < this.cardContainer.children.length; i++) {
            let node = this.cardContainer.children[i]
            let cardItem = node.getComponent(CardItem)
            if (cardItem.coolTimer == 0 && node.getBoundingBoxToWorld().contains(event.getLocation())) {
                return node
            }
        }
        return null
    }
}