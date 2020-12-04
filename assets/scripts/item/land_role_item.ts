import LandItem from "./land_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class LandRoleItem extends cc.Component {
    @property(LandItem)
    landItem: LandItem = null
    aniCB(type) {
        this.landItem.aniCB(type)
    }
}