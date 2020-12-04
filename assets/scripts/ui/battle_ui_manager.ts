import LandItem from "../item/land_item";
import PoolManager from "../manager/pool_manager";
import BattleManager from "../manager/battle_manager";
import { BattleStatusType, TouchStatusType, ResType } from "../utils/enum";
import ResourceManager from "../manager/resources_manager";
import MonsterItem from "../item/monster_item";
import ThrowItem from "../item/throw_item";

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleUIManager extends cc.Component {
    static instance: BattleUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    landContainer: cc.Node = null
    @property(cc.Node)
    cardContainer: cc.Node = null
    @property(cc.Node)
    monsterContainer: cc.Node = null
    @property(cc.Node)
    throwContainer: cc.Node = null
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
    }
    addMosnter(id) {
        let monster = PoolManager.instance.createObjectByName('monsterItem', this.monsterContainer)
        monster.getComponent(MonsterItem).init(id)
    }
    addThrow(id, start, end, time: number = 1, damage, oid) {
        let node = PoolManager.instance.createObjectByName('throwItem', this.throwContainer)
        node.getComponent(ThrowItem).init(id, start, end, time, damage, oid)
    }
    clearContainer() {
        let containers = [this.landContainer, this.cardContainer, this.monsterContainer, this.throwContainer]
        let itemName = ['landItem', 'cardItem', 'monsterItem', 'throwItem']
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
        }
    }
    findAheadMonster(): cc.Node {
        //找到一个最前面的
        let monster = this.monsterContainer.children.sort((item1, item2) => {
            return item2.getComponent(MonsterItem).path - item1.getComponent(MonsterItem).path
        })[0]
        //  console.log(monster, monster && monster.getComponent(MonsterItem).path)
        return monster
    }
    findMonsterByOid(oid): MonsterItem {
        for (let i = 0; i < this.monsterContainer.children.length; i++) {
            let monster = this.monsterContainer.children[i].getComponent(MonsterItem)
            if (oid == monster.oid) {
                return monster
            }
        }
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
            this.checkMerge(this.getTouchedLand(event))
            this.curTouch = null
            this.touchStatus = TouchStatusType.unTouch
            this.closeMergeStatus()
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
            targetLand.stack++
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