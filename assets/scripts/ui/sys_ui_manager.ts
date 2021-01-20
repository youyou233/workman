
import MainManager from "../manager/main_manager"
import { Emitter } from "../utils/emmiter"
import { MessageType } from "../utils/message"
import DD from "../manager/dynamic_data_manager"
import { ResType, SysType } from "../utils/enum"
import StorageManager from "../manager/storage_manager"
import AudioManager from "../manager/audio_manager"
import ResourceManager from "../manager/resources_manager"
import ActionManager from "../manager/action_manager"

const { ccclass, property } = cc._decorator

@ccclass
export default class SysUIManager extends cc.Component {
    static instance: SysUIManager = null


    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Button)
    mask: cc.Button = null
    @property(cc.Button)
    bgmBtn: cc.Button = null
    @property(cc.Button)
    fxBtn: cc.Button = null
    @property(cc.Button)
    effectBtn: cc.Button = null
    @property(cc.Button)
    damageLabelBtn: cc.Button = null

    @property(cc.Sprite)
    configSps: cc.Sprite[] = []
    onLoad() {
        SysUIManager.instance = this
        this.content.active = false
        this.bindEvent()
    }
    bindEvent() {
        this.mask.node.on('click', this.hideUI, this)
        this.bgmBtn.node.on('click', () => { this.switchConfig(SysType.bgm) }, this)
        this.fxBtn.node.on('click', () => { this.switchConfig(SysType.fx) }, this)
        this.effectBtn.node.on('click', () => { this.switchConfig(SysType.effect) }, this)
        this.damageLabelBtn.node.on('click', () => { this.switchConfig(SysType.damageLabel) }, this)
    }
    switchConfig(type: SysType) {
        AudioManager.instance.playAudio('click')
        if (type == SysType.bgm) {
            if (DD.instance.config[type]) {
                AudioManager.instance.stopBGM()
            } else {
                AudioManager.instance.playBGMByID(1)
            }
        }
        DD.instance.config[type] = !DD.instance.config[type]
        this.frashUI()
        StorageManager.instance.saveDataByKey('config', DD.instance.config)
    }
    showUI() {
        ActionManager.instance.showDialog(this.content, this.mask.node)
        AudioManager.instance.playAudio('openDialog')
        this.content.active = true
        this.frashUI()
    }
    frashUI() {
        for (let type in DD.instance.config) {
            let name = DD.instance.config[type] ? 'checked' : 'checkun'
            this.configSps[+type - 1].spriteFrame = ResourceManager.instance.getSprite(ResType.main, name)
        }
    }
    hideUI() {
        this.content.active = false
        AudioManager.instance.playAudio('closeDialog')
    }

}
