var gulp = require('gulp');
var spawn = require('child_process').exec;
var livereload = require('gulp-livereload');


gulp.task('server', function(){
    'use strict';
    spawn('webpack-dev-server', ['--open', '--config', 'build/webpack.dev.config.js', '--mode', 'development'])
})

gulp.task('watch', function(){
    livereload.listen();
    gulp.watch('src/*.html', function(){
        gulp.src('src/*.html').pipe(livereload())
    });//监听html变化
})

gulp.task('default', ['server'])