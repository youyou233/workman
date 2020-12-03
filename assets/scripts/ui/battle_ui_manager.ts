import LandItem from "../item/land_item";
import PoolManager from "../manager/pool_manager";
import BattleManager from "../manager/battle_manager";
import { BattleStatusType } from "../utils/enum";

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleUIManager extends cc.Component {
    static instance: BattleUIManager = null

    @property(cc.Node)
    landContainer: cc.Node = null
    @property(cc.Node)
    cardContainer: cc.Node = null
    @property(cc.Node)
    monsterContainer: cc.Node = null

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
    onLoad() {
        BattleUIManager.instance = this
    }
    initBattle() {
        this.clearContainer()
        for (let i = 0; i < BattleManager.instance.mapData.length; i++) {
            for (let j = 0; j < BattleManager.instance.mapData[i].length; j++) {
                let land = PoolManager.instance.createObjectByName('landItem', this.landContainer)
                let landItem = land.getComponent(LandItem)
                BattleManager.instance.mapData[i][j].landItem = landItem
                landItem.init()
            }

        }
    }
    clearContainer() {
        for (let i = this.landContainer.children.length - 1; i >= 0; i--) {
            PoolManager.instance.removeObjectByName('landItem', this.landContainer.children[i])
        }
        for (let i = this.cardContainer.children.length - 1; i >= 0; i--) {
            PoolManager.instance.removeObjectByName('cardItem', this.cardContainer.children[i])
        }
        for (let i = this.monsterContainer.children.length - 1; i >= 0; i--) {
            PoolManager.instance.removeObjectByName('monsterItem', this.monsterContainer.children[i])
        }
    }
    update(dt) {
        BattleManager.instance.onUpdate(dt)
        if (BattleManager.instance.status == BattleStatusType.play) {
            //
        }
    }
}