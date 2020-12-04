import BattleManager from "../manager/battle_manager"
import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"

const { ccclass, property } = cc._decorator

@ccclass
export default class CardItem extends cc.Component {
    index: number = 0
    @property(cc.Sprite)
    skillSp: cc.Sprite = null
    @property(cc.Sprite)
    roleIcon: cc.Sprite = null
    @property(cc.Sprite)
    cardBG: cc.Sprite = null
    init(index) {
        let roleId = BattleManager.instance.team[index].id
        this.roleIcon.spriteFrame = ResourceManager.instance.getSprite(
            ResType.main, 'role_' + roleId
        )
    }
}