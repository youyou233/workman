import { AreaData } from "../interface/area_data"
import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import BossItem from "../item/boss_item"
import MonsterItem from "../item/monster_item"
import BattleUIManager from "../ui/battle_ui_manager"
import MainUIManager from "../ui/main_ui_manager"

const { ccclass, property } = cc._decorator
/**
 * 此文件用于控制游戏中所有数据 以及可视化绑定
 */
@ccclass
export default class DD extends cc.Component {
    static _instance: DD = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new DD()
        }
        return this._instance
    }

    _money: number = 100
    set money(val: number) {
        this._money = val
        MainUIManager.instance.moneyLabel.string = this._money.toFixed(0)
    }
    get money() {
        return this._money
    }
    _ticket: number = 100//招待券
    set ticket(val: number) {
        this._ticket = val
        MainUIManager.instance.ticketLabel.string = this.ticket.toFixed(0)
    }
    get ticket() {
        return this._ticket
    }
    cards: CardData[] = []
    group: CardData[] = []
    giftData: GiftData[] = []
    shopData: ShopData[] = []
    area: number = 1
    areaData: { [key: number]: AreaData } = {
        1: {
            diff: 1,
            gift: [true, true, true],
            rank: [2, 3, 1]
        }
    }
    getMonsterByNode(monster): MonsterItem | BossItem {
        if (monster.name == 'monsterItem') {
            return monster.getComponent(MonsterItem)
        } else if (monster.name == 'bossItem') {
            return monster.getComponent(BossItem)
        }
    }
    checkCanUnlockGift() {
        return !this.giftData.some((item) => { return item.isStart == true })
    }
    getReward(rewards) {
        let keys = Object.keys(rewards)
        for (let i = 0; i < keys.length; i++) {
            switch (keys[i]) {
                case 'money':
                case 'ticket':
                    this[keys[i]] += rewards[keys[i]]
                    break
                default:
                    let card: CardData = {
                        group: false,
                        id: +keys[i],
                        lv: rewards[keys[i]]
                    }
                    this.cards.push(card)
                    break
            }
        }
    }
    /**
     * 刷新商店
     */
    frashShop() {

    }
    randomGetCurUnlockCard() {

    }

    getCurAreaDiff() {
        return this.areaData[this.area].diff
    }
}