import BossItem from "../item/boss_item"
import MonsterItem from "../item/monster_item"
import BattleUIManager from "../ui/battle_ui_manager"

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

    money: number = 0
    ticket: number = 0//招待券

    getMonsterByNode(monster): MonsterItem | BossItem {
        if (monster.name == 'monsterItem') {
            return monster.getComponent(MonsterItem)
        } else if (monster.name == 'bossItem') {
            return monster.getComponent(BossItem)

        }
    }
}