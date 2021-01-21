import { CardData } from "../interface/card_data"
import IconItem from "../item/icon_item"
import ShopItem from "../item/shop_item"
import ActionManager from "../manager/action_manager"
import AudioManager from "../manager/audio_manager"
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
        AudioManager.instance.playAudio('openDialog')
        ActionManager.instance.showDialog(this.content, this.mask)
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
        AudioManager.instance.playAudio('closeDialog')
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
            node1.getChildByName('2').getComponent(cc.Label).string = (role.atk * Math.sqrt(card.lv)).toFixed(0)
            node2.getChildByName('1').getComponent(cc.Label).string = '攻击间隔'
            node2.getChildByName('2').getComponent(cc.Label).string = role.atkCD + 's'
            let node3 = this.otherLabelContainer.children[2]
            node3.active = true
            let node4 = this.otherLabelContainer.children[3]
            let buff = null
            if (skill.param && skill.param.buff) {
                buff = JsonManager.instance.getDataByName('buff')[skill.param.buff]
            }
            let labels = [
                node3.getChildByName('1').getComponent(cc.Label), node3.getChildByName('2').getComponent(cc.Label),
                node4.getChildByName('1').getComponent(cc.Label), node4.getChildByName('2').getComponent(cc.Label)
            ]
            switch (card.id) {
                case 17:
                case 5:
                case 23:

                    node3.active = false
                    break
                case 1:
                    labels[0].string = '升星提升攻速'
                    labels[1].string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 2:
                    labels[0].string = '升星攻击'
                    labels[1].string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 3:
                    labels[0].string = '技能冷却'
                    labels[1].string = skill.cool + 's'
                    node4.active = true
                    labels[2].string = '攻击提升'
                    labels[3].string = (buff.param.num + buff.param.add * (card.lv - 1)).toFixed(0) + '%'
                    break
                case 4:
                    labels[0].string = '周围提升攻速'
                    labels[1].string = `(${buff.param.num}+⭐*${buff.param.add}%)`
                    break
                case 6:
                    labels[0].string = '燃烧伤害倍率'
                    labels[1].string = (skill.param.mult * 100).toFixed(0) + '%'
                    break
                case 7:
                    labels[0].string = '燃烧伤害'
                    labels[1].string = `⭐*${buff.param.num}`
                    break
                case 8:
                    labels[0].string = '幸运'
                    labels[1].string = `(${skill.param.num}+⭐*${skill.param.add})%`
                    break
                case 9:
                    labels[0].string = '减速'
                    labels[1].string = `(${-buff.param.num}+⭐*${-buff.param.add})%`
                    break
                case 11:
                    labels[0].string = '技能冷却'
                    labels[1].string = skill.cool + 's'
                    node4.active = true
                    labels[2].string = '攻速提升'
                    labels[3].string = (buff.param.num + buff.param.add * (card.lv - 1)).toFixed(0) + '%'
                    break
                case 12:
                    labels[0].string = '转化率'
                    labels[1].string = `(${skill.param.num}+⭐*${skill.param.add})%`
                    break
                case 13:
                    labels[0].string = '秒杀率'
                    labels[1].string = `(${skill.param.num}+⭐*${skill.param.add})%`
                    break
                case 14:
                    labels[0].string = '减速伤害倍率'
                    labels[1].string = `(${skill.param.mult * 100}+⭐*${skill.param.add * 100})%`
                    break
                case 15:
                    labels[0].string = '每个星提升攻速'
                    labels[1].string = (skill.param.num * 100).toFixed(0) + '%'
                    break
                case 16:
                    labels[0].string = '增加伤害'
                    labels[1].string = `(${buff.param.num}+⭐*${buff.param.add})%`
                    break
                case 18:
                    labels[0].string = '攻击范围'
                    labels[1].string = `${skill.param.num}+⭐*${skill.param.add}`
                    break
                case 19:
                    labels[0].string = '连锁数量'
                    labels[1].string = `2+⭐个`
                    break
                case 20:
                    labels[0].string = '技能冷却'
                    labels[1].string = skill.cool + 's'
                    node4.active = true
                    labels[2].string = '幸运'
                    labels[3].string = skill.param.num + skill.param.add * (card.lv - 1) + '%'
                    break
                case 21:
                    labels[0].string = '纵向bingo攻速增加'
                    labels[1].string = (skill.param.row * 100).toFixed(0) + "%"
                    node4.active = true
                    labels[2].string = '横向bingo攻击增加'
                    labels[3].string = (skill.param.col * 100).toFixed(0) + "%"
                    break
                case 22:
                    labels[0].string = '获得魂'
                    labels[1].string = `60*⭐`
                    break
                case 24:
                    labels[0].string = '发动间隔'
                    labels[1].string = skill.param.cold + 's'
                    node4.active = true
                    labels[2].string = '净化人数'
                    labels[3].string = `⭐人`
                    break
                case 25:
                    labels[0].string = 'BOSS额外伤害'
                    labels[1].string = `(${skill.param.num}*⭐)%`
                    break
                case 26:
                    labels[0].string = '每层额外增伤'
                    labels[1].string = skill.param.num + '%'
                    break
                case 27:
                    labels[0].string = '增加倍率'
                    labels[1].string = `(${skill.param.num}+${skill.param.add}*⭐)%`
                    break
                case 28:
                    labels[0].string = '暴击伤害'
                    labels[1].string = skill.param.damage + '%'
                    node4.active = true
                    labels[2].string = '暴击率'
                    labels[3].string = `(${skill.param.num}+${skill.param.add}*⭐)%`
                    break
                case 29:
                    labels[0].string = 'buff秒杀率'
                    labels[1].string = `(${buff.param.num}+⭐*${buff.param.add})%`
                    break
                case 30:
                    labels[0].string = '技能冷却'
                    labels[1].string = skill.cool + 's'
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