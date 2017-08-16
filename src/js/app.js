import $ from 'jquery'
import YAML from 'js-yaml'
import json2csv from 'json2csv'
import Dropzone from 'dropzone'
import Clipboard from 'clipboard'
import download from 'downloadjs'

global.jQuery = $


Dropzone.autoDiscover = false
let delimiters = [',', ';']

// recursively flatten a given JSON structure
function _unravel(json, name) {
  name    = name || ''
  return _.reduce(json, (ρ, δ, η) => {
    let id = name + '/' + η
    if(_.isString(δ)) {
      ρ.push({id:           id,
              text:         δ,
              translation:  ''}) }
    if(_.isObject(δ)) {
      let flat = _unravel(δ, id)
      ρ.push(flat)
    }

    return ρ
  }, [])
}

function _yamlToCSV(text) {
  let json        = YAML.safeLoad(text),
      unravelled  = _unravel(json),
      flat        = _.flattenDeep(unravelled),
      fields      = ['id', 'text', 'translation'],
      // delimiter   = delimiters[$('input[name=seperator]').attr('value')]
      delimiter   = ','

  try {
    return json2csv({ data:   flat, 
                      fields: fields,
                      del:    delimiter})
  } catch (err) {
    // Errors are thrown for bad options, or if the data is empty and no fields are provided.
    // Be sure to provide fields if it is possible that your data array will be empty.
    console.error(err);
    return null
  }
}

function _resetDropzone(dropzone) {
  let content = [ '<form action="/upload" class="dropzone needsclick dz-clickable" id="fake-upload">',
                    '<div class="dz-message needsclick">',
                      'Drop a YAML file to convert it to CSV<br>',
                    '</div>',
                  '</form>'].join('')

  $(dropzone.element).remove()
  $('#dropzone').html(content)
  _dropzone() }

function _uploadError(file, msg) { 
  console.log('error', file, msg)
  $('#error-msg').html(msg)
  
  setTimeout(() => { 
    $('#error-container').fadeIn()
    setTimeout(() => { $('#error-container').fadeOut() }, 2800)
  }, 200)
  
  _resetDropzone(this)
}


function _convert(text) {
  let csv     = _yamlToCSV(text),
      lines   = csv.split(/\n/),
      sorted  = _.sortBy(lines, (l) => { return _.size(l)}),
      longest = _.size(_.last(sorted))

  $('#csv').html(csv)
  $('#csv-copy').html(csv)
  $('#incoming').slideUp('slow')
  $('#result').slideDown('slow')

  // adjust the textare show the whole content
  $('#csv').attr('cols', longest)
  $('#csv').attr('rows', _.size(lines))
}

function _dropzone() {
  var dropzone = new Dropzone('#fake-upload', {
    parallelUploads:  1,
    uploadMultiple:   false,
    maxFiles:         1,
    filesizeBase:     1000,
    acceptedFiles:    '.yaml, .yml',
    previewTemplate:  $('#dropzone-template').html(),

    init: function() {
      // this.on("addedfile", function(file) { console.log("Added file."); });
      this.on('error', _uploadError);
    }

  })

  dropzone.uploadFiles = function(files) {
    let self = this,
        file = _.first(files)

    console.log('uploading files', files)

    var reader = new FileReader()
    reader.onload = () => { _convert(reader.result) }
    reader.readAsText(file)

    // dummy
    _.each(files, (f) => {
      self.emit('success', f, 'success', null)
      self.emit('complete', f)
      self.processQueue()})}
}

$(document).ready((event) => { 
  _dropzone()

  // init the sementic ui widgets
  $('.ui.dropdown').dropdown()
  $('.ui.accordion').accordion()

  // init the buttons
  $('.btn.visibility').click(() => {
    let csv = $('#csv')
    if(!csv.is(":visible")) {
      $('#csv').slideDown()  
      $('.btn.visibility').html('<i class="hide icon"></i> hide') } 
    else {
      $('#csv').slideUp()
      $('.btn.visibility').html('<i class="unhide icon"></i> show')}})

  $('.btn.download').click(() => {
    let δ         = new Date(),
        date      = δ.toLocaleDateString().replace(/\//g, '_'),
        time      = δ.toLocaleTimeString().replace(/:/g, '_'),
        filename  = 'beetwo_' + date + '_' + time + '.csv'
    download($('#csv').html(), filename, 'text/csv')})


  let clippy = new Clipboard('#copy')
  clippy.on('success', function(e) {
    $('.copy.message').fadeIn()  
    
    setTimeout(() => {
      console.log('slide back up')
      $('.copy.message').fadeOut() }, 2000)
    e.clearSelection() })
})
