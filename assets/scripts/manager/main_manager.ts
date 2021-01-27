import ResourceManager from "./resources_manager";
import UIManager from "./ui_manager";
import BattleUIManager from "../ui/battle_ui_manager";
import BattleManager from "./battle_manager";
import MainUIManager from "../ui/main_ui_manager";
import DD from "./dynamic_data_manager";
import StorageManager from "./storage_manager";
import { FristDataType, SysType } from "../utils/enum";
import AudioManager from "./audio_manager";
import SDKManager from "./sdk_manager";
import RewardUIManager from "../ui/reward_ui_manager";
import config from "../utils/config";

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
        SDKManager.instance.init()
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
                { id: 1, lv: 1, group: true }, { id: 2, lv: 1, group: true }, { id: 3, lv: 1, group: true },
                { id: 9, lv: 1, group: true }, { id: 10, lv: 1, group: true }
            ]
            DD.instance.config = {
                1: true, 2: true, 3: true, 4: true
            }
            StorageManager.instance.saveDataByKey('config', DD.instance.config)
            MainUIManager.instance.switchUI(1)
            DD.instance.money = 0
            DD.instance.ticket = 0
            DD.instance.exp = 0
            DD.instance.lastLogin = new Date().getTime()
            DD.instance.fristDate = {}
            StorageManager.instance.savePlayerData()
            this.loadConfigSuccess()

            UIManager.instance.LoadMessageBox('欢迎新的打工人', '感谢您对我们支持！在此送上新手大礼包，打开可以获得几个随机角色=w=祝您玩的开心！', () => {
                //DD.instance.ticket = 100
                let reward = {
                    ticket: 100,
                    bag: {
                        needTime: 10,
                        quality: 5,
                        isHave: true
                    }
                }
                DD.instance.getReward(reward)
                UIManager.instance.openUI(RewardUIManager, { name: config.uiName.rewardUI, param: [reward, '新手大礼包'] }, 300)

                // DD.instance.exp = 4000
                // DD.instance.vip = new Date(9999999999999).getTime()
                StorageManager.instance.savePlayerData()
            })
        } else {
            this.loadConfig()
            StorageManager.instance.loadPlayerData()
        }

    }
    loadConfig() {
        let data = StorageManager.instance.loadDataByKey('config')
        // console.log('获取data', data)
        if (!data) {
            DD.instance.config = {
                1: true, 2: true, 3: true, 4: true
            }
            StorageManager.instance.saveDataByKey('config', DD.instance.config)
        } else {
            DD.instance.config = data
        }
        this.loadConfigSuccess()
    }
    loadConfigSuccess() {
        //打开背景音乐等等
        // console.log(DD.instance.config)
        if (DD.instance.config[SysType.bgm]) {
            AudioManager.instance.playBGMByID()
        }
        MainUIManager.instance.spNode.active = false
        MainUIManager.instance.UINode.active = true

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

        if (winSize.height / winSize.width > 2) {
            //TODO:将贴上边的UI设置成固定位置
            setTimeout(() => {
                MainUIManager.instance.mainHeader.getComponent(cc.Widget).enabled = false
                MainUIManager.instance.mainHeader.y = 640
                MainUIManager.instance.battleHeader.getComponent(cc.Widget).enabled = false
                MainUIManager.instance.battleHeader.y = 640
            });
        }
    }
}
