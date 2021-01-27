import UIManager from "./ui_manager";
import { Utils } from "../utils/utils";

const { ccclass, property } = cc._decorator;
interface ADCallBack {
    (isOK: boolean, param?: {}): void
}
@ccclass
export default class SDKManager extends cc.Component {

    static _instance: SDKManager = null


    static get instance() {
        if (this._instance == null) {
            this._instance = new SDKManager()
        }
        return this._instance
    }
    private videoAd //视频广告实例
    private adCallBack: ADCallBack = null // 视频广告回调

    private interstitialAd = null // 插屏广告实例
    private isLoadInterstitialAd: boolean = false // 插屏广告是否拉取成功

    init() {
        // if (qq) {
        //     qq.showShareMenu({
        //         showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
        //     })
        if (wx) {
            wx.showShareMenu({
                withShareTicket: true,
                menus: ['shareAppMessage', 'shareTimeline']
            })
            wx.onShareAppMessage(() => ({
                title: '打工人竟是我自己',
                imageUrl: cc.url.raw('resources/share.png') // 图片 URL
            }))
            wx.setKeepScreenOn({
                keepScreenOn: true
            })
        }

        // this.initVideoAd()
        //     // this.initInterstitialAd()
        // }
    }
    _hasAd: boolean = true
    /**
     * 适配水滴屏幕
     */
    adobeHeight() {
        // if (wx) {
        //     let sysInfo = wx.getSystemInfoSync()
        //     let rate = window.winSize.width / sysInfo.screenWidth
        //     HeaderUIManager.instance.getComponent(cc.Widget).top = sysInfo.statusBarHeight * rate
        // }
    }
    initVideoAd() {
        //初始化视频方法
        let self = this
        if (wx) {
            //字节跳动处理
            // if (typeof wx.createRewardedVideoAd == "undefined") {
            //     console.error("no wx.createRewardedVideoAd")
            //     WXManager.instance.adCallBack(false, { status: AdvCallBackStatus.noAdv })
            //     return
            // }

            //实例
            let videoAd = wx.createRewardedVideoAd({
                adUnitId: 'adunit-5b2d78f2bf33cddf'
            })

            this.videoAd = videoAd

            videoAd.onLoad(() => {
                console.log(" videoAd.onLoad")
                self._hasAd = true
            })
            //捕捉错误
            videoAd.onError(err => {
                console.log(" videoAd.onError")
                console.log(err)
                self._hasAd = false
                self.adCallBack(false)
                UIManager.instance.LoadTipsByStr('无广告预览')
                // PlayerNetwork.instance.ReportAdvertStatsRequest(AdverState.VideoFailed)
            })

            //关闭视频的回调函数
            videoAd.onClose(res => {
                // AudioManager.instance.resumeAllMusic()
                // 用户点击了【关闭广告】按钮
                // 小于 2.1.0 的基础库版本，res 是一个 undefined
                console.log(res)
                if ((res && res.isEnded) || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    console.log("正常播放结束，可以下发游戏奖励")
                    self.adCallBack(true)
                    // UIManager.instance.LoadTipsByStr('谢谢支持，金币+500')
                    // PlayerNetwork.instance.ReportAdvertStatsRequest(AdverState.VideoDone)
                } else {
                    console.log("您的视频还没看完，无法获得奖励")
                    self.adCallBack(false)
                    UIManager.instance.LoadTipsByStr('您的视频还没看完，无法获得奖励')

                    // PlayerNetwork.instance.ReportAdvertStatsRequest(AdverState.VideoAborted)
                }
            })

            videoAd.load()
        }
    }
    /**
    * 初始化插屏广告
    */
    initInterstitialAd() {
        if (qq) {
            this.interstitialAd = qq.createInterstitialAd({
                adUnitId: 'fbfae589e9f224f7456219da56c27845'
            });
            this.interstitialAd.onLoad(() => { // 拉取广告成功
                this.isLoadInterstitialAd = true
                console.log('插屏广告加载成功')
            })
            this.interstitialAd.onError(err => { // 拉取广告失败
                this.isLoadInterstitialAd = false
                console.log('插屏广告加载失败', err)
            })
            this.interstitialAd.onClose(() => { // 关闭广告
                console.log('插屏广告关闭')
            })
        }
    }

    /**
     * 显示插屏广告
     */
    showInterstitialAd() {
        if (this.interstitialAd && this.isLoadInterstitialAd) {
            if (Utils.getRandomNumber(7) >= 5) { // 
                this.interstitialAd.show().catch((err) => { // 广告拉取失败或触发频率限制
                    console.log('插屏广告显示失败', err)
                })
            }
        }
    }
    /**
 * 显示视频广告
 * @param {ADCallBack} adCallback 广告回调
 */
    showAd(adCallback: ADCallBack) {
        this.adCallBack = adCallback
        // AudioManager.instance.stopAllMusic()
        let self = this
        if (wx) {
            //版本兼容保护
            if (typeof self.videoAd.show != "undefined") {
                // PlayerNetwork.instance.ReportAdvertStatsRequest(AdverState.VideoTried)
                self.videoAd.show().catch(err => {
                    self.videoAd.load().then(() => {
                        self.videoAd.show()
                    })
                })
            } else {
                console.log('暂无可展示的视频广告')
                // UIManager.instance.LoadTipsByStr(Lang.GetText('NO_ADV'))
            }
        } else {
            console.log('暂无可展示的视频广告')
            //  UIManager.instance.LoadTipsByStr(Lang.GetText('NO_ADV'))
        }
    }
    canShare() {
        if (wx) {
            return true
        }
        return false
    }
    onShare(cb) {
        wx.shareAppMessage({
            title: '这河里吗，这像画吗',
            imageUrl: cc.url.raw('resources/share.png') // 图片 URL
        })
        setTimeout(() => {
            cb()
        });
    }


}
