import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import BossItem from "../item/boss_item"
import MonsterItem from "../item/monster_item"
import BattleUIManager from "../ui/battle_ui_manager"

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

    money: number = 100
    ticket: number = 100//招待券

    cards: CardData[] = []
    group: CardData[] = []
    giftData: GiftData[] = []
    shopData: ShopData[] = []
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
}