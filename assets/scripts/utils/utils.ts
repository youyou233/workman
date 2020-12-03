export class Utils {
    /**
     * 深拷贝
     * @param obj 对象
     */
    static deepCopy(obj) {
        var result = Array.isArray(obj) ? [] : {}
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    result[key] = this.deepCopy(obj[key]) //递归复制
                } else {
                    result[key] = obj[key]
                }
            }
        }
        return result
    }
    /**
     * 查找数组中的ID为某项
     * @param arr 
     * @param key 要查找的字段名称
     * @param data 
     */
    static arrFind(arr: any[], key: string, data: any) {
        for (let i = 0, length = arr.length; i < length; i++) {
            if (arr[i][key] == data) {
                return [arr[i], i]
            }
        }
    }

    /**
     * 获取百分百字符串
     * @param val 1则为 100.00%
     */
    static getPercentStr(val: number): string {
        var str = Number(val * 100).toFixed(2)
        str += "%"
        return str
    }

    /**
     * 快排
     * @param source_arr
     * @param selector
     */
    static orderBy(source_arr, selector): any {
        if (source_arr.length <= 1) {
            return source_arr
        }
        const pivotIndex = Math.floor(source_arr.length / 2)
        const pivot = source_arr.splice(pivotIndex, 1)[0]
        const left = []
        const right = []
        for (const i of source_arr) {
            if (selector(i) < selector(pivot)) {
                left.push(i)
            } else {
                right.push(i)
            }
        }
        return Utils.orderBy(left, selector).concat([pivot], Utils.orderBy(right, selector))
    }


    /**
     * 生成随机数 0-max
     * @param {number} max 最大值
     * @returns {number}
     */
    static getRandomNumber(max: number): number {
        return Math.floor(Math.random() * (max + 1))
    }
    /**
     * 获取时间 返回一个对象
     * @param time 
     */
    static getLocalTime(time) {
        let finDate = {}
        let date = new Date(time * 1000)
        finDate["y"] = date.getFullYear()
        finDate["m"] = date.getMonth() + 1
        finDate["d"] = date.getDate()
        return finDate
    }

    static getGameTime(time) {
        let finDate: any = {}
        //  let date = new Date(time * 1000 * 24 * 3600)
        finDate["y"] = Math.floor((time - 1) / 28 / 4) + 1
        finDate["m"] = Math.floor((time - 1) / 28) % 4 //季节
        finDate["d"] = time % 28
        finDate['w'] = time % 7 - 1
        if (finDate['d'] == 0) finDate['d'] = 28
        if (finDate['w'] == -1) finDate['w'] = 6
        return finDate
    }

    /**
        * 获取json的长度
        * @param jsonData
        */
    static getJsonLength(jsonData: JSON): number {
        let jsonLength = 0
        for (let item in jsonData) {
            jsonLength++
        }
        return jsonLength
    }
    /**
     * 打印对象
     * @param obj
     */
    static printObj(obj) {
        var description = ""
        for (var i in obj) {
            var property = obj[i]
            description += i + " = " + property + "\n"
        }
        console.log(description)
    }
    /**
     * 检测是否包含字符串
     * @param str
     * @param data
     */
    static isContain(str: string, data: string): boolean {
        if (str != null) {
            var index = str.indexOf(data)
            if (index > -1) {
                return true
            }
        }

        return false
    }

    /**
     * 检测对象中是否包含相应key
     * @param obj
     * @param objkey
     */
    static isIn(obj: object, objkey: string): any {
        if (obj != null) {
            for (let key in obj) {
                if (obj[key] == objkey) {
                    return key
                }
            }
        }

        return false
    }
    //获得格式化的大数值
    static getLargeNumStr(val: number): string {
        // if (val >= 10000000000) {
        //     return (val / 1000000000).toFixed(1) + "B"
        // } else if (val >= 10000000) {
        //     return (val / 1000000).toFixed(1) + "M"
        // } else if (val >= 10000) {
        //     return (val / 1000).toFixed(1) + "K"
        // }
        // return Math.floor(val).toString()
        if (val >= 99999999) {
            return (val / 100000000).toFixed(2) + "亿"
        } else if (val >= 10000) {
            return (val / 10000).toFixed(2) + "万"
        } else {
            return Math.floor(val).toString()
        }
    }
    /**
     * 获取时间分和秒 格式00：00
     * @param time 
     */
    static getTimeFormat(time: number): string {
        if (time < 0) {
            return "00:00"
        }

        let min = Math.floor(time / 60)
        let sec = Math.floor(time - min * 60)

        if (min < 10 && sec < 10) {
            return "0" + min.toString() + ":" + "0" + sec.toString()
        } else if (min < 10 && sec >= 10) {
            return "0" + min.toString() + ":" + sec.toString()
        } else if (min >= 10 && sec < 10) {
            return min.toString() + ":" + "0" + sec.toString()
        } else if (min >= 10 && sec >= 10) {
            return min.toString() + ":" + sec.toString()
        }
        return "00:00"
    }

    /**
     * 从时间戳的差判断是多久以前
     * @param time 
     */
    static getTimeFromNowStr(time: number): string {
        if (time <= 60) {
            return "刚刚"
        }
        let min = Math.floor(time / 60)
        let hour = Math.floor(time / 3600)
        let day = Math.floor(time / 84600)

        if (day >= 1) {
            return day + "天以前"
        }
        if (hour >= 1) {
            return hour + "小时以前"
        }
        if (min >= 1) {
            return min + "分以前"
        }
    }
    //洗牌打乱
    static shuffle(array: any[]) {
        var m = array.length,
            t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }


    static setSpScale(node: cc.Node, size: number) {
        node.scale = 1
        if (node.width > node.height) {
            if (node.width > size) node.scale = size / node.width
        } else {
            if (node.height > size) node.scale = size / node.height
        }
    }
}