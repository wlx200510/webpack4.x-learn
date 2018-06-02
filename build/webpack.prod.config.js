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
        publicPath: './' //这里要放的是静态资源CDN的地址(一般只在生产环境下配置)
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'index.html'),
            filename:'index.html',
            chunks:['index', 'common'],
            vendor: './vendor.dll.js',
            hash:true,//防止缓存
            minify:{
                removeAttributeQuotes:true//压缩 去掉引号
            }
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '..', 'src', 'page.html'),
            filename:'page.html',
            chunks:['page', 'common'],
            vendor: './vendor.dll.js',
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
            exclude: ['manifest.json', 'vendor.dll.js'],
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
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, '..', 'dist', 'manifest.json')
        }),
    ]
})
