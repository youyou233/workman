import { AreaData } from "../interface/area_data"
import { CardData } from "../interface/card_data"
import { GiftData } from "../interface/gift_data"
import { ShopData } from "../interface/shop_data"
import BossItem from "../item/boss_item"
import MonsterItem from "../item/monster_item"
import BattleUIManager from "../ui/battle_ui_manager"
import MainUIManager from "../ui/main_ui_manager"
import RewardUIManager from "../ui/reward_ui_manager"
import config from "../utils/config"
import { Utils } from "../utils/utils"
import JsonManager from "./json_manager"
import StorageManager from "./storage_manager"
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
    _rank: number = 1
    set rank(val: number) {
        return
    }
    get rank() {
        for (let i = 1; i <= 20; i++) {
            if (this.exp < 10 + (i - 1) * i * 10) {
                return i
            }
        }
        return 20
        //   return Math.floor(this.exp)
    }
    _exp: number = 0
    set exp(val) {
        this._exp = val
        MainUIManager.instance.rankLabel.string = config.lvString[this.rank - 1]
    }
    get exp() {
        return this._exp
    }
    cards: CardData[] = []
    group: CardData[] = []
    giftData: GiftData[] = [
        { isHave: false },
        { isHave: false },
        { isHave: false },
        //{ isHave: true, isStart: false, startTime: 1608082541, needTime: 600, quality: 2 },
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
            rank: [1, 1, 1]
        }
    }
    guide: object = { 1: false, 2: false, 3: false, 4: false }//教程查看
    changeTime: object = {
        1: 3, 2: 3
    }
    lastLogin: number = 0

    rankGift: [boolean, boolean][] = []
    vip: number = 0//写到期时间
    config: object = null
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
                    console.log(rewards[keys[i]])
                    this.addBag(rewards[keys[i]])
                    break
                case 'exp':
                    this.exp += rewards[keys[i]]
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
        StorageManager.instance.savePlayerData()
    }
    onCost(data) {
        let keys = Object.keys(data)
        switch (keys[0]) {
            case 'money':
            case 'ticket':
                this[keys[0]] -= data[keys[0]]
                break
            default:
                this.cards.splice(data[keys[0]], 1)
        }
        StorageManager.instance.savePlayerData()
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
        this.lastShopFrashTime = new Date().getTime()
        StorageManager.instance.savePlayerData()
    }
    findFreeBag() {
        for (let i = 0; i < this.giftData.length; i++) {
            if (!this.giftData[i].isHave) return i
        }
        return -1
    }
    startUnlockBag(index) {
        this.giftData[index].isStart = true
        this.giftData[index].startTime = new Date().getTime() / 1000
        StorageManager.instance.savePlayerData()
    }
    addBag(data: GiftData) {
        let index = this.findFreeBag()
        if (index >= 0) {
            this.giftData[index] = data
            MainUIManager.instance.frashGitfs()
        } else {
            UIManager.instance.LoadTipsByStr('背包已满')
        }
        StorageManager.instance.savePlayerData()
    }
    removeBag(index) {
        this.giftData[index] = { isHave: false }
        StorageManager.instance.savePlayerData()
    }
    pauseGift(index) {
        this.giftData[index].isStart = false
        this.giftData[index].startTime = new Date().getTime()
        MainUIManager.instance.frashGitfs()
        StorageManager.instance.savePlayerData()
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
    getRandomCard(mult?: number): CardData {
        let quality = Utils.getRandomNumber(100) + (mult || 0)
        let qua = 1
        let range = [40, 65, 80, 90, 96, 100]
        for (let i = 0; i < range.length; i++) {
            if (quality < range[i]) {
                qua = i + 1
                break
            }
        }
        let roleList = this.getUnlcokRoleIdByQuality(qua)
        let id = roleList[Utils.getRandomNumber(roleList.length - 1)]
        console.log('随机到的', roleList, id)
        let card: CardData = {
            lv: Utils.getRandomNumber(this.rank - 1) + 1,
            id
        }
        return card
    }
    getUnlcokRoleIdByQuality(qua) {
        let list = [...config.unlockRole[0]]
        if (this.rank >= 5) list.push(...config.unlockRole[1])
        if (this.rank >= 9) list.push(...config.unlockRole[2])
        if (this.rank >= 13) list.push(...config.unlockRole[3])
        if (this.rank >= 16) list.push(...config.unlockRole[4])
        let roles = []
        for (let i = 0; i < list.length; i++) {
            let roleData = JsonManager.instance.getDataByName('role')[list[i]]
            if (roleData.quality == qua) {
                roles.push(list[i])
            }
        }
        return roles
    }
    rankSuccess(lv) {
        let data = this.areaData[this.area]
        // DD.instance.exp += this.area + data.diff
        if (lv == data.rank[data.diff - 1]) {
            this.areaData[this.area].rank[data.diff - 1]++
            UIManager.instance.LoadTipsByStr('新地图已解锁')
        }
    }
    checkDailyFrash(lastLogin) {
        if (new Date(lastLogin).toDateString() !== new Date().toDateString()) {
            debugger
            this.changeTime = {
                1: 3, 2: 3
            }
        }
        this.lastLogin = new Date().getTime()
        StorageManager.instance.savePlayerData()
    }
    areaSuccessBag(lv) {
        let chance = lv * 5
        let have = Utils.getRandomNumber(100) < chance
        if (have) {
            let time = [600, 3600, 7200, 28800]
            let quality = Utils.getRandomNumber(100) + this.area
            let qua = 1
            let range = [40, 70, 85, 95, 100]
            for (let i = 0; i < range.length; i++) {
                if (quality < range[i]) {
                    qua = i + 1
                    break
                }
            }
            // let bag=
            return {
                isHave: true, isStart: false, startTime: 0, needTime: time[Utils.getRandomNumber(3)], quality: qua
            }
        }
        return null
    }
    isVip() {
        return new Date().getTime() < this.vip
    }
    getRankGift(lv, index) {
        this.rankGift[lv - 1][index] = true
        let reward = { 'money': lv * 100 }
        if (index == 0) {
            let card = this.getRandomCard(lv)
            reward[card.id] = card.lv
        }
        this.getReward(reward)
        UIManager.instance.openUI(RewardUIManager, { name: config.uiName.rewardUI, param: [reward, '等级奖励'] }, 300)
    }
}