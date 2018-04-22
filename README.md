## 学习webpack4的配置更改

> webpack作为一个模块打包器，主要用于前端工程中的依赖梳理和模块打包，将我们开发的具有高可读性和可维护性的代码文件打包成浏览器可以识别并正常运行的压缩代码，主要包括样式文件处理成`css`，各种新式的`JavaScript`转换成浏览器认识的写法等，也是前端工程师进阶的不二法门。

### webpack.config.js配置项简介

1. Entry：入口文件配置，Webpack 执行构建的第一步将从 Entry 开始，完成整个工程的打包。
2. Module：模块，在`Webpack`里一切皆模块，`Webpack`会从配置的`Entry`开始递归找出所有依赖的模块，最常用的是`rules`配置项，功能是匹配对应的后缀，从而针对代码文件完成格式转换和压缩合并等指定的操作。
3. Loader：模块转换器，用于把模块原内容按照需求转换成新内容，这个是配合`Module`模块中的`rules`中的配置项来使用。
4. Plugins：扩展插件，在`Webpack`构建流程中的特定时机注入扩展逻辑来改变构建结果或做你想要的事情。(插件`API`)
5. Output：输出结果，在`Webpack`经过一系列处理并得出最终想要的代码后输出结果，配置项用于指定输出文件夹，默认是`./dist`。
6. DevServer：用于配置开发过程中使用的本机服务器配置，属于`webpack-dev-server`这个插件的配置项。

### webpack打包流程简介

- 根据传入的参数模式(`development` | `production`)来加载对应的默认配置
- 在`entry`里配置的`module`开始递归解析`entry`所依赖的所有`module`
- 每一个`module`都会根据`rules`的配置项去寻找用到的`loader`,接受所配置的`loader`的处理
- 以`entry`中的配置对象为分组，每一个配置入口和其对应的依赖文件最后组成一个代码块文件(chunk)并输出
- 整个流程中`webpack`会在恰当的时机执行`plugin`的逻辑，来完成自定义的插件逻辑

### 基本的webpack配置搭建

首先通过以下的脚本命令来建立初始化文件：

```bash
npm init -y
npm i webpack webpack-cli -D // 针对webpack4的安装
mkdir src && cd src && touch index.html index.js
cd ../ && mkdir dist && mkdir static
touch webpack.config.js
npm i webpack-dev-server --save-dev
```

修改生成的`package.json`文件，来引入`webpack`打包命令:

```json
"scripts": {
    "build": "webpack --mode production",
    "dev": "webpack-dev-server --open --mode development"
}
```

对`webpack.config.js`文件加入一些基本配置`loader`，从而基本的`webpack4.x`的配置成型(以两个页面入口为例):

```javascript
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin') // 复制静态资源的插件
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空打包目录的插件
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成html的插件
const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin') //CSS文件单独提取出来
const webpack = require('webpack')

module.exports = {
    entry: {
        index: path.resolve(__dirname, 'src', 'index.js'),
        page: path.resolve(__dirname, 'src', 'page.js'),
        vendor:'lodash' // 多个页面所需的公共库文件，防止重复打包带入
    },
    output:{
        publicPath: '/',  //这里要放的是静态资源CDN的地址
        path: path.resolve(__dirname,'dist'),
        filename:'[name].[hash].js'
    },
    resolve:{
        extensions: [".js",".css",".json"],
        alias: {} //配置别名可以加快webpack查找模块的速度
    },
    module: {
        // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
        rules:[
            {
                test: /\.css$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader'] // 不再需要style-loader放到html文件内
                }),
                include: path.join(__dirname, 'src'), //限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test:/\.less$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'less-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test:/\.scss$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use:['css-loader', 'postcss-loader', 'sass-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'babel-loader',
                    query: { //同时可以把babel配置写到根目录下的.babelrc中
                      presets: ['env', 'stage-0'] // env转换es6 stage-0转es7
                    }
                }
            },
            { //file-loader 解决css等文件中引入图片路径的问题
            // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
                test: /\.(png|jpg|jpeg|gif|svg)/,
                use: {
                  loader: 'url-loader',
                  options: {
                    outputPath: 'images/', // 图片输出的路径
                    limit: 1 * 1024
                  }
                }
            }
        ]
    },
    plugins: [
        // 多入口的html文件用chunks这个参数来区分
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'src','index.html'),
            filename:'index.html',
            chunks:['index', 'vendor'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'src','page.html'),
            filename:'page.html',
            chunks:['page', 'vendor'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new webpack.ProvidePlugin({
            _:'lodash' //所有页面都会引入 _ 这个变量，不用再import引入
        }),
        new ExtractTextWebapckPlugin('css/[name].[hash].css'),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'static'),
                to: path.resolve(__dirname, 'dist/static'),
                ignore: ['.*']
            }
        ]),
        new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
    ],
    devtool: 'eval-source-map', // 指定加source-map的方式
    devServer: {
        contentBase: path.join(__dirname, "dist"), //静态文件根目录
        port: 3824, // 端口
        host: 'localhost',
        overlay: true,
        compress: false // 服务器返回浏览器的时候是否启动gzip压缩
    },
    watch: true, // 开启监听文件更改，自动刷新
    watchOptions: {
        ignored: /node_modules/, //忽略不用监听变更的目录
        aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
        poll:1000 //每秒询问的文件变更的次数
    },
}
```

在命令行下用以下命令安装`loader`和依赖的插件，生成完全的`package.json`项目依赖树。

```bash
npm install extract-text-webpack-plugin@next --save-dev
npm i style-loader css-loader postcss-loader --save-dev
npm i less less-loader --save-dev
npm i node-sass sass-loader --save-dev
npm i babel-core babel-loader babel-preset-env babel-preset-stage-0 --save-dev
npm i file-loader url-loader --save-dev

npm i html-webpack-plugin ---save-dev
npm i clean-webpack-plugin --save-dev
npm i copy-webpack-plugin --save-dev

npm run dev
```

默认打开的页面是`index.html`页面，可以加上/page.html来打开page页面看效果。
PS: 关于`loader`的详细说明可以参考`webpack3.x`的学习介绍，上面配置中需要注意的是多页面的公共库的引入采用的是`vendor`+暴露全局变量的方式，其实这种方式有诸多弊端，而`webpack4`针对这种情况设置了新的API，有兴趣的话，就继续看下面的高级配置吧。

### 进阶的webpack4配置搭建

包含以下几个方面：
1. 针对`CSS`和`JS`的`TreeShaking`来减少无用代码，针对`JS`需要对已有的`uglifyjs`进行一些自定义的配置(生产环境配置)
2. 新的公共代码抽取工具(`optimization.SplitChunksPlugin`)提取重用代码，减小打包文件。（代替`commonchunkplugin`）
3. 使用`HappyPack`进行`javascript`的多进程打包操作，提升打包速度
4. 创建一个`webpack.dll.config.js`文件打包常用类库到dll中，使得基础模块不会重复被打包，而是去动态连接库里获取，代替上一节使用的`vendor`。(`webpack4.x`新特性)
5. 加入作用域提升(前一版本的特性)和模块热替换，后者需要在项目中增加一些配置，不过大型框架把这块都封装好了。(开发环境配置)

关于第四点，需要在package.json中的script中增加脚本:
`"build:dll": "webpack --config webpack.dll.config.js --mode production",`

补充安装插件的命令行：

```bash
npm i purify-css purifycss-webpack -D // 用于css的tree-shaking
npm i webpack-parallel-uglify-plugin -D // 用于js的tree-shaking
npm i happypack@next -D //用于多进程打包js
```

`webpack.config.js`配置文件(开发环境 + 生产环境)具体内容，但用于实际项目中建议分开两个文件，配置更加清楚：

```js
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin') // 复制静态资源的插件
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空打包目录的插件
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成html的插件
const ExtractTextWebapckPlugin = require('extract-text-webpack-plugin') //CSS文件单独提取出来
const webpack = require('webpack')

const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const ModuleConcatenationPlugin = require('webpack/lib/optimize/ModuleConcatenationPlugin');

module.exports = {
    entry: {
        index: path.resolve(__dirname, 'src', 'index.js'),
        page: path.resolve(__dirname, 'src', 'page.js')
    },
    output:{
        publicPath: '/', //这里要放的是静态资源CDN的地址
        path: path.resolve(__dirname,'dist'),
        filename:'[name].[hash].js'
    },
    resolve:{
        extensions: [".js",".css",".json"],
        alias: {} //配置别名可以加快webpack查找模块的速度
    },
    module: {
        // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
        rules:[
            {
                test: /\.css$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader'] // 不再需要style-loader放到html文件内
                }),
                include: path.join(__dirname, 'src'), //限制范围，提高打包速度
                exclude: /node_modules/
            },
            {
                test:/\.less$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use: ['css-loader', 'postcss-loader', 'less-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test:/\.scss$/,
                use: ExtractTextWebapckPlugin.extract({
                    fallback: 'style-loader',
                    use:['css-loader', 'postcss-loader', 'sass-loader']
                }),
                include: path.join(__dirname, 'src'),
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                use: {
                    loader: 'happypack/loader?id=happy-babel-js',
                    include: [resolve('src')],
                    exclude: /node_modules/,
                }
            },
            { //file-loader 解决css等文件中引入图片路径的问题
            // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
                test: /\.(png|jpg|jpeg|gif|svg)/,
                use: {
                  loader: 'url-loader',
                  options: {
                    outputPath: 'images/', // 图片输出的路径
                    limit: 1 * 1024
                  }
                }
            }
        ]
    },
    optimization: { //webpack4.x的最新优化配置项，用于提取公共代码
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: "initial",
                    name: "common",
                    minChunks: 2,
                    maxInitialRequests: 5, // The default limit is too small to showcase the effect
                    minSize: 0 // This is example is too small to create commons chunks
                }
            }
        }
    },
    plugins: [
        // 多入口的html文件用chunks这个参数来区分
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'src','index.html'),
            filename:'index.html',
            chunks:['index', 'common'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,'src','page.html'),
            filename:'page.html',
            chunks:['page', 'common'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new ExtractTextWebapckPlugin('css/[name].[hash].css'),
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, 'static'),
                to: path.resolve(__dirname, 'dist/static'),
                ignore: ['.*']
            }
        ]),
        new CleanWebpackPlugin([path.join(__dirname, 'dist')]),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'src/*.html'))
        }),
        new WebpackParallelUglifyPlugin({
            uglifyJS: {
                output: {
                    beautify: false, //不需要格式化
                    comments: false //不保留注释
                },
                compress: {
                    warnings: false, // 在UglifyJs删除没有用到的代码时不输出警告
                    drop_console: true, // 删除所有的 `console` 语句，可以兼容ie浏览器
                    collapse_vars: true, // 内嵌定义了但是只用到一次的变量
                    reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
                }
            }
        }),
        new HappyPack({ //开启多线程打包
            id: 'happy-babel-js',
            loaders: ['babel-loader?cacheDirectory=true'],
            threadPool: happyThreadPool
        }),
        new webpack.DllReferencePlugin({
            manifest: require(path.join(__dirname, 'dist', 'manifest.json')),
        }),
        new ModuleConcatenationPlugin(), //开启作用域提升
        new webpack.HotModuleReplacementPlugin(), //HMR
        new webpack.NamedModulesPlugin(), // HMR
    ]
    devtool: 'eval-source-map', // 指定加source-map的方式
    devServer: {
        inline:true,//打包后加入一个websocket客户端
        hot:true,//热加载
        contentBase: path.join(__dirname, "dist"), //静态文件根目录
        port: 3824, // 端口
        host: 'localhost',
        overlay: true,
        compress: false // 服务器返回浏览器的时候是否启动gzip压缩
    },
    watch: true, // 开启监听文件更改，自动刷新
    watchOptions: {
        ignored: /node_modules/, //忽略不用监听变更的目录
        aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
        poll:1000 //每秒询问的文件变更的次数
    },
}
```

`webpack.dll.config.js`配置文件具体内容：

```js
const path = require('path')
const webpack = require('webpack')
/**
 * 尽量减小搜索范围
 * target: '_dll_[name]' 指定导出变量名字
 */
module.exports = {
    entry: {
        vendor: ['jquery', 'lodash']
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].dll.js',
        library: '_dll_[name]' // 全局变量名，其他模块会从此变量上获取里面模块
    },
    // manifest是描述文件
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: path.join(__dirname, 'dist', 'manifest.json')
        })
    ]
}
```

接下来就可以运行`npm run build:dll && npm run dev`，看一下进阶配置后的成果啦，吼吼。