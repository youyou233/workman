import DD from "./dynamic_data_manager"
import MainUIManager from "../ui/main_ui_manager"
import MainManager from "./main_manager"


/**
 *
 * @dec 本地存储文件
 */
const { ccclass, property } = cc._decorator

@ccclass
export default class StorageManager extends cc.Component {
    static _instance: StorageManager = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new StorageManager()
        }
        return this._instance
    }
    bindEvent() {

    }
    loadDataByKey(key: string) {
        let data = cc.sys.localStorage.getItem(key)
        if (data) {
            return JSON.parse(data)
        } else {
            return null
        }
    }
    saveDataByKey(key: string, data) {
        cc.sys.localStorage.setItem(key, JSON.stringify(data))
    }


    // saveGlobalData() {
    //     let data = {}
    //     data['C'] = DD.instance.conclusion
    //     cc.sys.localStorage.setItem('userdata', JSON.stringify(data))
    // }
    // loadGlobalData() {
    //     return new Promise((resolve, reject) => {
    //         let data = this.loadDataByKey('userdata')
    //         DD.instance.conclusion = data['C']
    //     })
    // }
    /**
     * 加载本地资源
     */
    loadPlayerData() {
        return new Promise((resolve, reject) => {
            let data = this.loadDataByKey('userdata')
            DD.instance.money = data['M']
            DD.instance.ticket = data['T']
            DD.instance.cards = data['C']
            DD.instance.group = data['G']
            DD.instance.giftData = data['GD']
            DD.instance.shopData = data['SD']
            DD.instance.lastShopFrashTime = data['LSFT']
            DD.instance.area = data['A']
            DD.instance.areaData = data['AD']
            DD.instance.rankGift = data['RG']
            DD.instance.changeTime = data['CT']
            DD.instance.vip = data['V']
            DD.instance.guide = data['GU']
            DD.instance.exp = data['E']
            DD.instance.checkDailyFrash(data['LL'])
            MainManager.instance.dataLoaded()
            resolve(data)
        })
    }
    /**
     * 保存数据
     */
    savePlayerData() {
        let data = {}
        data['M'] = DD.instance.money
        data['T'] = DD.instance.ticket
        data['C'] = DD.instance.cards
        data['G'] = DD.instance.group
        data['GD'] = DD.instance.giftData
        data['SD'] = DD.instance.shopData
        data['LSFT'] = DD.instance.lastShopFrashTime
        data['A'] = DD.instance.area
        data['AD'] = DD.instance.areaData
        data['LL'] = DD.instance.lastLogin
        data['RG'] = DD.instance.rankGift
        data['CT'] = DD.instance.changeTime
        data['V'] = DD.instance.vip
        data['GU'] = DD.instance.guide
        data['E'] = DD.instance.exp

        cc.sys.localStorage.setItem('userdata', JSON.stringify(data))
        cc.log('数据保存成功')
    }
    isFristPlay() {
        if (cc.sys.localStorage.getItem('userdata')) {
            return false
        } else {
            return true
        }
    }


}
