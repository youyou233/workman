import { Emitter } from "../utils/emmiter"
import config from "../utils/config"
import { MessageType } from "../utils/message"
import { ResType } from "../utils/enum"
import JsonManager from "./json_manager"
import PoolManager from "./pool_manager"
import MainManager from "./main_manager"

const { ccclass, property } = cc._decorator


@ccclass
export default class ResourceManager extends cc.Component {
    static _instance: ResourceManager = null
    static get instance() {
        if (this._instance == null) {
            this._instance = new ResourceManager()
        }
        return this._instance
    }
    _Atlas: cc.SpriteAtlas[] = []
    _Json: cc.JsonAsset[] = []
    _Prefab: cc.Prefab[] = []
    _Animation: { [key: string]: cc.AnimationClip } = {}
    _WalkAnima: { [key: string]: cc.AnimationClip } = {}
    loading: number = 0
    init() {
        console.log("ResourceManager loading ...");
        this.bindEvent()
        //加载全部图集
        let altasArr = config.resConfig.altasArr.map((item) => { return 'atlas/' + item })
        let self = this
        cc.loader.loadResArray(altasArr, cc.SpriteAtlas, (err, atlas) => {
            if (err) {
                console.error(err);
                return;
            }
            self._Atlas = atlas
            Emitter.fire('message_' + MessageType.atlasLoaded)
        })
        let jsonArr = config.resConfig.jsonArr.map((item) => { return 'json/' + item })
        cc.loader.loadResArray(jsonArr, cc.JsonAsset, (err, jsons) => {
            if (err) {
                console.error(err);
                return;
            }
            self._Json = jsons
            JsonManager.instance.init()
        })
        let prefabArr = config.resConfig.prefabArr.map((item) => { return 'prefab/' + item })
        cc.loader.loadResArray(prefabArr, cc.Prefab, (err, prefabs) => {
            if (err) {
                console.error(err);
                return;
            }
            self._Prefab = prefabs
            PoolManager.instance.init()
        })
    }
    bindEvent() {
        Emitter.register('message_' + MessageType.atlasLoaded, (name, data) => {
            ResourceManager.instance.loadedRes()
            Emitter.remove('message_' + MessageType.atlasLoaded, '')
        }, '')
        Emitter.register('message_' + MessageType.poolLoaded, (name, data) => {
            ResourceManager.instance.loadedRes()
            Emitter.remove('message_' + MessageType.poolLoaded, '')
        }, '')
        Emitter.register('message_' + MessageType.jsonLoaded, (name, data) => {
            ResourceManager.instance.loadedRes()
            Emitter.remove('message_' + MessageType.jsonLoaded, '')
        }, '')
    }
    loadedRes() {
        this.loading++
        if (this.loading == 3) {
            MainManager.instance.resLoaded()
        }
    }
    // getSpriteByOid(oid) {
    //     //  let data = DD.instance.getJsonDataByOid(oid)
    //     let name = ''
    //     // if (data.pic) {//指定图片
    //     //     name = config.jsonName[Math.floor(oid / 100)] + '_' + data.pic
    //     // } else {
    //     name = config.jsonName[Math.floor(oid / 100)] + '_' + oid % 100
    //     //}
    //     return this.getSprite(ResType.main, name)
    // }
    getSprite(type: ResType, name: string): cc.SpriteFrame {
        if (this._Atlas[type]) {
            return this._Atlas[type].getSpriteFrame(name)
        }
        return null
    }
    /**
     * 得到动画
     * @param name 
     * @param param smaple funcs
     */
    getAnimation(name: string, param: { sample: number, speed: number, funcs?, wrapMode: cc.WrapMode }, effect: boolean = false) {
        return new Promise((resolve, reject) => {
            if (this._Animation[name]) {
                resolve(this._Animation[name])
            } else {
                let url = 'animation/' + name
                if (effect) {
                    url = 'effect/' + name
                }
                cc.loader.loadRes(url, cc.SpriteAtlas, (err, atlas) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    let frames: [cc.SpriteFrame] = atlas.getSpriteFrames()
                    let clip: cc.AnimationClip = cc.AnimationClip.createWithSpriteFrames(frames, frames.length)
                    clip.name = name
                    clip.sample = param.sample
                    clip.speed = param.speed
                    clip.wrapMode = param.wrapMode
                    if (param.funcs) {
                        //自定义帧事件
                        clip.events.push(...param.funcs)
                    }
                    this._Animation[name] = clip
                    resolve(clip)
                })
            }
        })
    }

    /**
     * 获取人物走动动画
     * @param staff 是否是雇员
     * @param arr 方向
     * @param id 编号
     */
    // getWalkAniamtion(staff: boolean, arr: WalkArrType, id: number) {
    //     return new Promise((resolve, reject) => {
    //         let name = (staff ? 'staff_walk_' : 'costomer_walk_') + id + '-'
    //         if (this._WalkAnima[name + arr]) {
    //             resolve(this._Animation[name])
    //         } else {
    //             let frames: cc.SpriteFrame[] = []
    //             for (let i = arr * 3; i < (arr + 1) * 3; i++) {
    //                 let spName = name + i
    //                 frames.push(this.getSprite(ResType.walk, spName))
    //             }
    //             let clip: cc.AnimationClip = cc.AnimationClip.createWithSpriteFrames(frames, frames.length)
    //             clip.name = name + arr
    //             clip.sample = 3
    //             clip.speed = 2
    //             clip.wrapMode = cc.WrapMode.PingPongReverse
    //             this._Animation[name + arr] = clip
    //             resolve(clip)
    //         }

    //     })
    // }
}