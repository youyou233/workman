import LandItem from "../item/land_item";
import PoolManager from "../manager/pool_manager";
import BattleManager from "../manager/battle_manager";
import { BattleStatusType, TouchStatusType, ResType, ArrType } from "../utils/enum";
import ResourceManager from "../manager/resources_manager";
import MonsterItem from "../item/monster_item";
import ThrowItem from "../item/throw_item";
import CardItem from "../item/card_item";
import BossItem from "../item/boss_item";
import BattleSkillUIManager from "./battle_skill_ui_manager";
import { Utils } from "../utils/utils";
import DD from "../manager/dynamic_data_manager";
import GridItem from "../item/grid_item";
import JsonManager from "../manager/json_manager";
import UIManager from "../manager/ui_manager";
import OnskillUIManager from "./onskill_ui_manager";
import config from "../utils/config";

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleUIManager extends cc.Component {
    static instance: BattleUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    landContainer: cc.Node = null
    @property(cc.Sprite)
    bg: cc.Sprite = null
    @property(cc.Node)
    monsterContainer: cc.Node = null
    @property(cc.Node)
    throwContainer: cc.Node = null
    @property(cc.Node)
    bossContainer: cc.Node = null
    @property(cc.Node)
    effectContainer: cc.Node = null
    @property(cc.Node)
    damageLabelContainer: cc.Node = null
    //数据显示
    @property(cc.Label)
    sunLabel: cc.Label = null
    @property(cc.Button)
    addBtn: cc.Button = null
    @property(cc.Label)
    addCostLabel: cc.Label = null
    @property(cc.Node)
    hpContainer: cc.Node = null
    @property(cc.Label)
    bossLabel: cc.Label = null
    @property(cc.Label)
    rankLabel: cc.Label = null//当前波数
    @property(cc.Node)
    touchGround: cc.Node = null
    touchStatus: TouchStatusType = TouchStatusType.unTouch
    @property(cc.Node)
    touchNode: cc.Node = null
    onLoad() {
        BattleUIManager.instance = this
        this.bindEvent()
        this.touchNode.opacity = 0
        this.content.active = false
        BattleManager.instance.bindEvent()
    }
    bindEvent() {
        this.addBtn.node.on('click', () => {
            BattleManager.instance.addRole()
        }, this)

        this.touchGround.on(cc.Node.EventType.TOUCH_START, this.startTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_MOVE, this.moveTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_END, this.endTouch, this)
        this.touchGround.on(cc.Node.EventType.TOUCH_CANCEL, this.endTouch, this)
    }
    initBattle() {
        this.clearContainer()
        this.content.active = true
        let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
        this.bg.spriteFrame = ResourceManager.instance.getSprite(ResType.bg, 'bg_' + areaData.bg)
        // for (let i = 0; i < BattleManager.instance.mapData.length; i++) {
        //     for (let j = 0; j < BattleManager.instance.mapData[i].length; j++) {
        //         let land = PoolManager.instance.createObjectByName('landItem', this.landContainer)
        //         let landItem = land.getComponent(LandItem)
        //         BattleManager.instance.mapData[i][j] = landItem
        //         landItem.init(i, j)
        //     }
        // }
        setTimeout(() => {
            BattleSkillUIManager.instance.initBattle()
        });
    }
    addMosnter(id) {
        let waysLength = JsonManager.instance.getDataByName('area')[DD.instance.area].way.length
        let monster = PoolManager.instance.createObjectByName('monsterItem', this.monsterContainer)
        monster.getComponent(MonsterItem).init(id, Utils.getRandomNumber(waysLength - 1))
    }
    clearAllMonsters() {
        let addHp = 0
        for (let i = this.monsterContainer.children.length - 1; i >= 0; i--) {
            let monster = this.monsterContainer.children[i].getComponent(MonsterItem)
            addHp += monster.hp
            PoolManager.instance.removeObjectByName('monsterItem', monster.node)
        }
        return addHp
    }
    addBoss(id) {
        let boss = PoolManager.instance.createObjectByName('bossItem', this.bossContainer)
        boss.getComponent(BossItem).init(id, this.clearAllMonsters())
    }
    addThrow(id, start, end, time: number = 1, damage, oid, type, param?, jump: boolean = false) {
        let node = PoolManager.instance.createObjectByName('throwItem', this.throwContainer)
        node.getComponent(ThrowItem).init(id, start, end, time, damage, oid, type, param, jump)
    }
    clearContainer() {
        let containers = [this.monsterContainer, this.throwContainer, this.bossContainer, this.effectContainer, this.damageLabelContainer]
        let itemName = ['monsterItem', 'throwItem', 'bossItem', 'effectItem', 'damageLabel']
        for (let i = 0; i < containers.length; i++) {
            for (let j = containers[i].children.length - 1; j >= 0; j--) {
                PoolManager.instance.removeObjectByName(itemName[i], containers[i].children[j])
            }
        }
    }
    update(dt) {
        BattleManager.instance.onUpdate(dt)
        if (BattleManager.instance.status == BattleStatusType.play) {
            if (this.touchStatus == TouchStatusType.touching) {
                this.touchTimer += dt
            }
            this.monsterContainer.children.forEach((item) => {
                item.getComponent(MonsterItem).onUpdate(dt)
            })
            this.landContainer.children.forEach((item) => {
                item.getComponent(GridItem).onUpdate(dt)
            })
            this.bossContainer.children.forEach((item) => {
                item.getComponent(BossItem).onUpdate(dt)
            })
            BattleSkillUIManager.instance.onUpdate(dt)
        }
    }
    findAheadMonster(): cc.Node {
        //找到一个最前面的
        let monster = this.monsterContainer.children.sort((item1, item2) => {
            return item2.getComponent(MonsterItem).path - item1.getComponent(MonsterItem).path
        })[0]
        let boss = this.bossContainer.children.sort((item1, item2) => {
            return item2.getComponent(MonsterItem).path - item1.getComponent(MonsterItem).path
        })[0]

        if (boss) {
            return boss
        }
        //  console.log(monster, monster && monster.getComponent(MonsterItem).path)
        return monster
    }
    findArrMonster(num?): cc.Node[] {
        let nodeLis = this.monsterContainer.children.concat(...this.bossContainer.children)
        nodeLis.sort((item1, item2) => {
            let monster1 = DD.instance.getMonsterByNode(item1)
            let monster2 = DD.instance.getMonsterByNode(item2)
            return monster2.path - monster1.path
        })
        if (num) {
            return nodeLis.slice(0, num)
        } else {
            return nodeLis

        }
    }
    findRandomMonster(): cc.Node {
        let monster = this.monsterContainer.children[Utils.getRandomNumber(this.monsterContainer.children.length - 1)]
        let boss = this.bossContainer.children[Utils.getRandomNumber(this.bossContainer.children.length - 1)]
        if (boss) return boss
        return monster
    }
    findMonsterByOid(oid) {
        for (let i = 0; i < this.monsterContainer.children.length; i++) {
            let monster = this.monsterContainer.children[i].getComponent(MonsterItem)
            if (oid == monster.oid) {
                return monster
            }
        }
        for (let i = 0; i < this.bossContainer.children.length; i++) {
            let monster = this.bossContainer.children[i].getComponent(BossItem)
            if (oid == monster.oid) {
                return monster
            }
        }
        return null
    }
    /**
     *  获取一个范围内的敌人
     * @param pos 目标点
     * @param range 范围
     */

    getRangeMonsters(pos, range): cc.Node[] {
        let monsters = []
        for (let i = 0; i < this.monsterContainer.children.length; i++) {
            let node = this.monsterContainer.children[i]
            if (pos.sub(node.position).mag() < range) {
                monsters.push(node)
            }
        }
        for (let i = 0; i < this.bossContainer.children.length; i++) {
            let node = this.bossContainer.children[i]
            if (pos.sub(node.position).mag() < range) {
                monsters.push(node)
            }
        }
        return monsters
    }
    //-------------------------- 触摸相关 ------------------------------
    touchTimer: number = 0
    curTouch: cc.Node = null
    startTouch(event) {
        if (this.touchStatus == TouchStatusType.unTouch || this.touchStatus == TouchStatusType.touching) {
            this.touchTimer = 0
            this.touchStatus = TouchStatusType.touching
            this.curTouch = this.getTouchedLand(event)
        } else if (this.curTouch && this.touchStatus == TouchStatusType.clicked) {
            //判断是否能合成 直接将当前选中的与目标合成
            if (this.curTouch == this.getTouchedLand(event)) {
                this.touchTimer = 0
                this.touchStatus = TouchStatusType.touching
                this.closeMergeStatus()
            } else {
                this.checkMerge(this.getTouchedLand(event))
                this.curTouch = null
                this.touchStatus = TouchStatusType.unTouch
                this.closeMergeStatus()
            }
        }
    }
    moveTouch(event) {
        if (this.curTouch && this.touchStatus == TouchStatusType.touching) {
            if (this.touchNode.opacity == 0) {
                this.touchNode.opacity = 150
                let landItem = this.curTouch.getComponent(LandItem)
                this.touchNode.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(
                    ResType.battle, `${landItem.id}-0`
                )
            }

            this.touchNode.setPosition(this.content.convertToNodeSpaceAR(event.getLocation()))
        }
    }
    endTouch(event) {
        if (this.curTouch && this.touchStatus == TouchStatusType.touching) {
            //判断touchTimer 进入unTouch还是clicked状态 
            //判断结束时的目标与初始目标是否相同
            let target = this.getTouchedLand(event)
            if (this.touchTimer < 0.5 && target == this.curTouch && target.getComponent(LandItem).id) {
                this.touchStatus = TouchStatusType.clicked
                this.showMergeStatus()
                //展示能合成的节点
            } else {
                this.checkMerge(target)
                this.curTouch = null
                this.touchStatus = TouchStatusType.unTouch
            }
        }
        this.touchNode.opacity = 0
    }
    //展示点击选中之后的合成状态
    showMergeStatus() {
        for (let i = 0; i < BattleManager.instance.mapData.length; i++) {
            for (let j = 0; j < BattleManager.instance.mapData[i].length; j++) {
                let land = BattleManager.instance.mapData[i][j]
                land.updateMergeStatus(false, this.curTouch.getComponent(LandItem))
            }

        }
    }
    closeMergeStatus() {
        for (let i = 0; i < BattleManager.instance.mapData.length; i++) {
            for (let j = 0; j < BattleManager.instance.mapData[i].length; j++) {
                let land = BattleManager.instance.mapData[i][j]
                land.updateMergeStatus(true)
            }

        }
    }
    /**
     * 判断是否能合成
     * @param target 目标节点
     */
    checkMerge(target: cc.Node) {
        if (!target) return
        let curLand = this.curTouch.getComponent(LandItem)
        let targetLand = target.getComponent(LandItem)
        if (targetLand.checkMerge(curLand)) {
            targetLand.onMerge(curLand)
        } else {
            if (curLand.id == 23 && targetLand.id) {
                curLand.showRole(targetLand.id)
                targetLand.showRole(23)
            }
        }
    }

    getTouchedLand(event): cc.Node {
        for (let i = 0; i < this.landContainer.children.length; i++) {
            let node = this.landContainer.children[i]
            if (node.getBoundingBoxToWorld().contains(event.getLocation())) {
                return node.getChildByName('landItem')
            }
        }
        return null
    }
    getRoundLand(i: number, j: number): LandItem[] {
        let list = []
        let [left, right, up, down] = [null, null, null, null]
        if (i >= 1) {
            left = BattleManager.instance.mapData[i - 1][j]
            if (left.id) list.push(left)
        }
        if (i <= BattleManager.instance.mapData.length - 2) {
            right = BattleManager.instance.mapData[i + 1][j]
            if (right.id) list.push(right)
        }
        if (j >= 1) {
            down = BattleManager.instance.mapData[i][j - 1]
            if (down.id) list.push(down)
        }
        if (j < BattleManager.instance.mapData[0].length - 2) {
            up = BattleManager.instance.mapData[i][j + 1]
            if (up.id) list.push(up)
        }
        return list
    }
    checkWayPoint(pos, wayId): boolean | cc.Vec2 {
        let ways = JsonManager.instance.getDataByName('area')[DD.instance.area].way
        let way = ways[wayId]
        for (let i = 0; i < way.length; i++) {
            let target = this.landContainer.children[way[i][0] * 6 + way[i][1]].position
            if (pos.sub(target).mag() < 5) {
                let spd = cc.v2(0, 0)
                switch (way[i][2]) {
                    case ArrType.up:
                        spd.y = 100
                        break
                    case ArrType.down:
                        spd.y = -100
                        break
                    case ArrType.left:
                        spd.x = -100
                        break
                    case ArrType.right:
                        spd.x = 100
                        break
                    case 0:
                        return true//抵达终点
                }
                return spd
            }
        }
        return null
    }
    getStartPos(wayId) {
        let ways = JsonManager.instance.getDataByName('area')[DD.instance.area].way
        let way = ways[wayId]
        let target = this.landContainer.children[way[0][0] * 6 + way[0][1]].position
        return cc.v2(target.x, target.y + 64)
    }
    //只有公主能发动
    changeRole(id: number) {
        this.curTouch.getComponent(LandItem).showRole(id)
        UIManager.instance.openUI(OnskillUIManager, { name: config.uiName.onskillUI, param: [30] })
    }
}