
import MainManager from "../manager/main_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import DD from "../manager/dynamic_data_manager"
import { ResType, SysType } from "../utils/enum"
import StorageManager from "../manager/storage_manager"
import AudioManager from "../manager/audio_manager"
import ResourceManager from "../manager/resources_manager"
import ActionManager from "../manager/action_manager"
import GroupUIManager from "./group_ui_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class SortUIManager extends cc.Component {
    static instance: SortUIManager = null


    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Button)
    mask: cc.Button = null
    @property(cc.Label)
    minLevelLabel: cc.Label = null
    @property(cc.Slider)
    minLevelSlider: cc.Slider = null
    @property(cc.Label)
    qualityLabel: cc.Label = null
    @property(cc.Slider)
    qualitySlider: cc.Slider = null
    @property(cc.Node)
    sortUpNode: cc.Node = null
    @property(cc.Node)
    sortDownNode: cc.Node = null
    @property(cc.Node)
    roleTypeNode: cc.Node = null
    @property(cc.Button)
    certainBtn: cc.Button = null
    // sortType: number = 0
    onLoad() {
        SortUIManager.instance = this
        this.content.active = false
        this.bindEvent()
        this.sortDownNode.on('click', () => {
            this.switchNode(this.sortDownNode)
        }, this)
        this.sortUpNode.on('click', () => {
            this.switchNode(this.sortUpNode)
        }, this)
        this.roleTypeNode.children.forEach((item) => {
            item.on('click', () => {
                this.switchNode(item)
            })
        })
        this.certainBtn.node.on('click', this.onCertain, this)

    }
    switchNode(node) {
        let sp = node.getChildByName('checkun').getComponent(cc.Sprite)
        let spName = sp.spriteFrame == ResourceManager.instance.getSprite(ResType.main, 'checked') ? 'checkun' : 'checked'
        sp.spriteFrame =
            ResourceManager.instance.getSprite(ResType.main, spName)
    }
    bindEvent() {
        this.mask.node.on('click', this.hideUI, this)
    }
    minLevelChange() {
        this.minLevelLabel.string = '最低等级' + Math.round(this.minLevelSlider.progress * 100)
    }
    qualityChange() {
        this.qualityLabel.string = '最低品质' + Math.round(this.qualitySlider.progress * 6)
    }
    showUI() {
        ActionManager.instance.showDialog(this.content, this.mask.node)
        AudioManager.instance.playAudio('openDialog')
        this.content.active = true
    }
    hideUI() {
        this.content.active = false
        AudioManager.instance.playAudio('closeDialog')
    }
    getSf(node) {
        let sp = node.getChildByName('checkun').getComponent(cc.Sprite)
        return sp.spriteFrame
    }
    onCertain() {
        let list = this.getList()
        GroupUIManager.instance.showUI(list)
        this.hideUI()
    }
    getList() {
        let minLevel = Math.round(this.minLevelSlider.progress * 100)
        let minQuality = Math.round(this.qualitySlider.progress * 6)
        let sortType = 0
        let checked = ResourceManager.instance.getSprite(ResType.main, 'checked')
        if (this.getSf(this.sortDownNode) != this.getSf(this.sortUpNode)) {
            sortType = this.getSf(this.sortDownNode) == checked ? 1 : 2
        }
        let roleType = []
        this.roleTypeNode.children.forEach((item, index) => {
            if (this.getSf(item) == checked) {
                roleType.push(index + 1)
            }
        })

        let list = DD.instance.getCardsBySort(sortType, minLevel, minQuality, roleType)
        return list
    }
}
