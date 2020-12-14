const { ccclass, property } = cc._decorator

@ccclass
export default class GroupUIManager extends cc.Component {
    static instance: GroupUIManager = null
    @property(cc.Node)
    content: cc.Node = null
    @property(cc.Node)
    curGroupNode: cc.Node = null
    @property(cc.Node)
    allGroupNode: cc.Node = null
    onLoad() {
        GroupUIManager.instance = this
    }
}