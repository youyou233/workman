import LandItem from "../item/land_item";
import PoolManager from "../manager/pool_manager";

const { ccclass, property } = cc._decorator

@ccclass
export default class BattleUIManager extends cc.Component {
    static instance: BattleUIManager = null

    @property(cc.Node)
    landContainer: cc.Node = null
    @property(cc.Node)
    cardContainer: cc.Node = null
    onLoad() {
        BattleUIManager.instance = this
    }
    initBattle() {
        // this.landContainer.children.forEach(item => {
        //     item.getComponent(LandItem).init()
        // });
        this.clearContainer()
        for (let i = 0; i < 15; i++) {
            let land = PoolManager.instance.createObjectByName('landItem', this.landContainer)
            land.getComponent(LandItem).init()
        }
    }
    clearContainer() {
        let children = this.landContainer.children
        for (let i = children.length - 1; i >= 0; i--) {
            PoolManager.instance.removeObjectByName('landItem', children[i])
        }
    }
}