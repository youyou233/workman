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
    //TODO: 实装释放技能
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
    //TODO: 长按显示详情
    startTouch(event) {
        this.curCard = this.getTouchedCard(event)
        this.touchStart = new Date().getTime()
    }
    moveTouch(event) {
        if (this.curCard && this.curCard.getComponent(CardItem).data.isActive) {
            this.curCard.y += event.getDelta().y
            //console.log(event.getDelta())
            if (this.curCard.y > 150) this.curCard.y = 150
            if (this.curCard.y < 105) this.curCard.y = 105
        }
    }
    endTouch(event) {
        if (this.curCard) {
            if (new Date().getTime() - this.touchStart < 200) {
                let data = this.curCard.getComponent(CardItem).data
                UIManager.instance.LoadMessageBox(data.name, data.dec, null, null, false)
            } else if (this.curCard.y > 130) {
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