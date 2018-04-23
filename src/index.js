"use strict"
import './index.scss'
import $ from 'jquery'
import _ from 'lodash'
window.onload = function() {
    var text = document.getElementsByClassName('content-div')
    console.log(text.length)
    console.log(text[0].innerHTML)
    var contentTest = _.repeat('karl ', 3)
    console.log(contentTest)
}