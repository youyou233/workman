import ResourceManager from "./resources_manager";
import UIManager from "./ui_manager";
import BattleUIManager from "../ui/battle_ui_manager";
import BattleManager from "./battle_manager";
import MainUIManager from "../ui/main_ui_manager";
import DD from "./dynamic_data_manager";

const { ccclass, property } = cc._decorator;

//整个游戏的控制器
declare global {
    interface Window {
        winSize: any
    }
}
@ccclass
export default class MainManager extends cc.Component {
    static instance: MainManager = null
    timer: number = 0
    onLoad() {
        MainManager.instance = this
        this.setDesignResolution()
        ResourceManager.instance.init()
        //加载资源
    }
    resLoaded() {
        console.log('资源加载完毕')
        DD.instance.group = [
            { id: 1, lv: 1, group: true }, { id: 2, lv: 1, group: true }, { id: 3, lv: 1, group: true },
            { id: 4, lv: 1, group: true }, { id: 5, lv: 1, group: true }
        ]
        // DD.instance.cards = [
        //     { id: 6, lv: 1 }, { id: 7, lv: 1 }, { id: 8, lv: 1 }, { id: 9, lv: 1 }, { id: 10, lv: 1 },
        //     { id: 11, lv: 1 }, { id: 12, lv: 1 }, { id: 13, lv: 1 }, { id: 14, lv: 1 }, { id: 15, lv: 1 },
        //     { id: 16, lv: 1 }, { id: 17, lv: 1 }, { id: 18, lv: 1 }, { id: 19, lv: 1 }, { id: 20, lv: 1 },
        //     { id: 21, lv: 1 }, { id: 1, lv: 1 }, { id: 1, lv: 1 }, { id: 1, lv: 1 }, { id: 1, lv: 1 }
        // ]
        DD.instance.shopData = [
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 },
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 },
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 },
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 },
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 },
            // { cardData: { id: 1, lv: 1 }, num: 1, price: 10 }
        ]
        DD.instance.giftData = [
            { isHave: false },
            { isHave: false },
            { isHave: false },
            { isHave: false },
            // { isHave: true, isStart: false, startTime: 1608082541, needTime: 5000, quality: 2 },
            // { isHave: false },
            // { isHave: false },
            // { isHave: true, isStart: true, startTime: 1608082541, needTime: 5000, quality: 1 }
        ]
        MainUIManager.instance.switchUI(1)
        DD.instance.money = 200
        DD.instance.ticket = 200
        //BattleManager.instance.initBattle()
        // UIManager.instance.LoadMessageBox('d', 'kkkk')
        // setInterval(() => {
        //     UIManager.instance.LoadTipsByStr('timer' + this.timer)
        //     this.timer++
        // }, 1000)
        //展示开始按钮
    }
    setDesignResolution() {
        var canvas = cc.find("Canvas").getComponent(cc.Canvas)
        var winSize = cc.winSize
        window.winSize = winSize
        if (winSize.width / winSize.height > 640 / 1134) {
            canvas.fitWidth = false
            canvas.fitHeight = true
        } else {
            canvas.fitWidth = true
            canvas.fitHeight = false
        }
    }
}
