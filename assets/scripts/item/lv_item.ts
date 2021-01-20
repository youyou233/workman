import AudioManager from "../manager/audio_manager"
import DD from "../manager/dynamic_data_manager"
import PoolManager from "../manager/pool_manager"
import ResourceManager from "../manager/resources_manager"
import UIManager from "../manager/ui_manager"
import RoleInfoUIManager from "../ui/role_info_ui_manager"
import config from "../utils/config"
import { ResType } from "../utils/enum"
import CommonItem from "./common_item"
import IconItem from "./icon_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class LvItem extends cc.Component {
    @property(cc.Sprite)
    iconSp: cc.Sprite = null
    // @property(cc.Label)
    // moneyLabel: cc.Label = null
    @property(cc.Label)
    lvLabel: cc.Label = null
    @property(cc.Node)
    unlockNode: cc.Node = null
    @property(cc.Node)
    giftNode: cc.Node = null
    @property(CommonItem)
    giftSp: CommonItem[] = []
    @property(cc.Label)
    giftLabel: cc.Label[] = []
    @property(cc.Button)
    giftBtn: cc.Button[] = []
    @property(cc.Node)
    unlockContainer: cc.Node = null
    lv: number = null
    onLoad() {
        this.giftBtn.forEach((item, index) => {
            item.node.on('click', () => {
                this.getGift(index)
            }, this)
        })

    }
    init(lv, data: any) {
        this.lv = lv
        this.lvLabel.string = config.lvString[lv - 1]
        let levelIndex = [1, 5, 9, 13, 16].indexOf(+lv)
        this.iconSp.spriteFrame = ResourceManager.instance.getSprite(ResType.main, 'icon (' + lv + ')')
        if (levelIndex != -1) {
            this.giftNode.active = false
            this.unlockNode.active = true
            this.clearContainer()
            let roles = config.unlockRole[levelIndex]
            for (let i = 0; i < roles.length; i++) {
                let icon = PoolManager.instance.createObjectByName('iconItem', this.unlockContainer)
                let cardData = { id: roles[i], lv: 1 }
                icon.getComponent(IconItem).init(cardData, () => {
                    UIManager.instance.openUI(RoleInfoUIManager, { name: config.uiName.roleInfoUI, param: [cardData, false] }, 300)
                }, false)
            }
        } else {
            this.giftNode.active = true
            this.unlockNode.active = false
            data.forEach((element, index) => {
                this.giftBtn[index].node.active = !element
            });
            this.giftLabel[1].string = '金币' + 100 * lv
        }
    }



    clearContainer() {
        for (let j = this.unlockContainer.children.length - 1; j >= 0; j--) {
            PoolManager.instance.removeObjectByName('iconItem', this.unlockContainer.children[j])
        }
    }
    getGift(index: number) {
        AudioManager.instance.playAudio('click')
        if (index == 0) {
            if (DD.instance.isVip()) {
                DD.instance.getRankGift(this.lv, index)
                this.giftBtn[index].node.active = false
            } else {
                UIManager.instance.LoadTipsByStr('您还不是精英')
            }
        } else {
            DD.instance.getRankGift(this.lv, index)
            this.giftBtn[index].node.active = false
        }
        //刷新页面
    }
}