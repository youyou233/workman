import ResourceManager from "./resources_manager";
import UIManager from "./ui_manager";
import BattleUIManager from "../ui/battle_ui_manager";
import BattleManager from "./battle_manager";
import MainUIManager from "../ui/main_ui_manager";
import DD from "./dynamic_data_manager";
import StorageManager from "./storage_manager";

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
    //资源加载
    resLoaded() {
        console.log('资源加载完毕')
        this.checkUserData()
    }
    checkUserData() {
        let newb = StorageManager.instance.isFristPlay()
        if (newb) {
            DD.instance.group = [
                { id: 22, lv: 1, group: true }, { id: 23, lv: 1, group: true }, { id: 24, lv: 1, group: true },
                { id: 25, lv: 1, group: true }, { id: 26, lv: 1, group: true }
            ]
            MainUIManager.instance.switchUI(1)
            DD.instance.money = 0
            DD.instance.ticket = 0
            StorageManager.instance.savePlayerData()
        } else {
            StorageManager.instance.loadPlayerData()
        }
    }
    //数据加载
    dataLoaded() {
        MainUIManager.instance.switchUI(1)
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
