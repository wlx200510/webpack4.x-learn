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