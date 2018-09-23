const path = require('path')
const webpack = require('webpack')
const pkg = require('../package.json')

function resolve (dir) {
    return path.join(__dirname, '..', dir)
}

function filterTypes() {
    var tpsReg = /^@types/i
    return Object.keys(pkg.dependencies).filter((item) => {
        return !tpsReg.test(item)
    })
}

module.exports = {
    context: path.resolve(__dirname, '../'),
    entry: {
        vendor: filterTypes()
    },
    output: {
        path: resolve('dist'),
        filename: '[name].dll.js',
        library: '_dll_[name]' // 全局变量名，其他模块会从此变量上获取里面模块
    },
    // manifest是描述文件
    plugins: [
        new webpack.DllPlugin({
            name: '_dll_[name]',
            path: resolve('dist/manifest.json'),
            context: path.resolve(__dirname, '../')
        })
    ]
}