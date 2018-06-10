require('./index.scss')
import $ from 'jquery'
import _ from 'lodash'
window.onload = function() {
    console.log(process.env.NODE_ENV)
    var text = document.getElementsByClassName('content-div')
    console.log(text.length)
    console.log(text[0].innerHTML, '1')
    var contentTest = _.repeat('karl ', 2)
    console.log(contentTest)
}