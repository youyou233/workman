import ResourceManager from "../manager/resources_manager"
import { ResType } from "../utils/enum"
import LandItem from "./land_item"

const { ccclass, property } = cc._decorator

@ccclass
export default class GridItem extends cc.Component {
    @property(LandItem)
    land: LandItem = null
    init(act: number) {
        this.land.node.active = act == 1 ? true : false
        if (!act) {
            this.land.id = null
            this.land.setNull()
        }
        this.land.pos = cc.v2(this.node.x, this.node.y)
    }
    onUpdate(dt) {
        if (this.land.node.active) {
            this.land.onUpdate(dt)
        }
    }
}