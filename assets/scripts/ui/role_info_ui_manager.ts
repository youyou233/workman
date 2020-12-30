import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import DD from "../manager/dynamic_data_manager"
import JsonManager from "../manager/json_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import config from "../utils/config"
import { AtkType, ResType } from "../utils/enum"
import GroupUIManager from "./group_ui_manager"
import MixUIManager from "./mix_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class RoleInfoUIManager extends cc.Component {
    static instance: RoleInfoUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    mask: cc.Node = null
    @property(cc.Button)
    addGroupBtn: cc.Button = null
    @property(cc.Button)
    mixBtn: cc.Button = null
    @property(cc.Sprite)
    sp: cc.Sprite = null

    @property(cc.Label)
    nameLabel: cc.Label = null
    @property(cc.Label)
    qualityLabel: cc.Label = null
    @property(cc.Label)
    typeLabel: cc.Label = null

    @property(cc.RichText)
    decLabel: cc.RichText = null

    @property(cc.Node)
    otherLabelContainer: cc.Node = null
    cardData: CardData = null
    onLoad() {
        RoleInfoUIManager.instance = this
        this.mask.on('click', this.hideUI, this)
        this.mixBtn.node.on('click', this.onMix, this)
        this.addGroupBtn.node.on('click', this.onAddGroup, this)
    }
    showUI(cardData: CardData, opa: boolean = true) {
        this.content.active = true
        this.addGroupBtn.node.active = opa && !cardData.group && !DD.instance.group.some((item) => { return item.id == cardData.id })
        this.mixBtn.node.active = opa && cardData.group
        this.cardData = cardData
        this.sp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, 'role_' + cardData.id)
        let roleData = JsonManager.instance.getDataByName('role')[cardData.id]
        this.nameLabel.string = `Lv${cardData.lv}${roleData.name}`
        let qualityStr = ['', '普通', '优秀', '卓越', '稀有', '传奇', '史诗']
        let qualityColor = [null, cc.Color.WHITE, cc.Color.GREEN, cc.Color.BLUE, cc.color(163, 54, 255), cc.Color.YELLOW, cc.Color.RED]
        this.qualityLabel.string = qualityStr[roleData.quality]
        this.qualityLabel.node.color = qualityColor[roleData.quality]
        this.typeLabel.string = `[${roleData.typeName}]`
        this.decLabel.string = roleData.dec
        this.bindLabels(cardData, roleData)
    }
    hideUI() {
        this.content.active = false
    }
    bindLabels(card: CardData, role) {
        this.otherLabelContainer.children.forEach((item: cc.Node) => {
            item.active = false
        })
        let node1 = this.otherLabelContainer.children[0]
        let node2 = this.otherLabelContainer.children[1]
        let skill = JsonManager.instance.getDataByName('skill')[card.id]
        node1.active = true
        node2.active = true
        if (card.id == 10) {
            node1.getChildByName('1').getComponent(cc.Label).string = '生产间隔'
            node1.getChildByName('2').getComponent(cc.Label).string = skill.param.cold
            node2.getChildByName('1').getComponent(cc.Label).string = '生产数量'
            node2.getChildByName('2').getComponent(cc.Label).string = `⭐*${skill.param.num}`
        } else {
            node1.getChildByName('1').getComponent(cc.Label).string = '攻击力'
            node1.getChildByName('2').getComponent(cc.Label).string = (role.atk * Math.pow(1.2, card.lv - 1)).toFixed(0)
            node2.getChildByName('1').getComponent(cc.Label).string = '攻击间隔'
            node2.getChildByName('2').getComponent(cc.Label).string = role.atkCD + 's'
            let node3 = this.otherLabelContainer.children[2]
            node3.active = true
            let node4 = this.otherLabelContainer.children[3]
            let buff = null
            if (skill.param && skill.param.buff) {
                buff = JsonManager.instance.getDataByName('buff')[skill.param.buff]
            }
            switch (card.id) {
                case 17:
                case 5:
                    node3.active = false
                    break
                case 1:
                    node3.getChildByName('1').getComponent(cc.Label).string = '升星提升攻速'
                    node3.getChildByName('2').getComponent(cc.Label).string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 2:
                    node3.getChildByName('1').getComponent(cc.Label).string = '升星攻击'
                    node3.getChildByName('2').getComponent(cc.Label).string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 3:
                    node3.getChildByName('1').getComponent(cc.Label).string = '技能冷却'
                    node3.getChildByName('2').getComponent(cc.Label).string = skill.cool + 's'
                    node4.active = true
                    node4.getChildByName('1').getComponent(cc.Label).string = '攻击提升'
                    node4.getChildByName('2').getComponent(cc.Label).string = (buff.param.num + buff.param.add * (card.lv - 1)).toFixed(0) + '%'
                    break
                case 4:
                    node3.getChildByName('1').getComponent(cc.Label).string = '周围提升攻速'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${buff.param.num}+⭐*${buff.param.add}%`
                    break
                case 6:
                    node3.getChildByName('1').getComponent(cc.Label).string = '燃烧伤害倍率'
                    node3.getChildByName('2').getComponent(cc.Label).string = (skill.param.mult * 100).toFixed(0) + '%'
                    break
                case 7:
                    node3.getChildByName('1').getComponent(cc.Label).string = '燃烧伤害'
                    node3.getChildByName('2').getComponent(cc.Label).string = `⭐*${buff.param.num}`
                    break
                case 8:
                    node3.getChildByName('1').getComponent(cc.Label).string = '幸运'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${skill.param.num}+⭐*${skill.param.add}%`
                    break
                case 9:
                    node3.getChildByName('1').getComponent(cc.Label).string = '减速'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${-buff.param.num}+⭐*${-buff.param.add}%`
                    break
                case 11:
                    node3.getChildByName('1').getComponent(cc.Label).string = '技能冷却'
                    node3.getChildByName('2').getComponent(cc.Label).string = skill.cool + 's'
                    node4.active = true
                    node4.getChildByName('1').getComponent(cc.Label).string = '攻速提升'
                    node4.getChildByName('2').getComponent(cc.Label).string = (buff.param.num + buff.param.add * (card.lv - 1)).toFixed(0) + '%'
                    break
                case 12:
                    node3.getChildByName('1').getComponent(cc.Label).string = '转化率'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${skill.param.num}+⭐*${skill.param.add}%`
                    break
                case 13:
                    node3.getChildByName('1').getComponent(cc.Label).string = '秒杀率'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${skill.param.num}+⭐*${skill.param.add}%`
                    break
                case 14:
                    node3.getChildByName('1').getComponent(cc.Label).string = '减速伤害倍率'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${skill.param.mult * 100}+⭐*${skill.param.add * 100}%`
                    break
                case 15:
                    node3.getChildByName('1').getComponent(cc.Label).string = '每个星提升攻速'
                    node3.getChildByName('2').getComponent(cc.Label).string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 16:
                    node3.getChildByName('1').getComponent(cc.Label).string = '增加伤害'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${buff.param.num}+⭐*${buff.param.add}%`
                    break
                case 18:
                    node3.getChildByName('1').getComponent(cc.Label).string = '攻击范围'
                    node3.getChildByName('2').getComponent(cc.Label).string = `${skill.param.num}+⭐*${skill.param.add}`
                    break
                case 19:
                    node3.getChildByName('1').getComponent(cc.Label).string = '连锁数量'
                    node3.getChildByName('2').getComponent(cc.Label).string = `2+⭐个`
                    break
                case 20:
                    node3.getChildByName('1').getComponent(cc.Label).string = '技能冷却'
                    node3.getChildByName('2').getComponent(cc.Label).string = skill.cool + 's'
                    node4.active = true
                    node4.getChildByName('1').getComponent(cc.Label).string = '幸运'
                    node4.getChildByName('2').getComponent(cc.Label).string = skill.param.num + skill.param.add * (card.lv - 1) + '%'
                    break
                case 21:
                    node3.getChildByName('1').getComponent(cc.Label).string = '横向bingo攻速增加'
                    node3.getChildByName('2').getComponent(cc.Label).string = (skill.param.row * 100).toFixed(0) + "%"
                    node4.active = true
                    node4.getChildByName('1').getComponent(cc.Label).string = '纵向bingo攻击增加'
                    node4.getChildByName('2').getComponent(cc.Label).string = (skill.param.col * 100).toFixed(0) + "%"
                    break
            }

        }

    }
    onMix() {
        UIManager.instance.openUI(MixUIManager, { name: config.uiName.mixUI, param: [this.cardData] }, 300)
    }
    onAddGroup() {
        this.hideUI()
        GroupUIManager.instance.onChange(this.cardData)
    }
}