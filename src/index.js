"use strict"
import './index.scss'
window.onload = function() {
    var text = document.getElementsByClassName('content-div')
    console.log(text.length)
    console.log(text[0].innerHTML)
}