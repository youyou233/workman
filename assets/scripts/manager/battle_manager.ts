import { BattleStatusType } from "../utils/enum"
import BattleUIManager from "../ui/battle_ui_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import { RoleTeamData } from "../interface/role_team_data"
import UIManager from "./ui_manager"
import { Utils } from "../utils/utils"
import LandItem from "../item/land_item"

const { ccclass, property } = cc._decorator
/**
 * 战斗数据控制
 */
@ccclass
export default class BattleManager extends cc.Component {
    static _instance: BattleManager = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new BattleManager()
        }
        return this._instance
    }

    _sun: number = 0//阳光
    set sun(val: number) {
        this._sun = val
        BattleUIManager.instance.sunLabel.string = val.toFixed(0)
    }
    get sun() {
        return this._sun
    }

    _hp: number = 0//血量
    set hp(val: number) {
        if (val < 0) {
            this.hp = 0
        } else {
            this._hp = val
        }
        BattleUIManager.instance.hpLabel.string = val.toFixed(0)
        if (this.hp == 0) {
            Emitter.fire(`message_${MessageType.gameFail}`)
            this.gameFail()
        }
    }
    get hp() {
        return this._hp
    }
    isBoss: boolean = false//当前是否在打boss
    _bossTimer: number = 999999
    set bossTimer(val: number) {
        this._bossTimer = val
        BattleUIManager.instance.bossLabel.string = val.toFixed(0) + 's'
        if (this.bossTimer <= 0) {
            this.onBoss()
        }
    }
    get bossTimer() {
        return this._bossTimer
    }
    status: BattleStatusType = BattleStatusType.before
    team: RoleTeamData[] = []
    mapData: LandItem[][] = []
    _btnAddTimes: number = 0
    set btnAddTimes(val: number) {
        this._btnAddTimes = val
        BattleUIManager.instance.addCostLabel.string = (val * 10 + 10).toFixed(0)
    }
    get btnAddTimes() {
        return this._btnAddTimes
    }
    initBattle() {
        this.bossTimer = 100
        this.btnAddTimes = 0
        this.sun = 100
        this.team = [{ id: 4, lv: 1 }, { id: 4, lv: 1 }, { id: 4, lv: 1 }, { id: 4, lv: 1 }, { id: 4, lv: 1 }]
        //3*5
        this.mapData = []
        for (let i = 0; i < 3; i++) {
            this.mapData[i] = []
            for (let j = 0; j < 5; j++) {
                let data: LandItem = null
                this.mapData[i][j] = data
            }
        }
        BattleUIManager.instance.initBattle()
        this.status = BattleStatusType.play
    }
    gameSuccess() {
        this.status = BattleStatusType.end
    }
    gameFail() {
        this.status = BattleStatusType.end
    }
    onUpdate(dt) {
        if (!this.isBoss) {
            this.bossTimer -= dt
        }
    }
    //倒计时结束 出现boss
    onBoss() {
        this.isBoss = true
    }
    killBoss() {
        this.isBoss = false

    }
    addRole() {
        let arr = this.findFree()
        if (arr.length == 0) {
            UIManager.instance.LoadTipsByStr('战场已满')
            return
        }
        if (this.sun >= this.btnAddTimes * 10 + 10) {
            let pos = arr[Utils.getRandomNumber(arr.length - 1)]
            this.mapData[pos[0]][pos[1]].showRole(4)
            this.sun -= (this.btnAddTimes * 10 + 10)
            this.btnAddTimes++
        } else {
            UIManager.instance.LoadTipsByStr('阳光不足')
        }
    }
    findFree() {
        let arr = []
        for (let i = 0; i < this.mapData.length; i++) {
            for (let j = 0; j < this.mapData[i].length; j++) {
                if (!this.mapData[i][j].id) {
                    arr.push([i, j])
                }
            }
        }
        return arr
    }
}