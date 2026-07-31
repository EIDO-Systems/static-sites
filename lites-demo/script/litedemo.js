/**
 * path: db/EIDO/data/edit/script/litedemo.js
 * Function to retrieve documents, lite documents, and pdf links to them, with
 * sample code demonstrating how to use them
 */

/**
 * Convenience function that retrieves and draws both the Lites document and
 * a link to the PDF of the same document
 */
function getitdirect () {
  getEIDOLiteDoc($('#territory').val(), $('#filename').val(), 'result')
  getEIDOLitePDFLink($('#territory').val(), $('#filename').val(), 'pdflink', '<span style="padding-right:5px;">Download PDF</span>')
  $('.docviewer').scrollTop(0)
  $('#index div').removeClass('active')
  $('#index div[data-docnum="' + $('#filename').val() + '"]').addClass('active')
}
/**
 * Convenience function that retrieves and draws both the Lites document and
 * a link to the PDF of the same document given a docnum
 * @param  {string} docnum is the EIDO document number (like "A01")
 */
function getitbydocnum (docnum) {
  getEIDOLiteDoc($('#territory').val(), docnum, 'result')
  getEIDOLitePDFLink($('#territory').val(), docnum, 'pdflink', '<span style="padding-right:5px;">Download PDF</span>')
  $('.docviewer').scrollTop(0)
  $('#index div').removeClass('active')
  $('#index div[data-docnum="' + docnum + '"]').addClass('active')
}
/**
 * Main function that retrieves and draws the Lite document
 * @param  {string} territory can be "UK", "AUS", "SA", "Discovery", "CANADA", "USA"
 * @param  {string} docnum is the EIDO document number (like "A01")
 * @param  {string} target is the "id" of an HTML that will receive the content
 */
function getEIDOLiteDoc (territory, docnum, target) {
  request = {}
  request.document = docnum
  request.territory = territory
  request.element = target
  $(document).trigger('eidodoc:fetch', request)
}
/** Main function that creates a link to the Lite PDF document
 * @param  {string} territory can be "UK", "AUS", "SA", "Discovery", "CANADA", "USA"
 * @param  {string} docnum is the EIDO document number (like "A01")
 * @param  {string} target is the "id" of an HTML that will receive the link
 * @param  {string} linkobj is the HTML snippet that will be surrounded by the link
 */
function getEIDOLitePDFLink (territory, docnum, target, linkobj) {
  request = {}
  request.document = docnum
  request.territory = territory
  request.element = target
  request.linkobj = linkobj
  $(document).trigger('eidodoc:linkpdf', request)
}
/**
 * Main function that retrieves a list of documents and their titles to draw
 * any GUI you need
 * @param  {string} territory can be "UK", "AUS", "SA", "Discovery", "CANADA", "USA"
 */
function getIndex (territory) {
  request = {}
  request.territory = territory
  $(document).trigger('eidodoc:index', request)
}
/**
 * This is an event that you can catch for some exception, (like if you passed
 * in docnum of "A9999" which does not exist)
 * @param  {event} event (not used)
 * @param  {object} data exception
 */
$(document).on('eidodoc:exception', function (event, data) {
  alert('Ooops! There was an issue: ' + data.Name + ', possibly the document or territory requested does not exist.')
})
/**
 * This is an example of what one could do
 * It shows two other convenience functions in the code that can be used to get
 * a Territory list and a document number list if needed
 * in this sample, these are called when the document is ready to populate the
 * dropdowns
 */
var territories = []
var docs = []
$(document).ready(function () {
  $(document).trigger('eidodoc:listterritories', {
    callback: List_Territories
  })
  $(document).trigger('eidodoc:index', {
    territory: 'AUS', callback: List_Docnames
  })
  $(document).trigger('eidodoc:listdocs', {
    territory: 'AUS', callback: List_Docs
  })
  $('#index').on('click', function (e) {
    var docnum = $(e.target).attr('data-docnum')
    $('#filename').val(docnum)
    getitbydocnum(docnum)
  })
  var loop = 0
  var intitalload = setInterval(function () {
    loop++
    if ($('#territory option').length > 0 && $('#filename option').length > 10) {
      getitdirect()
      clearInterval(intitalload)
    }
    if (loop > 20) {
      clearInterval(intitalload)
    }
  }, 100)
  $('#filename').on('change', function (e) {
    if ($('#filename').has('focus')) {
      getitdirect()
    }
  })
  $('#territory').on('change', function (e) {
    if ($('#territory').has('focus')) {
      $(document).trigger('eidodoc:index', {
        territory: $('#territory').val(), callback: List_Docnames
      })
      getitdirect()
    }
  })
  /**
     * populates territories drop down with options
	 * @param  {string[]} Territories
	 */
  function List_Territories (Territories) {
    territories = Territories
    $.each(territories, function (index, value) {
      if (value != 'images' && value != 'WALES') {
        $('#territory').append('<option>' + value + '</option>')
      }
    })
  }
  /**
     * populates dpcuments drop down with options
	 * @param  {string[]} Docs
	 */
  function List_Docs (Docs) {
    docs = Docs
    $.each(docs, function (index, value) {
		  $('#filename').append('<option>' + value + '</option>')
    })
  }
  /**
     * populates navigation pane with document links
	 * @param  {string} docIndex xml object
	 */
  function List_Docnames (docIndex) {
    docindex = $.parseXML(docIndex)
    $('#index').html('')
    $(docindex).find('doc').each(function (idx, doc) {
      $('#index').append('<div class="doctitle" data-docnum="' + $(doc).attr('docnum') + '">' + $(doc).attr('title') + '</div>')
    })
    $('#index div[data-docnum="' + $('#filename').val() + '"]').addClass('active')
  }
})
