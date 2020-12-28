import { AreaData } from "../interface/area_data"
import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import BossItem from "../item/boss_item"
import MonsterItem from "../item/monster_item"
import BattleUIManager from "../ui/battle_ui_manager"
import MainUIManager from "../ui/main_ui_manager"
import config from "../utils/config"
import { Utils } from "../utils/utils"
import JsonManager from "./json_manager"
import UIManager from "./ui_manager"

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
    _rank: number = 0
    set rank(val: number) {
        if (val > 20) val = 20
        this._rank = val
        MainUIManager.instance.rankLabel.string = config.lvString[val]
    }
    get rank() {
        return this._rank
    }
    cards: CardData[] = []
    group: CardData[] = []
    giftData: GiftData[] = [
        { isHave: false },
        { isHave: false },
        //{ isHave: false },
        { isHave: true, isStart: false, startTime: 1608082541, needTime: 600, quality: 2 },
        { isHave: false }]
    // { isHave: true, isStart: false, startTime: 1608082541, needTime: 5000, quality: 2 },
    // { isHave: true, isStart: true, startTime: 1608082541, needTime: 5000, quality: 1 }
    shopData: ShopData[] = [{ cardData: { id: 1, lv: 1 }, num: 1, price: 10 }]
    lastShopFrashTime: number = 0
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
                case 'bag':
                    this.addBag(rewards[keys[i]])
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
        this.shopData = []
        for (let i = 0; i <= Math.floor(this.rank / 20 * 8); i++) {
            let cardData = this.getRandomCard()
            let qua = JsonManager.instance.getDataByName('role')[cardData.id].quality
            this.shopData.push({
                cardData,
                num: 1,
                price: Math.floor(cardData.lv * 10 * qua)
            })
        }
    }
    findFreeBag() {
        for (let i = 0; i < this.giftData.length; i++) {
            if (!this.giftData[i].isHave) return i
        }
        return -1
    }
    addBag(data: GiftData) {
        let index = this.findFreeBag()
        if (index >= 0) {
            this.giftData[index] = data
            MainUIManager.instance.frashGitfs()
        } else {
            UIManager.instance.LoadTipsByStr('背包已满')
        }
    }

    getCurAreaDiff() {
        return this.areaData[this.area].diff
    }
    getRoleEffect(id: number, index: number) {
        return JsonManager.instance.getDataByName('role')[id]['effect'][index]
    }
    /**
     *  随机商店和随机获取奖励时获得的卡牌数据
     */
    getRandomCard(): CardData {
        let id = Utils.getRandomNumber(Math.floor(this.rank / 20 * 16) + 5) + 1
        let card: CardData = {
            lv: Utils.getRandomNumber(this.rank) + 1,
            id
        }
        return card
    }
    pauseGift(index) {
        this.giftData[index].isStart = false
        this.giftData[index].startTime = new Date().getTime()
        MainUIManager.instance.frashGitfs()
    }
}