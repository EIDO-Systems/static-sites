/* 
	EIDOS_S3Document 
	Version: 1.0
	Description: Fetch EIDO document and resolve or embed images from S3 bucket
	Exceptions: Unhandled exceptions sent by eidodoc:exception event
	Constants: Update below constants to match intended environment
	Available Methods (event driven):
		eidodoc:fetch 				-- fetch given doc: { document:<document id>, territory:<name of territory>, element:<dom element by id for result> }
		eidodoc:listterritories		-- list territories for given bucket 
		eidodoc:listdocs			-- list documents for given territory { territory:<name of territory>, callback:<anonymous function to call when completed> }

	Sample Use:
		request = {}
		request.document = 'A02';							// requested document
		request.territory = 'UK';							// requested territory
		request.element = 'result';						 	// ID of dom element to load document

		// Invoke Fetch
		$(document).trigger('eidodoc:fetch', request);   	// jquery
		document.fire('eidodoc:fetch', request);			// prototype js


		*/

		var eidos3doc_constants 					= {};	
		eidos3doc_constants.IMAGE_COLLECTION 		= 'Lites/images';
		eidos3doc_constants.BUCKET 					= 'inform-prod-lites';
		eidos3doc_constants.LIST_FORMAT 			= 'Lites/#TERRITORY#/';
		eidos3doc_constants.COLLECTION_FORMAT 		= 'Lites/#TERRITORY#/#DOCUMENT#/';
		eidos3doc_constants.DOCUMENT_FORMAT			= '#DOCUMENT#.xml';
		eidos3doc_constants.REGION_ENDPOINT 		= 'eu-west-1';

		(function eidoS3doc(lang) {

			var _element;
			var _content;

			var $ = window.$ || {};

			function Setup() {
				try
				{
					if(window.AWS == null)
						throw 'aws-sdk javascript missing';

					if(lang === 'jquery') {
						if(!window.jQuery) throw 'jQuery expected';
						$ = window.jQuery;
						$.l = 'jquery';
						return true;
					}

					if(lang === 'prototype') {
						if(!window.Prototype) throw 'Prototype expected';
						$.l = 'prototype';
						return true;
					}

					if(window.jQuery) {
						$ = window.jQuery;
						$.l = 'jquery';
						return true;
					}

					if(window.Prototype) {
						$.l = 'prototype';
						return true;
					}

			// pure javascript
			$ = {};
			$.l = 'javascript';

		} catch(exception) 
		{
			TriggerError('Unhandled Exception in Setup()', exception);
		}	
	}

	function AwsS3() {
		var request = {};
		request.region = eidos3doc_constants.REGION_ENDPOINT;
		request.maxRetries = 1;

		return new AWS.S3(request);
	}

	function FormVal(elm) {
		var identity = elm.replace(/^#/g, '');		// clean up leading #
		switch($.l) {
			case 'prototype':
			return $F(identity);
			break;
			case 'jquery':
			return $('#' + identity).val();
			break;
			case 'javascript':
				// TODO
				break;
			}
		}

		function AttributeVal(attribute, elm) {
			switch($.l) {
				case 'prototype':
				return $(elm).readAttribute(attribute);
				break;
				case 'jquery':
				return $(elm).attr(attribute);
				break;
				case 'javascript':
				// TODO
				break;
			}
		}

		function Update(elm, value) {
			var identity = elm.replace(/^#/g, '');		// clean up leading #
			switch($.l) {
				case 'prototype':
					$(identity).update(value);
				break;
				case 'jquery':
					$('#' + identity).html(value);
				break;
				case 'javascript':
					// TODO
				break;
			}
		}

		function InsertAfter(elm, value) {
			switch($.l) {
				case 'prototype':
					$(elm).insert({after: value});
				break;
				case 'jquery':
					$(value).insertAfter($(elm));
				break;
				case 'javascript':
				// TODO
				break;
			}
		}

		function Remove(elm) {
			switch($.l) {
				case 'prototype':
				case 'jquery':
				$(elm).remove();
				break;
				case 'javascript':
				// TODO
				break;
			}		
		}

		function parseXML(data) {

			switch($.l) {
				case 'prototype':
				// TODO
				break;
				case 'jquery':
				return $.parseXML(data);
				break;
				case 'javascript':
				// TODO
				break;
			}

		}

		function ParseHTML(data) {

			switch($.l) {
				case 'prototype':
				return data;
				break;
				case 'jquery':
				return $.parseHTML(data);
				break;
				case 'javascript':
				// TODO
				break;
			}

		}

		function EndsWith(value, token) {
			var regex = new RegExp(token.toString() + '$');
			if (regex.test(value))
				return value;
			else
				return value.toString() + token;
		}

		function GetTerritories(event, request) {
			function makeArray(list) {
				var a = [];
				switch($.l) {
					case 'prototype':
						a = list.collect(function(l) {
							return l['Prefix'].split('/')[1];
						});
					break;
					case 'jquery':
						jQuery.each(list, function(idx, l) {
							a.push(l['Prefix'].split('/')[1]);
						});
					break;
				}

				return a;
			};
		try 
		{
			if(!request && event.memo) 
				request = event.memo;

			var bucketRequest = {};
		    bucketRequest.Bucket = eidos3doc_constants.BUCKET; 						// FormVal('bucket');
		    bucketRequest.Prefix = 'Lites/';
		    bucketRequest.Delimiter = '/';
		    bucketRequest.MaxKeys = 500;
		    var s3 = AwsS3();
		    s3.makeUnauthenticatedRequest('listObjectsV2', bucketRequest, function (err, terr)
		    {
		    	if (err) {
		    		TriggerError('Exception in GetTerritoriest AwsS3.makeUnauthenticatedRequest', err);
		    		return;
		    	}
		    	if(request && request.callback) {
		    		request.callback(makeArray(terr.CommonPrefixes));
		    	} else {
		    		Log(makeArray(terr.CommonPrefixes));
		    	}
		    });
		} 
		catch(exception) 
		{
			TriggerError('Unhandled Exception in GetItDirect()', exception);	
		}
	}
	function GetDocumentlist(event, request) {
		try 
		{
			function makeArray(list) {
				var a = [];
				switch($.l) {
					case 'prototype':
						a = list.collect(function(l) {
							return l['Prefix'].split('/')[2];
						});
					break;
					case 'jquery':
						jQuery.each(list, function(idx, l) {
							a.push(l['Prefix'].split('/')[2]);
						});
					break;
				}
				return a;
			};

			if(!request && event.memo) 
				request = event.memo;

			var bucketRequest = {};
		    bucketRequest.Bucket = eidos3doc_constants.BUCKET; 						// FormVal('bucket');
		    bucketRequest.Prefix = eidos3doc_constants.LIST_FORMAT.replace('#TERRITORY#', request.territory);
		    bucketRequest.Delimiter = '/';
		    bucketRequest.MaxKeys = 500;
		    var s3 = AwsS3();
		    s3.makeUnauthenticatedRequest('listObjectsV2', bucketRequest, function (err, terr)
		    {
		    	if (err) {
		    		TriggerError('Exception in GetDocumentlist [AwsS3.makeUnauthenticatedRequest]', err);
		    		return;
		    	}

		    	if(request && request.callback) {
		    		request.callback(makeArray(terr.CommonPrefixes));
		    	} else {
		    		Log(makeArray(terr.CommonPrefixes));
		    	}
		    });
		} 
		catch(exception) 
		{
			TriggerError('Unhandled Exception in GetDocumentlist()', exception);	
		}
	}
    function GetIndex(event, request) {
		try 
		{
			request = request || event.memo;		// 

			var collection = eidos3doc_constants.LIST_FORMAT.replace('#TERRITORY#', request.territory);
			var document = 'index.xml';
			var bucketRequest = {};
		    bucketRequest.Bucket = eidos3doc_constants.BUCKET; 						// FormVal('bucket');
		    bucketRequest.Key = collection + document				// FormVal('collection') + FormVal('filename');

		    var s3 = AwsS3();
		    s3.makeUnauthenticatedRequest('getObject', bucketRequest, function (err, data)
		    {
		    	if (err) {
		    		TriggerError('Exception in GetImageDirect AwsS3.makeUnauthenticatedRequest', err);
		    		return;
		    	}
		    	request.callback(data.Body.toString());
		        });
		} 
		catch(exception) 
		{
			TriggerError('Unhandled Exception in GetIndex()', exception);	
		}

    }
	function GetItDirect(event, request) {
		try 
		{
			request = request || event.memo;		// 

			var collection = eidos3doc_constants.COLLECTION_FORMAT.replace('#TERRITORY#', request.territory);
			var document = eidos3doc_constants.DOCUMENT_FORMAT.replace('#DOCUMENT#', request.document);
			collection = collection.replace('#DOCUMENT#', request.document);
			var bucketRequest = {};
		    bucketRequest.Bucket = eidos3doc_constants.BUCKET; 						// FormVal('bucket');
		    bucketRequest.Key = collection + document				// FormVal('collection') + FormVal('filename');
		    _element = request.element;

		    var s3 = AwsS3();
		    s3.makeUnauthenticatedRequest('getObject', bucketRequest, function (err, data)
		    {
		    	if (err) {
		    		TriggerError('Exception in GetImageDirect AwsS3.makeUnauthenticatedRequest', err);
		    		return;
		    	}

		    	var content = data.Body.toString();
		        content = content.replace(/(<img.*)(src[ ]?=[ ]?)(.*)/g, "$1_src=$3");		// replace src to _src to avoid 404 errors
		        _content = ParseHTML(content);

		        Update(_element, _content);

		        switch($.l) {
		        	case 'prototype':
		        	$$('img').each(function(image) {
		        		GetImageDirect($(image), eidos3doc_constants.BUCKET);
		        	});
		        	break;
		        	case 'jquery':
		        	$(_content).find('img').each(function(idx, image){
		        		GetImageDirect($(image), eidos3doc_constants.BUCKET);
		        	});
		        	break;
		        	case 'javascript':
		        		// TODO
		        		break;
		        	}
		        });
		} 
		catch(exception) 
		{
			TriggerError('Unhandled Exception in GetItDirect()', exception);	
		}
	}
	function GetPDFLink(event, request) {
		try 
		{
			request = request || event.memo;		// 
			var collection = eidos3doc_constants.COLLECTION_FORMAT.replace('#TERRITORY#', request.territory);
			collection = collection.replace('#DOCUMENT#', request.document);
            var linkhref = "https://" + eidos3doc_constants.BUCKET + ".s3-" + eidos3doc_constants.REGION_ENDPOINT + ".amazonaws.com/" + collection + request.document + ".pdf";
            Update(request.element, '<a href ="' + linkhref + '" target="_blank">'+ request.linkobj + '</a>');
		} 
		catch(exception) 
		{
			TriggerError('Unhandled Exception in GetItDirect()', exception);	
		}
	}
	function GetImageDirect(image, bucket) {
		try {
			var result;
			var bucketRequest = {};
			bucketRequest.Bucket = bucket;
			var src;
            var source = AttributeVal('_src', image).split('?')[0];
		    var match = source.match(/[a-zA-Z0-9_-]*.[a-zA-Z]{3}$/);		// get trailing filename from full path
		    bucketRequest.Key = EndsWith(eidos3doc_constants.IMAGE_COLLECTION, '/') + match[0];

		    var s3 = AwsS3();    
		    s3.makeUnauthenticatedRequest('getObject', bucketRequest, function (err, data) {
		    	if (err) {
		    		TriggerError('AwsS3.makeUnauthenticatedRequest in GetImageDirect()', err);
		    		return;
		    	}

		        InsertAfter($(image), data.Body.toString());	      
		        Remove($(image));
		    });
		} catch(exception) {
			TriggerError('Unhandled Exception in GetImageDirect()', exception)
		} 
	}

	function Log() {
		if(window.console && window.console.log)
			console.log(arguments);
	}

	function TriggerError(name, data) {
		Log(name, data);

		if(!$)
			return;

		// Setup listener
		switch($.l) {
			case 'prototype':
			document.fire('eidodoc:exception',  {Name: name, Exception: data});
			break;
			case 'jquery':
			$(document).trigger('eidodoc:exception', {Name: name, Exception: data});
			break;
			case 'javascript':
				// TODO
				break;
			}
		}

		if(Setup()) {
			switch($.l) {
				case 'prototype':
				document.observe('eidodoc:fetch', GetItDirect);
                document.observe('eidodoc:linkpdf', GetPDFLink);
				document.observe('eidodoc:listterritories', GetTerritories);
				document.observe('eidodoc:listdocs', GetDocumentlist);
				document.observe('eidodoc:index', GetIndex);
				break;
				case 'jquery':
				$(document).on('eidodoc:fetch', GetItDirect);
                $(document).on('eidodoc:linkpdf', GetPDFLink);
				$(document).on('eidodoc:listterritories', GetTerritories);
				$(document).on('eidodoc:listdocs', GetDocumentlist);
                $(document).on('eidodoc:index', GetIndex);
				break;
				case 'javascript':
				// TODO
				break;
			}
		}
	})();