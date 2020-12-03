
import { Emitter } from "../utils/emmiter";
import { MessageType } from "../utils/message";
import ResourceManager from "./resources_manager";
import config from "../utils/config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PoolManager extends cc.Component {
    static _instance: PoolManager = null

    static get instance() {
        if (this._instance == null) {
            this._instance = new PoolManager()
        }
        return this._instance
    }
    _Pool: cc.NodePool[] = []
    init() {
        for (let i = 0; i < config.resConfig.prefabArr.length; i++) {
            this._Pool[i] = new cc.NodePool()
            let node = cc.instantiate(ResourceManager.instance._Prefab[i])
            this._Pool[i].put(node)
        }
        Emitter.fire('message_' + MessageType.poolLoaded)
    }
    createObjectByName(name: string, parentNode: cc.Node = null): cc.Node {
        let index = config.resConfig.prefabArr.indexOf(name)
        if (index == -1) {
            console.log('填写了错误的name', name)
            return
        }
        let curPrefab = ResourceManager.instance._Prefab[index]
        let curPool = this._Pool[index]

        let result: cc.Node

        if (curPool != null) {
            if (curPool.size() > 0) {
                result = curPool.get()
            } else {
                result = cc.instantiate(curPrefab)
            }
            if (parentNode) {
                result.parent = parentNode
            }
        }

        return result
    }
    removeObjectByName(name: string, obj: cc.Node) {
        let index = config.resConfig.prefabArr.indexOf(name)
        if (index == -1) {
            console.log('填写了错误的name', name)
            return
        }
        let pool = this._Pool[index]
        if (pool != null) {
            pool.put(obj)
        } else {
            console.error("no this pool:" + name)
        }
    }
}