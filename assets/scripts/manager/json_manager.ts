
import { Emitter } from "../utils/emmiter";
import { MessageType } from "../utils/message";
import config from "../utils/config";
import ResourceManager from "./resources_manager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JsonManager extends cc.Component {
    static _instance: JsonManager = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new JsonManager()
        }
        return this._instance
    }
    _Data: any[] = []
    init() {
        for (let i = 0; i < config.resConfig.jsonArr.length; i++) {
            this._Data[i] = ResourceManager.instance._Json[i].json
        }
        Emitter.fire('message_' + MessageType.jsonLoaded)
    }
    getDataByName(name: string) {
        let index = config.resConfig.jsonArr.indexOf(name)
        if (index == -1) {
            console.log('填写了错误的name', name)
            return
        }
        return this._Data[index]
    }
    getConfig(name: string) {
        return this._Data[0][1][name]
    }
}