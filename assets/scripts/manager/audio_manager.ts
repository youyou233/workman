/**
 * @description 音频管理
 */

import DD from "./dynamic_data_manager";
import { SysType } from "../utils/enum";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {

    static instance: AudioManager = null

    sourceMaps: {} = {}

    isOpenBGM: boolean = false

    @property(cc.AudioSource)
    bgmSource: cc.AudioSource = null
    onLoad() {
        AudioManager.instance = this
        // this.playBGMByID(1)
    }
    DEFAULT_VOLUME: number = 0.5
    BGM_VOLUME: number = 0.4
    /**
     * 加载音频
     * @param {string} name 音频文件名
     * @param {number} volume 音频声音大小
     */
    loadAudioClip(name: string, volume: number = this.DEFAULT_VOLUME) {
        cc.loader.loadRes("sound/" + name, (err, audioClip) => {
            this.sourceMaps[name] = audioClip
            cc.audioEngine.setEffectsVolume(volume)
            cc.audioEngine.playEffect(audioClip, false)
        })
    }

    // loadBGMClip(name: string, volume: number = this.BGM_VOLUME) {
    //     cc.loader.loadRes("bgm/" + name, (err, audioClip) => {
    //         // console.log('bgm', name, err)
    //         this.sourceMaps[name] = audioClip
    //         cc.audioEngine.setMusicVolume(volume)
    //         cc.audioEngine.playMusic(audioClip, true)
    //     })
    // }

    /**
     * 播放音频
     * @param {string} name 音频文件名
     * @param {number} volume 音频声音大小
     */

    audioTimer: any = null
    canAudio: boolean = true
    playAudio(name: string, volume: number = this.DEFAULT_VOLUME) {
        if (!this.canAudio) return
        this.canAudio = false
        this.audioTimer = setTimeout(() => {
            this.canAudio = true
        }, 300);
        if (!DD.instance.config[SysType.fx]) return
        if (this.sourceMaps[name]) {
            let audioClip = this.sourceMaps[name]
            cc.audioEngine.setEffectsVolume(volume)
            cc.audioEngine.playEffect(audioClip, false)
        } else {
            this.loadAudioClip(name, volume)
        }
    }
    playBGMByID(id?: number, volume: number = this.BGM_VOLUME) {
        // let name = 'bgm_' + id
        // if (this.sourceMaps[name]) {
        //     let music = this.sourceMaps[name]
        //     cc.audioEngine.setMusicVolume(volume)
        //     cc.audioEngine.playMusic(music, true)
        // } else {
        //     this.loadBGMClip(name, volume)
        // }
        this.bgmSource.play()
    }
    stopBGM() {
        // cc.audioEngine.stopMusic()
        this.bgmSource.stop()
    }
}
