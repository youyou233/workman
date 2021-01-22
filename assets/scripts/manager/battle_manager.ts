import { BattleStatusType, BattleType, ResType, SkillType } from "../utils/enum"
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
import ResourceManager from "./resources_manager"
import DamageLabel from "../item/damage_label"
import PoolManager from "./pool_manager"
import GridItem from "../item/grid_item"
import MonsterItem from "../item/monster_item"
import BossItem from "../item/boss_item"
import GuideUIManager from "../ui/guide_ui_manager"
import EffectManager from "./effect_manager"

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
        //  console.log('阳光变化', val - this._sun)
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
        BattleUIManager.instance.hpContainer.children.map((item, index) => {
            let spName = 'hp_unactive'
            if (index < val) {
                spName = 'hp_active'
            }
            item.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(ResType.main, spName)
        })
        //BattleUIManager.instance.hpLabel.string = val.toFixed(0) + '/3'
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
    areaData: any[][] = []
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
                    if (val != 1) {
                        BattleUIManager.instance.showTip('下一轮，怪物已加强')
                    }
                    BattleUIManager.instance.rankLabel.string = '当前波数:' + val + '/3'
                }
                break
            case BattleType.boss:
            case BattleType.unlimited:
                if (val != 1) {
                    BattleUIManager.instance.showTip('下一轮，怪物已加强')
                }
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
    landNum: number = 0
    bindEvent() {
        Emitter.register('message_' + MessageType.killBoss, (name) => {
            BattleManager.instance.killBoss()
        }, this)
        Emitter.register('message_' + MessageType.monsterBeKilled, (name, data, monster) => {
            if (!data) return
            switch (+data.id) {
                case 26:
                    this.getAllLandById(26).forEach((item) => { item.addWuke() })
                    break
                case 27:
                    let num = this.getMonsterKillSun(monster) * (0.5 + 0.1 * data.stack)
                    this.sun += num
                    EffectManager.instance.createDamageLabel(num + '', monster.node.position, false, { color: cc.Color.WHITE, outLineColor: cc.color(121, 0, 147), fontSize: 18 })
                    break
            }

        }, this)
    }
    initBattle(type?: BattleType) {
        if (type) this.type = type
        this.btnAddTimes = 0
        this.monsterTimer = 3
        this.sun = 500
        this.hp = 3
        this.rank = 1
        this.skillTimes = 0
        this.team = DD.instance.group
        this.landNum = 0
        //3*5
        this.isBoss = false

        switch (this.type) {
            case BattleType.normal:
                this.rankTimer = 30
                break
            case BattleType.boss:
                this.rankTimer = 3
                break
            case BattleType.unlimited:
                this.rankTimer = 20
                break
        }
        this.areaData = JsonManager.instance.getDataByName('area')[DD.instance.area].area
        this.mapData = []
        // let k = -1
        // for (let j = 0; j < 5; j++) {
        //     for (let i = 0; i < 6; i++) {

        //     }
        // }
        let have = [false, false, false, false, false]
        for (let i = 0; i < 6; i++) {
            // if (this.areaData[i].some((item) => { return item === 1 })) {
            //     k++
            //     this.mapData[k] = []
            // }
            for (let j = 0; j < 5; j++) {
                let gridItem = BattleUIManager.instance.landContainer.children[i + j * 6].getComponent(GridItem)
                gridItem.init(this.areaData[i][j])
                if (this.areaData[i][j]) {
                    let k = -1
                    if (!have[j]) {
                        have[j] = true
                    }
                    for (let n = 0; n <= j; n++) {
                        if (have[n]) {
                            k++
                        }
                    }
                    if (!this.mapData[k]) this.mapData[k] = []
                    let landItem = gridItem.land
                    this.mapData[k].push(landItem)
                    landItem.init(k, this.mapData[k].length - 1, i, j)
                    this.landNum++
                }
            }
        }
        console.log('地图数据', this.mapData)
        BattleUIManager.instance.initBattle()

        this.status = BattleStatusType.play
        if (!DD.instance.guide[1]) {
            UIManager.instance.openUI(GuideUIManager, { name: config.uiName.guideUI })
        }
        BattleUIManager.instance.showTip('游戏开始')

    }

    gameSuccess() {
        this.status = BattleStatusType.end
        Emitter.fire('Message_' + MessageType.gameSuccess)
        let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
        let reward = {
            'money': areaData.diff * DD.instance.getCurAreaDiff() * 10 * this.curLv
        }
        let bag = DD.instance.areaSuccessBag(this.curLv)
        if (bag) {
            reward['bag'] = bag
        }
        reward['exp'] = DD.instance.area + areaData.diff
        DD.instance.rankSuccess(this.curLv)
        DD.instance.getReward(reward)
        UIManager.instance.openUI(RewardUIManager, {
            name: config.uiName.rewardUI, param: [reward, '防御成功', () => {
                BattleUIManager.instance.content.active = false
            }]
        }, 300)
    }
    gameFail() {
        this.status = BattleStatusType.end
        Emitter.fire('Message_' + MessageType.gameFail)
        let reward = {}
        // BattleUIManager.instance.content.active = false
        switch (this.type) {
            case BattleType.boss:
                if (this.rank >= 7) {
                    let quality = 1
                    if (this.rank >= 50) {
                        quality = 5
                    } else {
                        quality = Math.floor((this.rank - 7) / 42 * 4.99) + 1
                    }
                    reward['bag'] = { isHave: true, isStart: false, startTime: 1608082541, needTime: this.rank * 60, quality }
                    reward['exp'] = this.rank
                }
                DD.instance.changeTime['1']--
                break
            case BattleType.unlimited:
                reward['money'] = this.rank * 30
                reward['exp'] = this.rank
                DD.instance.changeTime['2']--
                break
        }
        DD.instance.getReward(reward)
        UIManager.instance.openUI(RewardUIManager, {
            name: config.uiName.rewardUI, param: [reward, '防御失败', () => {
                BattleUIManager.instance.content.active = false
            }]
        }, 300)
    }
    onUpdate(dt) {
        if (this.status == BattleStatusType.play) {
            if (!this.isBoss) {
                this.rankTimer -= dt
                this.monsterTimer -= dt
                if (this.monsterTimer <= 0) {
                    if (this.type == BattleType.boss) return
                    this.monsterTimer = this.getGenerateMosnterTimer()
                    this.addMonster()
                }
            }
        }
    }
    nextRank() {

        switch (this.type) {
            case BattleType.normal:
            case BattleType.boss:
                this.onBoss()
                break
            case BattleType.unlimited:
                this.rank++
                this.rankTimer = 20
                break
        }
    }
    addMonster() {

        let id = 1
        if (this.type == BattleType.normal) {
            let areaMonsterList = JsonManager.instance.getDataByName('area')[DD.instance.area].monsters
            id = areaMonsterList[Utils.getRandomNumber(2)]
        } else {
            let bosslist = [6, 12, 21, 18, 32, 31]
            id = Utils.getRandomNumber(35) + 1
            if (bosslist.indexOf(id) != -1) id = 1
        }
        BattleUIManager.instance.addMosnter(id)
    }
    //倒计时结束 出现boss
    onBoss() {
        this.isBoss = true
        let areaMonsterList = JsonManager.instance.getDataByName('area')[DD.instance.area].monsters
        BattleUIManager.instance.bossLabel.string = 'boss进场中'
        BattleUIManager.instance.showTip('boss出现！')
        let id = 0
        if (this.type == BattleType.boss) {
            let list = [6, 12, 21, 18, 32, 31]
            if (this.rank <= 6) {
                id = list[this.rank - 1]
            } else {
                id = list[Utils.getRandomNumber(5)]
            }
        } else {
            id = areaMonsterList[3]
        }
        BattleUIManager.instance.addBoss(id)
    }
    killBoss() {
        if (this.isBoss) {
            this.isBoss = false
            // BattleUIManager.instance.showTip('boss出现！')

            this.rank++
            if (this.type == BattleType.boss) {
                this.sun += Math.floor(100 * Math.sqrt(this.rank))
                this.rankTimer = 1
            } else {
                this.sun += 100 * this.rank
                this.rankTimer = 20
            }
        }
    }
    bossInCity() {
        this.gameFail()
    }
    addRole(free: boolean = false, effect: number = 0) {
        let arr = this.findFree()
        if (arr.length == 0) {
            BattleUIManager.instance.showTip('战场已满')
            return
        }
        if (free) {
            let pos = arr[Utils.getRandomNumber(arr.length - 1)]
            this.mapData[pos[0]][pos[1]].showRole(null, effect)
        } else {
            if (this.sun >= this.btnAddTimes * 10 + 10) {
                let pos = arr[Utils.getRandomNumber(arr.length - 1)]
                this.mapData[pos[0]][pos[1]].showRole()
                this.sun -= (this.btnAddTimes * 10 + 10)
                this.btnAddTimes++
            } else {
                BattleUIManager.instance.showTip('打工魂不足')
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
                this.addRole(true, 5)
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
        var isRow = (land, targetLand) => {
            if (land != targetLand) {
                return land.posI == targetLand.posI
            }
            return false
        }
        var isCol = (land, targetLand) => {
            if (land != targetLand) {
                return land.posJ == targetLand.posJ
            }
            return false
        }
        for (let i = 0; i < this.mapData.length; i++) {

            for (let j = 0; j < this.mapData[i].length; j++) {
                if (isRow(land, this.mapData[i][j]) && this.mapData[i][j].id != land.id) {
                    row = false
                }
                if (isCol(land, this.mapData[i][j]) && this.mapData[i][j].id != land.id) {
                    col = false
                }
            }
        }

        return [row, col]
    }
    getHpmult() {
        if (this.type == BattleType.normal) {
            let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
            return this.rank * areaData.diff * DD.instance.getCurAreaDiff() * (this.curLv / 5 + 0.8)
        } else if (this.type == BattleType.unlimited) {
            return this.rank
        } else {
            return Math.pow(1.3, this.rank)
            // if (this.rank <= 6) {
            //     return 1
            // } else {
            //     return this.rank / 2
            // }
        }

    }
    getGenerateMosnterTimer() {
        return (Utils.getRandomNumber(5) + 1) / 5 * this.landNum / 15
    }
    getNeedPure(): LandItem[] {
        let arr = []
        for (let i = 0; i < this.mapData.length; i++) {
            for (let j = 0; j < this.mapData[0].length; j++) {
                let buffMap = Object.keys(this.mapData[i][j].buffMap)
                if (this.mapData[i][j].isDiz || buffMap.some((item) => {
                    let needPure = [8, 9]
                    return needPure.indexOf(+item) != -1
                })) {
                    arr.push(this.mapData[i][j])
                }
            }
        }
        return arr
    }
    getAllLandById(id: number) {
        let arr = []
        for (let i = 0; i < this.mapData.length; i++) {
            for (let j = 0; j < this.mapData[0].length; j++) {
                if (this.mapData[i][j].id == id) {
                    arr.push(this.mapData[i][j])
                }
            }
        }
        return arr
    }
    getMonsterKillSun(monster: MonsterItem | BossItem) {
        switch (this.type) {
            case BattleType.boss:
            case BattleType.normal:
                if (monster instanceof MonsterItem) {
                    return 10 * this.rank
                } else {
                    return 100 * this.rank
                }
            case BattleType.unlimited:
                if (monster instanceof MonsterItem) {
                    return 10
                }
        }
    }
}