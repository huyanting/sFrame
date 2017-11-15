## Description
#sFrame
sFrame提供一个开源构建项目的解决方案，是在同样开源的框架中提取出来的，主要采用node + webpack + bootstrap的组装方式，目的是自己记录以及对他人的提供便捷，不可用于任何商业用途，最终解释权归本人所有。

## Development Environment Setup

#Note: window需要管理员身份执行下述脚本，下述以linux(mac)为例，其他系统可参考该方法。


### 安装Node
安装4.0(建议5.x)及以上node， 通过node -v查看版本。node和npm需要全局安装


### 更新NPM
安装3.0及以上的npm，在安装完node 4.x之后会默认安装2.x.x的npm，需要升级npm至3.x.x，若安装了node 5.x，则npm已是最新，不需要更新。
- 通过命令查看:

```
npm -v
```

- 升级命令：

```
sudo npm update npm -g
```


### 安装全局node_modules
#### 开发、测试环境

```
sudo npm install -g webpack pm2 node-inspector nodemon karma-cli electron-prebuilt madge;
```

#### 线上环境

```
sudo npm install -g webpack pm2;
```


### 下载库文件
#### 开发环境
- 在工程的根目录下，安装node_modules

```
npm install
```

- 在app/目录下，安装node_modules

```
npm install
```

- 安装graphviz库 （Optional）

该库为madge依赖库，window下需要下载安装graphviz安装包（graphviz软件：http://www.graphviz.org/ ），并配置path路径。mac下先全局安装brew( http://brew.sh/index_zh-cn.html )，然后通过brew命令安装。

```
brew install graphviz;
```

#### 测试、线上环境
全局安装/app/node_modules下所有文件


### 启动服务
- 开发

```
npm run all
```

- 构建

```
npm run build
```

#### 注意事项
- 编译时log4j配置报错如“Error: Problem reading log4js config...”
```
log4j配置默认日志输出路径为/data/nodelog/log，
请配置sFrame/app/vendor.js,修改log4js.configure中appenders属性的filename属性
```
