import LandItem from "../item/land_item";
import PoolManager from "../manager/pool_manager";
import BattleManager from "../manager/battle_manager";
import { BattleStatusType, TouchStatusType, ResType } from "../utils/enum";
import ResourceManager from "../manager/resources_manager";
import MonsterItem from "../item/monster_item";
import ThrowItem from "../item/throw_item";
import CardItem from "../item/card_item";
import BossItem from "../item/boss_item";
import BattleSkillUIManager from "./battle_skill_ui_manager";

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleUIManager extends cc.Component {
    static instance: BattleUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    landContainer: cc.Node = null

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
    @property(cc.Label)
    hpLabel: cc.Label = null
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
        for (let i = 0; i < BattleManager.instance.mapData.length; i++) {
            for (let j = 0; j < BattleManager.instance.mapData[i].length; j++) {
                let land = PoolManager.instance.createObjectByName('landItem', this.landContainer)
                let landItem = land.getComponent(LandItem)
                BattleManager.instance.mapData[i][j] = landItem
                landItem.init(i, j)
            }
        }
        BattleSkillUIManager.instance.initBattle()
    }
    addMosnter(id) {
        let monster = PoolManager.instance.createObjectByName('monsterItem', this.monsterContainer)
        monster.getComponent(MonsterItem).init(id)
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
    addThrow(id, start, end, time: number = 1, damage, oid, type, param?) {
        let node = PoolManager.instance.createObjectByName('throwItem', this.throwContainer)
        node.getComponent(ThrowItem).init(id, start, end, time, damage, oid, type, param)
    }
    clearContainer() {
        let containers = [this.landContainer, this.monsterContainer, this.throwContainer, this.bossContainer, this.effectContainer, this.damageLabelContainer]
        let itemName = ['landItem', 'monsterItem', 'throwItem', 'bossItem', 'effectItem', 'damageLabel']
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
                item.getComponent(LandItem).onUpdate(dt)
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
        return monsters
    }
    //-------------------------- 触摸相关 ------------------------------
    touchTimer: number = 0
    curTouch: cc.Node = null
    startTouch(event) {
        if (this.touchStatus == TouchStatusType.unTouch) {
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
        if (this.curTouch) {
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
            curLand.setNull()
            targetLand.onMerge()
        }
    }

    getTouchedLand(event): cc.Node {
        for (let i = 0; i < this.landContainer.children.length; i++) {
            let node = this.landContainer.children[i]
            if (node.getBoundingBoxToWorld().contains(event.getLocation())) {
                return node
            }
        }
        return null
    }
}