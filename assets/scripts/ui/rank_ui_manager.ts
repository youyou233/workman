import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import BattleManager from "../manager/battle_manager"
import DD from "../manager/dynamic_data_manager"
import JsonManager from "../manager/json_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class RankUIManager extends cc.Component {
    static instance: RankUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Node)
    container: cc.Node = null
    @property(cc.Node)
    certainNode: cc.Node = null
    @property(cc.Button)
    difficultyBtns: cc.Button[] = []
    @property(cc.Button)
    moreMapBtn: cc.Button = null
    @property(cc.Button)
    mapMaskNode: cc.Button = null
    @property(cc.Node)
    mapAreaContainer: cc.Node = null
    @property(cc.Node)
    mapNode: cc.Node = null
    @property(cc.Node)
    giftNode: cc.Node = null
    @property(cc.Label)
    nameLabel: cc.Label = null
    @property(cc.Node)
    monsterConatainer: cc.Node = null
    @property(cc.Sprite)
    bgSp: cc.Sprite = null
    onLoad() {
        RankUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.container.children.forEach((item, index) => {
            item.on('click', () => {
                //TODO:
                BattleManager.instance.initBattle()
                this.hideUI()
            }, this)
        })
        this.difficultyBtns.forEach((item, index) => {
            item.node.on('click', () => {
                this.chooseDiff(index)
            }, this)
        })
        this.moreMapBtn.node.on('click', () => {
            this.mapNode.active = true
        }, this)
        this.mapMaskNode.node.on('click', () => {
            this.mapNode.active = false
        }, this)
        setTimeout(() => {
            for (let i = 1; i <= 20; i++) {
                let area = JsonManager.instance.getDataByName('area')[i]
                let node = PoolManager.instance.createObjectByName('areaItem', this.mapAreaContainer)
                node.getChildByName('label').getComponent(cc.Label).string = area.name
                node.on('click', () => {
                    this.chooseArea(i)
                }, this)
            }
        })
    }
    showUI() {
        this.content.active = true
        this.mapNode.active = false
        let data = DD.instance.areaData[DD.instance.area]
        let areaData = JsonManager.instance.getDataByName('area')[DD.instance.area]
        this.nameLabel.string = areaData.name
        this.bgSp.spriteFrame = ResourceManager.instance.getSprite(ResType.bg, DD.instance.area + '')
        this.monsterConatainer.children.forEach((item, index) => {
            item.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(ResType.monster,
                'monster (' + areaData.monsters[index] + ')')
        })
        this.certainNode.setPosition(this.difficultyBtns[data.diff - 1].node.position)
        this.frashLevelNode()
    }
    frashLevelNode() {
        let data = DD.instance.areaData[DD.instance.area]
        let list = data.rank[data.diff - 1]
        this.container.children.forEach((item, index) => {
            item.active = index < list
        })
        this.giftNode.active = list == 6 && data.gift[data.diff]
    }
    getGift() {
        this.giftNode.active = false
        //TODO:设计奖励
        let data = DD.instance.areaData[DD.instance.area]
        data.gift[data.diff] = false
    }
    hideUI() {
        this.content.active = false
    }
    chooseDiff(index) {
        this.certainNode.setPosition(this.difficultyBtns[index].node.position)
        DD.instance.areaData[DD.instance.area].diff = index + 1
        this.frashLevelNode()
    }
    chooseArea(id) {
        if (!DD.instance.areaData[id]) {
            DD.instance.areaData[id] = {
                diff: 1,
                gift: [true, true, true],
                rank: [1, 1, 1]
            }
        }
        DD.instance.area = id
        this.showUI()
    }
}