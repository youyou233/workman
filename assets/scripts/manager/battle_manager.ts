import { BattleStatusType, BattleType, SkillType } from "../utils/enum"
import BattleUIManager from "../ui/battle_ui_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import { RoleTeamData } from "../interface/role_team_data"
import UIManager from "./ui_manager"
import { Utils } from "../utils/utils"
import LandItem from "../item/land_item"
import JsonManager from "./json_manager"
import { BuffData } from "../interface/buff_data"
import DD from "./dynamic_data_manager"
import RewardUIManager from "../ui/reward_ui_manager"
import config from "../utils/config"

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
        BattleUIManager.instance.hpLabel.string = val.toFixed(0) + '/3'
        if (this.hp == 0) {
            Emitter.fire(`message_${MessageType.gameFail}`)
            this.gameFail()
        }
    }
    get hp() {
        return this._hp
    }
    isBoss: boolean = false//当前是否在打boss
    _rankTimer: number = 999999
    set rankTimer(val: number) {
        this._rankTimer = val
        BattleUIManager.instance.bossLabel.string = val.toFixed(0) + 's'
        if (this.rankTimer <= 0) {
            this.nextRank()
        }
    }
    get rankTimer() {
        return this._rankTimer
    }

    monsterTimer: number = 0


    status: BattleStatusType = BattleStatusType.before
    team: RoleTeamData[] = []
    mapData: LandItem[][] = []
    curLv: number = 1
    _skillTimes: number = 0
    type: BattleType = BattleType.normal
    set skillTimes(val) {
        this._skillTimes = val
        Emitter.fire('message_' + MessageType.onSkill)
    }
    get skillTimes() {
        return this._skillTimes
    }
    _rank: number = 1
    set rank(val: number) {
        this._rank = val
        switch (this.type) {
            case BattleType.normal:
                if (val == 4) {
                    this.gameSuccess()
                } else {
                    BattleUIManager.instance.rankLabel.string = '当前波数:' + val + '/3'
                }
                break
            case BattleType.boss:
            case BattleType.unlimited:
                BattleUIManager.instance.rankLabel.string = '当前波数:' + val
                break

        }
    }
    get rank() {
        return this._rank
    }
    _btnAddTimes: number = 0
    set btnAddTimes(val: number) {
        this._btnAddTimes = val
        BattleUIManager.instance.addCostLabel.string = (val * 10 + 10).toFixed(0)
    }
    get btnAddTimes() {
        return this._btnAddTimes
    }
    bindEvent() {
        Emitter.register('message_' + MessageType.killBoss, (name) => {
            BattleManager.instance.killBoss()
        }, this)
    }
    initBattle(type?: BattleType) {
        if (type) this.type = type
        switch (this.type) {
            case BattleType.normal:
                this.isBoss = false
                this.rankTimer = 30
                break
            case BattleType.boss:
                //TODO: 设计
                break
            case BattleType.unlimited:
                break
        }

        this.btnAddTimes = 0
        this.monsterTimer = this.getGenerateMosnterTimer()
        this.sun = 500
        this.hp = 3
        this.rank = 1
        this.skillTimes = 0
        this.team = DD.instance.group
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
        Emitter.fire('Message_' + MessageType.gameSuccess)
        // BattleUIManager.instance.content.active = false
        let reward = {
            'bag': { isHave: true, isStart: false, startTime: 1608082541, needTime: 300, quality: 1 }
        }
        //TODO: 临时
        DD.instance.rank++
        DD.instance.getReward(reward)
        UIManager.instance.openUI(RewardUIManager, {
            name: config.uiName.rewardUI, param: [reward, '防御成功', () => {
                BattleUIManager.instance.content.active = false

            }]
        })
    }
    gameFail() {
        this.status = BattleStatusType.end
        Emitter.fire('Message_' + MessageType.gameFail)
        // BattleUIManager.instance.content.active = false
        let reward = {}
        UIManager.instance.openUI(RewardUIManager, {
            name: config.uiName.rewardUI, param: [reward, '防御失败', () => {
                BattleUIManager.instance.content.active = false

            }]
        })
    }
    onUpdate(dt) {
        if (this.status == BattleStatusType.play) {
            if (!this.isBoss) {
                this.rankTimer -= dt
                this.monsterTimer -= dt
                if (this.monsterTimer <= 0) {
                    this.monsterTimer = this.getGenerateMosnterTimer()
                    this.addMonster()
                }
            }
        }
    }
    nextRank() {
        switch (this.type) {
            case BattleType.normal:
                this.onBoss()
                break
        }
    }
    addMonster() {
        let areaMonsterList = JsonManager.instance.getDataByName('area')[DD.instance.area].monsters
        BattleUIManager.instance.addMosnter(areaMonsterList[Utils.getRandomNumber(2)])
    }
    //倒计时结束 出现boss
    onBoss() {
        this.isBoss = true
        let areaMonsterList = JsonManager.instance.getDataByName('area')[DD.instance.area].monsters

        BattleUIManager.instance.bossLabel.string = 'boss进场中'
        BattleUIManager.instance.addBoss(areaMonsterList[3])
    }
    killBoss() {
        if (this.isBoss) {
            this.isBoss = false
            this.sun += 100 * this.rank
            this.rank++
            this.rankTimer = 20
        }
    }
    bossInCity() {
        this.gameFail()
    }
    addRole(free: boolean = false) {
        let arr = this.findFree()
        if (arr.length == 0) {
            UIManager.instance.LoadTipsByStr('战场已满')
            return
        }
        if (free) {
            let pos = arr[Utils.getRandomNumber(arr.length - 1)]
            this.mapData[pos[0]][pos[1]].showRole()
        } else {
            if (this.sun >= this.btnAddTimes * 10 + 10) {
                let pos = arr[Utils.getRandomNumber(arr.length - 1)]
                this.mapData[pos[0]][pos[1]].showRole()
                this.sun -= (this.btnAddTimes * 10 + 10)
                this.btnAddTimes++
            } else {
                UIManager.instance.LoadTipsByStr('阳光不足')
            }
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
    findAllLandItem(): LandItem[] {
        let arr = []
        for (let i = 0; i < this.mapData.length; i++) {
            for (let j = 0; j < this.mapData[i].length; j++) {
                if (this.mapData[i][j].id) {
                    arr.push(this.mapData[i][j])
                }
            }
        }
        return arr
    }
    canDebuff(param): [number, BuffData] {
        if (param && param.id) {
            let skillData = JsonManager.instance.getDataByName('skill')[param.id]
            switch (skillData.skillType) {
                case SkillType.enemyBuff:
                    return [skillData.param.buff, { time: skillData.param.time, lv: param.stack }]
            }
        }
        return null
    }
    canMultDamage(buffMap, param): [number, boolean] {
        let ori: number = buffMap[3] ? (1.5 + buffMap[3].lv * 0.1) : 1
        if (param && param.id) {
            let skillData = JsonManager.instance.getDataByName('skill')[param.id]
            switch (skillData.skillType) {
                case SkillType.debuffKillExplosion:
                    if (Object.keys(buffMap).some((item) => { return item == skillData.param.buff })) {
                        return [ori * skillData.param.mult, true]
                    }
                    break
                case SkillType.debuffMultDamage:
                    if (Object.keys(buffMap).some((item) => { return item == skillData.param.buff })) {
                        return [ori * skillData.param.mult + skillData.param.add * param.stack, false]
                    }
                    break
            }
        }

        return [ori, false]
    }
    onSkillGenerate(id, stack?) {
        let skillData = JsonManager.instance.getDataByName('skill')[id]
        let length = 0
        switch (skillData.skillType) {
            case SkillType.mergeGenerate:
                length = 1
                if (Utils.getRandomNumber(100) < (skillData.param.num + stack * skillData.param.add)) {
                    length = 2
                }
                break
            case SkillType.skillGenerate:
                length = 2
                if (Utils.getRandomNumber(100) < (skillData.param.num + 1 * skillData.param.add)) {
                    length = 3
                }
                break
        }
        setTimeout(() => {
            for (let i = 0; i < length; i++) {
                this.addRole(true)
            }
        }, 100);
    }
    getSameRole(id) {
        let arr = []
        for (let i = 0; i < this.mapData.length; i++) {
            for (let j = 0; j < this.mapData[i].length; j++) {
                if (this.mapData[i][j].id == id) {
                    arr.push(this.mapData[i][j])
                }
            }
        }
        return arr
    }
    checkBingo(land: LandItem) {
        let row = true
        let col = true
        for (let i = 0; i < 3; i++) {
            if (this.mapData[i][land.curJ].id != land.id) {
                row = false
            }
        }
        for (let j = 0; j < 5; j++) {
            if (this.mapData[land.curI][j].id != land.id) {
                col = false
            }
        }
        return [row, col]
    }
    getHpmult() {
        let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
        return this.rank * areaData.diff * DD.instance.getCurAreaDiff() * (this.curLv / 5 + 0.8)
    }
    getGenerateMosnterTimer() {
        return 1
    }
}