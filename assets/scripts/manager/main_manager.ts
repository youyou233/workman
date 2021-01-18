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
            // DD.instance.group = [
            //     { id: 1, lv: 1, group: true }, { id: 2, lv: 1, group: true }, { id: 3, lv: 1, group: true },
            //     { id: 9, lv: 1, group: true }, { id: 10, lv: 1, group: true }
            // ]
            DD.instance.group = [
                { id: 4, lv: 1, group: true }, { id: 4, lv: 1, group: true }, { id: 4, lv: 1, group: true },
                { id: 4, lv: 1, group: true }, { id: 4, lv: 1, group: true }
            ]
            DD.instance.config = {
                1: true, 2: true, 3: true, 4: true
            }
            StorageManager.instance.saveDataByKey('config', DD.instance.config)
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
