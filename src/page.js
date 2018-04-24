"use strict"
// import './page.scss'
require('./page.scss')
import $ from 'jquery'
import _ from 'lodash'
window.onload = function() {
    var text = $('#text')
    console.log(text.html)
    text.text = _.upperCase(text.text)
}