import $ from 'jquery'
import YAML from 'js-yaml'
global.jQuery = $

console.log('YAML', YAML)

function _yamlToCSV(text) {
  let wat = YAML.safeLoad(text)

  console.log('wat', wat)

  return "f00"
}

$(document).ready((event) => { 
  console.log('hellö')

  let inε   = CodeMirror.fromTextArea(document.getElementById('code-yaml'), {
                lineNumbers: true,
                mode: "text/x-yaml",
                gutters: ["CodeMirror-lint-markers"],
                lint: true,
                electricChars: false,
                viewportMargin: Infinity }),

      outε  = CodeMirror.fromTextArea(document.getElementById('code-csv'), {
                  lineNumbers: true,
                  mode: "text/x-yaml",
                  readOnly: true,
                  // viewportMargin: Infinity 
                })

  // initialize the accordions      
  $('.ui.accordion').accordion()


  $('#convert-button').click(() => {
    let yaml = inε.getValue(),
        csv  = _yamlToCSV(yaml)
  })

  })
