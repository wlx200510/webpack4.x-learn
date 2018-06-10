![](./static/webpack.png)

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
        new ExtractTextWebapckPlugin('css/[name].[hash].css'), // 其实这个特性只用于打包生产环境，测试环境这样设置会影响HMR
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
2. 新的公共代码抽取工具(`optimization.SplitChunksPlugin`)提取重用代码，减小打包文件。（代替`commonchunkplugin`，生产和开发环境都需要）
3. 使用`HappyPack`进行`javascript`的多进程打包操作，提升打包速度，并增加打包时间显示。(生产和开发环境都需要)
4. 创建一个`webpack.dll.config.js`文件打包常用类库到dll中，使得开发过程中基础模块不会重复打包，而是去动态连接库里获取，代替上一节使用的`vendor`。(注意这个是在开发环境使用，生产环境打包对时间要求并不高，后者往往是项目持续集成的一部分)
5. 模块热替换，还需要在项目中增加一些配置，不过大型框架把这块都封装好了。(开发环境配置)
6. `webpack3`新增的作用域提升会默认在`production`模式下启用，不用特别配置，但只有在使用ES6模块才能生效。

关于第四点，需要在package.json中的script中增加脚本:
`"build:dll": "webpack --config webpack.dll.config.js --mode development",`

补充安装插件的命令行：

```bash
npm i purify-css purifycss-webpack -D // 用于css的tree-shaking
npm i webpack-parallel-uglify-plugin -D // 用于js的tree-shaking
npm i happypack@next -D //用于多进程打包js
npm i progress-bar-webpack-plugin -D //用于显示打包时间和进程
npm i webpack-merge -D //优化配置代码的工具
npm i optimize-css-assets-webpack-plugin -D //压缩CSS
npm i chalk -D
npm install css-hot-loader -D // css热更新
npm i mini-css-extract-plugin -D
npm i cross-env -D
```

`TreeShaking`需要增加的配置代码，这一块参考[`webpack`文档](https://webpack.js.org/guides/tree-shaking/)，需要三方面因素，分别是:

- 使用`ES6`模块(`import/export`)
- 在`package.json`文件中声明`sideEffects`指定可以`treeShaking`的模块
- 启用`UglifyJSPlugin`，多入口下用`WebpackParallelUglifyPlugin`(这是下面的配置代码做的事情)

```javascript
/*最上面要增加的声明变量*/
const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')

/*在`plugins`配置项中需要增加的两个插件设置*/
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
    // 有兴趣可以探究一下使用uglifyES
}),
```

关于`ES6`模块这个事情，上文的第六点也提到了只有`ES6`模块写法才能用上最新的作用域提升的特性，首先`webpack4.x`并不需要额外修改`babelrc`的配置来实现去除无用代码，这是从`webpack2.x`升级后支持的，改用`sideEffect`声明来实现。但作用域提升仍然需要把`babel`配置中的`module`转换去掉，修改后的`.babelrc`代码如下：

```json
{
  "presets": [["env", {"loose": true, "modules": false}], "stage-0"]
}
```

但这个时候会发现`import`引入样式文件就被去掉了……只能使用`require`来改写了。

打包`DLL`第三方类库的配置项，用于开发环境：

1. `webpack.dll.config.js`配置文件具体内容：

```js
const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json')
/**
 * 尽量减小搜索范围
 * target: '_dll_[name]' 指定导出变量名字
 */
module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        vendor: Object.keys(pkg.dependencies)
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
            path: path.join(__dirname, 'dist', 'manifest.json'),
            context: path.resolve(__dirname, '../')
        })
    ]
}
```

2. 在`webpack.config.js`中增加的配置项：

```javascript
/*找到上一步生成的`manifest.json`文件配置到`plugins`里面*/
new webpack.DllReferencePlugin({
    manifest: require(path.join(__dirname, '..', 'dist', 'manifest.json')),
}),
```

多文件入口的公用代码提取插件配置：

```javascript
/*webpack4.x的最新优化配置项，用于提取公共代码，跟`entry`是同一层级*/
optimization: {
    splitChunks: {
        cacheGroups: {
            commons: {
                chunks: "initial",
                name: "common",
                minChunks: 2,
                maxInitialRequests: 5,
                minSize: 0
            }
        }
    }
}

/*针对生成HTML的插件，需增加common，也去掉上一节加的vendor*/
new HtmlWebpackPlugin({
    template: path.resolve(__dirname,'src','index.html'),
    filename:'index.html',
    chunks:['index', 'common'],
    vendor: './vendor.dll.js', //与dll配置文件中output.fileName对齐
    hash:true,//防止缓存
    minify:{
        removeAttributeQuotes:true//压缩 去掉引号
    }
}),
new HtmlWebpackPlugin({
    template: path.resolve(__dirname,'src','page.html'),
    filename:'page.html',
    chunks:['page', 'common'],
    vendor: './vendor.dll.js', //与dll配置文件中output.fileName对齐
    hash:true,//防止缓存
    minify:{
        removeAttributeQuotes:true//压缩 去掉引号
    }
}),
```

PS: 这一块要多注意，对应入口的`HTML`文件也要处理，关键是自定义的`vendor`项，在开发环境中引入到`html`中

`HappyPack`的多进程打包处理：

```javascript
/*最上面要增加的声明变量*/
const HappyPack = require('happypack')
const os = require('os') //获取电脑的处理器有几个核心，作为配置传入
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

/*在`module.rules`配置项中需要更改的`loader`设置*/
{
    test: /\.jsx?$/,
    loader: 'happypack/loader?id=happy-babel-js',
    include: [path.resolve('src')],
    exclude: /node_modules/,
},

/*在`plugins`配置项中需要增加的插件设置*/
new HappyPack({ //开启多线程打包
    id: 'happy-babel-js',
    loaders: ['babel-loader?cacheDirectory=true'],
    threadPool: happyThreadPool
}),
new ProgressBarPlugin({
    format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
})
```

PS:要记住这种使用方法下一定要在根目录下加`.babelrc`文件来设置`babel`的打包配置。

开发环境的代码热更新：
其实针对热刷新，还有两个方面要提及，一个是html文件里面写代码的热跟新(这个对于框架不需要，如果要实现，建议使用`glup`,后面有代码)，一个是写的样式代码的热更新，这两部分也要加进去。让我们一起看看热更新需要增加的配置代码：

```javascript
/*在`devServer`配置项中需增加的设置*/
hot:true

/*在`plugins`配置项中需要增加的插件设置*/
new webpack.HotModuleReplacementPlugin(), //模块热更新
new webpack.NamedModulesPlugin(), //模块热更新
```

在业务代码中要做一些改动，一个比较`low`的例子为：

```javascript
if(module.hot) { //设置消息监听，重新执行函数
    module.hot.accept('./hello.js', function() {
        div.innerHTML = hello()
    })
}
```

但还是不能实现在`html`修改后自动刷新页面，这里有个概念是热更新不是针对页面级别的修改，这个问题有一些解决方法，但目前都不是很完美，可以参考[这里](https://stackoverflow.com/questions/33183931/how-to-watch-index-html-using-webpack-dev-server-and-html-webpack-plugin)，现在针对CSS的热重载有一套解决方案如下，需要放弃使用上文提到的`ExtractTextWebapckPlugin`，引入`mini-css-extract-plugin`和`hot-css-loader`来实现，前者在webpack4.x上与`hot-css-loader`有报错，让我们改造一番：

```javascript
/*最上面要增加的声明变量*/
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

/*在样式的`loader`配置项中需增加的设置，实现css热更新，以css为例，其他可以参照我的仓库来写*/
{
    test: /\.css$/,
    use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
    include: [resolve('src')], //限制范围，提高打包速度
    exclude: /node_modules/
}

/*在`plugins`配置项中需要增加的插件设置，注意这里不能写[hash]，否则无法实现热跟新，如果有hash需要，可以开发环境和生产环境分开配置*/
new MiniCssExtractPlugin({
    filename: "[name].css",
    chunkFilename: "[id].css"
})
```

用于生产环境压缩`css`的插件，看官方文档说明，样式文件压缩没有内置的，所以暂时引用第三方插件来做，以下是配置示例。

```js
/*要增加的声明变量*/
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

/*在`plugins`配置项中需要增加的插件设置*/
new OptimizeCSSPlugin({
    cssProcessorOptions: {safe: true}
})
```

### 最终成果

　　在进阶部分我们对`webpack`配置文件根据开发环境和生产环境的不同做了分别的配置，因此有必要分成两个文件，然后发现重复的配置代码很多，作为有代码洁癖的人不能忍，果断引入`webpack-merge`，来把相同的配置抽出来，放到`build/webpack.base.js`中，而后在`build/webpack.dev.config.js`(开发环境)和`build/webpack.prod.config.js`(生产环境)中分别引用，在这个过程中也要更改之前文件的路径设置，以免打包或者找文件的路径出错，同时将`package.json`中的脚本命令修改为:

```json
"scripts": {
    "build": "cross-env NODE_ENV='production' webpack --config build/webpack.prod.config.js --mode production",
    "dev": "cross-env NODE_ENV='development' webpack-dev-server --open --config build/webpack.dev.config.js --mode development",
    "dll": "webpack --config build/webpack.dll.config.js --mode production",
    "start": "npm run dll && npm run dev",
    "prod": "npm run dll && npm run build"
}
```

接下来就是代码的重构过程，这个过程其实我建议大家自己动手做一做，就能对`webpack`配置文件结构更加清晰。

`build`文件夹下的`webpack.base.js`文件：

```js
'use strict'
const path = require('path');
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HappyPack = require('happypack')
const os = require('os')
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function assetsPath(_path_) {
  let assetsSubDirectory;
  if (process.env.NODE_ENV === 'production') { // 这里需要用cross-env来注入Node变量
    assetsSubDirectory = 'static' //可根据实际情况修改
  } else {
    assetsSubDirectory = 'static'
  }
  return path.posix.join(assetsSubDirectory, _path_)
}

module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: {
    index: './src/index.js',
    page: './src/page.js'
  },
  output:{
    path: resolve('dist'),
    filename:'[name].[hash].js'
  },
  resolve: {
    extensions: [".js",".css",".json"],
    alias: {} //配置别名可以加快webpack查找模块的速度
  },
  module: {
    // 多个loader是有顺序要求的，从右往左写，因为转换的时候是从右往左转换的
    rules:[
      {
        test: /\.css$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
        include: [resolve('src')], //限制范围，提高打包速度
        exclude: /node_modules/
      },
      {
        test:/\.less$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'less-loader'],
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
        test:/\.scss$/,
        use: ['css-hot-loader', MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
          test: /\.jsx?$/,
          loader: 'happypack/loader?id=happy-babel-js',
          include: [resolve('src')],
          exclude: /node_modules/,
      },
      { //file-loader 解决css等文件中引入图片路径的问题
      // url-loader 当图片较小的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
        test: /\.(png|jpg|jpeg|gif|svg)/,
        use: {
          loader: 'url-loader',
          options: {
            name: assetsPath('images/[name].[hash:7].[ext]'), // 图片输出的路径
            limit: 1 * 1024
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: assetsPath('fonts/[name].[hash:7].[ext]')
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
    new HappyPack({
      id: 'happy-babel-js',
      loaders: ['babel-loader?cacheDirectory=true'],
      threadPool: happyThreadPool
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css"
    }),
    new ProgressBarPlugin({
      format: '  build [:bar] ' + chalk.green.bold(':percent') + ' (:elapsed seconds)'
    }),
  ]
}
```

`webpack.dev.config.js`文件内容：

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成html的插件
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
const merge = require('webpack-merge')

const devWebpackConfig = merge(baseConfig, {
  output:{
    publicPath: '/'
  },
  devtool: 'eval-source-map', // 指定加source-map的方式
  devServer: {
    inline:true,//打包后加入一个websocket客户端
    hot:true,//热加载
    contentBase: path.join(__dirname, "..", "dist"), //静态文件根目录
    port: 3824, // 端口
    host: 'localhost',
    overlay: true,
    compress: false // 服务器返回浏览器的时候是否启动gzip压缩
  },
  watchOptions: {
      ignored: /node_modules/, //忽略不用监听变更的目录
      aggregateTimeout: 500, //防止重复保存频繁重新编译,500毫米内重复保存不打包
      poll:1000 //每秒询问的文件变更的次数
  },
  plugins: [
    // 多入口的html文件用chunks这个参数来区分
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', 'src','index.html'),
      filename:'index.html',
      chunks:['index', 'common'],
      vendor: './vendor.dll.js', //与dll配置文件中output.fileName对齐
      hash:true,//防止缓存
      minify:{
          removeAttributeQuotes:true//压缩 去掉引号
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '..', 'src','page.html'),
      filename:'page.html',
      chunks:['page', 'common'],
      vendor: './vendor.dll.js', //与dll配置文件中output.fileName对齐
      hash:true,//防止缓存
      minify:{
          removeAttributeQuotes:true//压缩 去掉引号
      }
    }),
    new webpack.DllReferencePlugin({
      manifest: path.resolve(__dirname, '..', 'dist', 'manifest.json')
    }),
    new webpack.HotModuleReplacementPlugin(), //HMR
    new webpack.NamedModulesPlugin() // HMR
  ]
})

module.exports = devWebpackConfig
```

`webpack.dev.config.js`文件内容：

```javascript
'use strict'
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin') // 复制静态资源的插件
const CleanWebpackPlugin = require('clean-webpack-plugin') // 清空打包目录的插件
const HtmlWebpackPlugin = require('html-webpack-plugin') // 生成html的插件
const webpack = require('webpack')
const baseConfig = require('./webpack.base')
const merge = require('webpack-merge')

const glob = require('glob')
const PurifyCSSPlugin = require('purifycss-webpack')
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = merge(baseConfig, {
    output:{
        publicPath: './' //这里要放的是静态资源CDN的地址(只在生产环境下配置)
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'index.html'),
            filename:'index.html',
            chunks:['index', 'common'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'page.html'),
            filename:'page.html',
            chunks:['page', 'common'],
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new CopyWebpackPlugin([
            {
                from: path.join(__dirname, '..', 'static'),
                to: path.join(__dirname,  '..', 'dist', 'static'),
                ignore: ['.*']
            }
        ]),
        new CleanWebpackPlugin(['dist'], {
            root: path.join(__dirname, '..'),
            verbose: true,
            dry:  false
        }),
        new OptimizeCSSPlugin({
            cssProcessorOptions: {safe: true}
        }),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, '../src/*.html'))
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
    ]
})
```

多说一句，就是实现JS打包的`treeShaking`还有一种方法是编译期分析依赖，利用uglifyjs来完成，这种情况需要保留ES6模块才能实现，因此在使用这一特性的仓库中，`.babelrc`文件的配置为:`"presets": [["env", { "modules": false }], "stage-0"]`，就是打包的时候不要转换模块引入方式的含义。

接下来就可以运行`npm start`，看一下进阶配置后的成果啦，吼吼，之后只要不进行`build`打包操作，通过`npm run dev`启动，不用重复打包`vendor`啦。生产环境打包使用的是`npm run build`。

以上就是对`webpack4.x`配置的踩坑过程，期间参考了大量谷歌英文资料，希望能帮助大家更好地掌握`wepback`最新版本的配置，以上内容亲测跑通，有问题的话，欢迎加我微信(kashao3824)讨论，到[`github`地址](https://github.com/wlx200510/webpack4.x-learn)提`issue`也可，欢迎`fork/star`。

最新更改：

- 修复了`common`会重复打包已有`dll`库的问题
- 现在的`dll`库会自动根据`package.json`中的配置项生成
- `dll`现在是生产环境打包模式，并且`vendor.dll.js`现在在生产环境下也会注入`HTML`模板中
- 生产环境打包使用命令`npm run prod`
- 修复了`process.env.NODE_ENV`在打包过程中取不到的问题 [issue2](https://github.com/wlx200510/webpack4.x-learn/issues/2)