const { ccclass, property } = cc._decorator
/**
 * 此文件用于控制游戏中所有数据 以及可视化绑定
 */
@ccclass
export default class DD extends cc.Component {
    static _instance: DD = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new DD()
        }
        return this._instance
    }
    roleMap: object = {
        1: 1,
        2: 1,
        3: 1,
        4: 1,
        5: 1
    }
}