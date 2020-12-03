# cocoscreator TS版本脚本规范

## 插件安装
### 1. beautify (推荐)
美化插件 代码格式化快捷键 alt+shift+F

### 2. TSLint && ESLint

### 3. GitLens
vscode上的git管理插件

### 4. TODO HighLight (推荐)
todo高亮

### 5. ccc自带的拓展

## ts的基本介绍与使用
### 1. 类型检查
如果传入的数据类型和声明的类型不一样会报错提示
>eg changeReviveItem(num: number){} 则num必须传入number类型

### 2. 语法提示
强大的语法提示功能，按住ctrl然后鼠标点击函数即可快速跳转。输入任何一个类便可自动引入。

### 3. 支持ES6特性
可使用异步promiss,拓展符,解构等等


## 命名规范
### 1. ts文件名称  
采用全部小写+下划线方式  
>eg : dynamic_data_manager

### 1. ts类名  
采用首字母大写驼峰命名  
>eg：PreStartPage、GameController、Scripts、CardPrefab

### 3. 脚本中
1. 函数命名：采用首字母小写驼峰命名,必须能完整描述作用，用**动词**开头  
>eg : onGameOver、getGameData、updatePlayerPosition
2. 变量命名：采用首字母小写驼峰命名,必须能完整描述作用，用**修饰词**开头
3. 常量命名：采用全大写的命名，且单词以_（下划线）分割 
>eg : MONSTER_MAX_NUM=10
4. （私有）专有属性：采用首字母小写驼峰命名，必须在名称前加_（下划线） 
>eg _instance=null

## 脚本规范
### 1. 重要组件介绍
- 游戏主入口`MainManager`进入
- 推荐公共游戏数据存取管理器`DynamicDataManager`
- 资源加载文件 `ResourcesManager`
- 游戏配置文件 `JsonManager`
- 本地数据管理 `LocalDataManager`
- 事件观察组件组件 `Emitter`
- 对象池管理组件 `PoolManager`
- 枚举 'enum' 所有的枚举写在这个里面

### 2. UI组件管理
- 所有视图组件需要用@property声明后，再拉到ccc的属性检查器中
- 点击事件应该用on()监听
- 一个页面应该由一个UI组件控制，一个弹框也应该由一个UI组件控制，能够复用的组件需要做成item去重复使用

### 3 instance
- instance参考unity中C#的写法，将一个类实例化（初始化），从而可以直接去访问这个类的**公共属性或方法**

### 4. 开放接口，封闭实现

- 面向对象编程的一个原则称为**开放-封闭原则**，简称**OCP**（Open-Closed Principle）。
- 意即对扩展开放，对修改关闭。
- 别的同学在使用你写的组件时，应该只要知道你的组件有哪些接口、如何调用就好，而无须关心你具体代码是怎么写的。
- 你写的每一个 class ，都应该时刻**为他人着想**，考虑他人如何调用你的组件最方便。宁可自己多写点代码，也不要把麻烦留给他人。
- 即使是只给自己用的 class，也应该尽力遵守这个**OCP**原则，这是程序员的基本功。


## 常用git操作
项目使用git托管代码

特别注意：开始编码前和上传代码前务必先`git pull`从远程代码库拉取最新代码。

git常用命令

`git add .`将修改增加的代码提交暂存处

`git commit -m 'commit message'`提交暂存处代码到本地版本库

`git push`提交本地代码到远程分支

`git branch`查看当前git分支

`git checkout branchName`切换当前分支到branchName分支

`git pull`拉取远程分支内容更新本地分支

# 使用 JSDoc 规范添加注释

- [JSDoc 官方手册（英文）](http://usejsdoc.org/)
- [JSDoc 中文参考手册](https://yuri4ever.github.io/jsdoc/)
- 以 `/**` 开头（有两个星号），另起一行，然后每行以 ` * `（一个空格、一个星号、再一个空格）开头，最后一行以 ` */` （空格、星号、斜杠）结束
- 在每个 ts **文件开头**，**必须**添加文件注释。
  - 必须项：`@file`（文件描述）`@author`（作者名字或昵称）`@date`（文件创建日期）
  - 可选项：`@description`（更详细的文件描述），此外还可以自由添加更多注释项（参考 JSDoc 手册）。
```javascript
/**
 * 主控制器
 * @file 整个游戏的入口脚本
 * @author uu
 * @date 2018/12/15
 */
```
- 在每个 function 和每个带有 `public` 或 `export` 光环的变量、方法、接口、函数等，开头**都必须**添加注释。
  - 注释第一行写上描述。
  - 必须项（若有参数）： `@param {type} name - description`，参数类型和说明，每个参数一行。
  - 必须项（若有返回值）： `@returns {type} description`。
  - 若是在别人创建的文件里添加 function，建议针对你的 function 单独加上 `@author` 留下你的大名（以及时间 `@date`）。
  - 鼓励自由发挥添加更多注释，但请尽量地遵守 JSDoc 规范。
  - 示例：
```javascript
/**
 * 读取存档
 * @param {string} id - 存档号
 * @returns {string} 获得的存档
 * @author uu
 * @date 2018/12/15
 */
getLoadById(id:number){
    //XXXXXXXX
    return {}
};
```
- class 可以不用添加注释，因为我们规定，每个文件应该只包含一个 class。请在文件开头使用 `@file` 和 `@description （可选）` 注释 class 的用途。