/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/common/constants.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/common/constants', [
], function() {

	/**
	 * Constants used by the PDFWriter
	 *
	 */
	var Constants = function() {
		return {
			PARENT_START_TAG : '<ossuiPagedDocument>',
			PARENT_END_TAG : '</ossuiPagedDocument>',

			HEAD_START_TAG : '<head>',
			HEAD_END_TAG : '</head>',
			HEAD_TITLE_START_TAG : '<title>',
			HEAD_TITLE_END_TAG : '</title>',
			HEAD_PAGE_SIZE_START_TAG : '<pageSize>',
			HEAD_PAGE_SIZE_END_TAG : '</pageSize>',
			HEAD_PAGE_ORIENTATION_START_TAG : '<pageOrientation>',
			HEAD_PAGE_ORIENTATION_END_TAG : '</pageOrientation>',
			HEAD_FONT_SIZE_START_TAG : '<fontSize>',
			HEAD_FONT_SIZE_END_TAG : '</fontSize>',
			HEAD_PAGE_NUMBER_START_TAG	: '<showPageNumber>',
			HEAD_PAGE_NUMBER_END_TAG : '</showPageNumber>',
			HEAD_PAGE_HEADER_START_TAG : '<pageHeader>',
			HEAD_PAGE_HEADER_END_TAG : '</pageHeader>',
			HEAD_PAGE_FOOTER_START_TAG : '<pageFooter>',
			HEAD_PAGE_FOOTER_END_TAG : '</pageFooter>',
			HEAD_AUTHOR_START_TAG : '<documentAuthor>',
			HEAD_AUTHOR_END_TAG : '</documentAuthor>',
			HEAD_CREATOR_START_TAG : '<documentCreator>',
			HEAD_CREATOR_END_TAG : '</documentCreator>',
			HEAD_FILE_FORMAT_START_TAG : '<fileFormat>',
			HEAD_FILE_FORMAT_END_TAG : '</fileFormat>',
			HEAD_FILE_NAME_START_TAG : '<fileName>',
			HEAD_FILE_NAME_END_TAG : '</fileName>',

			BODY_START_TAG : '<body>',
			BODY_END_TAG : '</body>',

			NEW_PAGE_TAG : '<newPage/>',

			SECTION_HEADER_START_TAG : '<section>',
			SECTION_HEADER_END_TAG : '</section>',
			SECTION_SUB_HEADER_START_TAG : '<subSection>',
			SECTION_SUB_HEADER_END_TAG : '</subSection>',

			PARAGRAPH_START_TAG : '<p',
			PARAGRAPH_LEFT_INDENT_ATTRIBUTE_START : ' leftIndent="',
			PARAGRAPH_LEFT_INDENT_ATTRIBUTE_END : '"',
			PARAGRAPH_START_END_TAG : '>',
			PARAGRAPH_END_TAG : '</p>',

			CDATA_START_TAG : '<![CDATA[',
			CDATA_END_TAG : ']]>',

			TABLE_START_TAG : '<table',
			TABLE_WIDTH_PERCENT_ATTRIBUTE_START : ' widthPercentage="',
			TABLE_WIDTH_PERCENT_ATTRIBUTE_END : '"',
			TABLE_START_TAG_END : '>',
			TABLE_END_TAG : '</table>',
			TABLEDATA_START_TAG : '<tableData>',
			TABLEDATA_END_TAG : '</tableData>',
			COLUMN_WIDTHS_START_TAG : '<columnWidths>',
			COLUMN_WIDTHS_END_TAG : '</columnWidths>',
			COLUMN_TYPES_START_TAG : '<columnTypes>',
			COLUMN_TYPES_END_TAG : '</columnTypes>',

			IMAGE_START_TAG : '<image',
			IMAGE_SRC_ATTRIBUTE_START : ' src="',
			IMAGE_SCALE_PERCENT_ATTRIBUTE_START : ' scalePercent="',
			IMAGE_ATTRIBUTE_END : '"',
			IMAGE_END_TAG : ' />',

			BLANKLINE_START_TAG : '<blankLine',
			BLANKLINE_COUNTER_ATTRIBUTE_START : ' count="',
			BLANKLINE_COUNTER_ATTRIBUTE_END : '"',
			BLANKLINE_END_TAG : ' />',

			DEFAULT_TITLE : 'Amdocs OSS',
			DEFAULT_PAGE_SIZE : 'letter',
			DEFAULT_PAGE_ORIENTATION : 'landscape',
			DEFAULT_PAGE_HEADER : new Date(),
			DEFAULT_FONT_SIZE : '10',
			DEFAULT_SHOWPAGE_NUMBER : 'true',
			DEFAULT_AUTHOR : 'Amdocs OSS',
			DEFAULT_CREATOR : 'Amdocs OSS',
			DEFAULT_FILE_NAME : 'amdocs-oss.pdf',
			DEFAULT_FILE_FORMAT : 'PDF',
			DEFAULT_FILE_EXTENSION : '.pdf',
			DEFAULT_NUMBER_OF_BLANKLINES : '1',

			ALLOWED_PAGE_SIZES : [{
				id : 'letter',
				name : 'Letter',
				text : 'Letter'
			},
			{
				id : 'a3',
				name : 'A3',
				text : 'A3'
			},
			{
				id : 'a4',
				name : 'A4',
				text : 'A4'
			}],

			ALLOWED_PAGE_ORIENTATIONS : [{
				id : 'landscape',
				name : 'Landscape',
				text : 'Landscape'
			},
			{
				id : 'portrait',
				name : 'Portrait',
				text : 'Portrait'
			}],

			NEW_LINE : '\n',

			DEFAULT_SEND_REST_URL : 'services/rest/report/pdf'
		};
	};

	return new Constants();
});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/common/utils.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/common/utils', [
], function() {

	/**
	 * General Utilities that are used by the PDFWriter
	 */
	var Utils = function() {

		/**
		 * Function to verify if a given string is a number.
		 * @param value String
		 */
		this.isNumber = function(value) {
			if(typeof value !== 'undefined' || value === '') {
				if(isNaN(value)) {
					return false;
				} else {
					if(parseInt(value, 10) < 1) {
						return false;
					}
					return true;
				}
			}
			return false;
		};

		/**
		 * Utility function to replace all empty quotes in a string with spaces.
		 * This is currently used to parse any CSV data to replace any empty columns with 
		 * a space to allow it to proceed with PDF generation
		 */
		this.replaceAllEmptyQuotesInStringsWithSpace = function(str) {
			if(typeof str !== 'undefined' && str !== null) {
				return str.replace(new RegExp('""', 'g'), '" "');
			}
			return str;
		};

		/**
		 * Calculate the width in pixels of the longest value in a list.
		 */
		this.getMaxCssWidth = function(data) {
			var maxLen = 0;
			for(var i = 0; i < data.length; i++) {
				var obj = data[i];
				if (obj.text.length > maxLen) {
					maxLen = obj.text.length;
				}
			}
			var width = maxLen * 8.5;
			var cssWidth = width + 'px';
			return cssWidth;
		};
	};

	return new Utils();
});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/common/file-downloader.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/common/file-downloader', [
	'underscore'
], function(_) {

	/**
	 * General Utilities that are used by the PDFWriter
	 *
	 */
	var FileDownloader = function() {

		/**
		 * Activates the file download process. Distinguishes between Internet Explorer and other browsers and applies the appropriate save mechanism.
		 * @param blob - Data has to be of type blob
		 * @param fileName - FileName to use
		 */
		this.openSave = function(blob, fileName) {
			if (this._isIE9()) {
				this._saveFileIE9(blob, fileName);
			} else if (this._detectIESaveFeature()) {
				this._saveFileWithIEFeature(blob, fileName);
			} else if(this._isFF17()){
				//Firefox Defect#17158.
				this._saveFileFF17(blob, fileName);
			} else {
				this._saveFile(blob, fileName);
			}
		};

		/**
		 * File save mechanism for Internet Explorer 9.
		 * Requires the file name extension to be '.txt'.
		 * @param blob - Data has to be of type blob
		 * @param fileName - FileName to use
		 */
		this._saveFileIE9 = function(blob, fileName) {
			var exportWindow = window.open('','','width=1000,height=400');
			var exportDocument = exportWindow.document.open('application/pdf');
			exportDocument.write(blob);
			exportDocument.execCommand('SaveAs', true, fileName);
			exportWindow.close();
		};

		/**
		 * File save feature used by Internet Explorer versions greater than 9.
		 * @param blob - Data has to be of type blob
		 * @param fileName - FileName to use
		 */
		this._saveFileWithIEFeature = function(blob, fileName) {
			window.navigator.msSaveOrOpenBlob(blob, fileName);
		};

		/**
		 * Firefox Defect#17158.
		 * File save mechanism only for Firefox 17.2 ESR:
		 * <ol>
		 * <li>Sets the flag to avoid user session termination written in window.onbeforeunload method.</li>
		 * <li>Generates and configures a download link with a URL loaded with the Blob object.</li>
		 * <li>Clicks on the download link.</li>
		 * <li>Destroys the download link.</li>
		 * <li>Reset flag after 5 seconds if not reset due to any error while saving file</li>
		 * </ol>
		 * 
		 * @param blob - Data has to be of type blob
		 * @param fileName - FileName to use
		 */
		this._saveFileFF17 = function(blob, fileName) {
			// Setting flag which is handled in window.onbeforeunload event.
			//FF 17.2 ESR triggers window.onbeforeunload event on anchor tag download link which destroys the user session.
			window.isANNExportLinkClicked = true;
			this._saveFile(blob, fileName);
			// reset flag after 5 seconds if not reset due to any error while saving file.
			var resetFlag = setTimeout(function() {
				window.isExportLinkClicked = false;}, 5000);

		};

		/**
		 * File save mechanism for Chrome and Firefox:
		 * <ol>
		 * <li>Generates and configures a download link with a URL loaded with the Blob object.</li>
		 * <li>Clicks on the download link.</li>
		 * <li>Destroys the download link.</li>
		 * </ol>
		 * 
		 * @param blob - Data has to be of type blob
		 * @param fileName - FileName to use
		 */
		this._saveFile = function(blob, fileName) {
			var downloadLink = document.createElement('a');

			downloadLink.download = fileName;
			downloadLink.innerHTML = 'Download File';
			downloadLink.href = this._getURL().createObjectURL(blob);
			downloadLink.onclick = this._destroyClickedElement;
			downloadLink.style.display = 'none';
			document.body.appendChild(downloadLink);
			downloadLink.click();
		};
		
		/**
		 * Returns the URL object specific to the browser. This is use to create the download URL.
		 * @returns URL object specific to the browser.
		 */
		this._getURL = function() {
			return window.webkitURL || window.URL;
		};

		/**
		 * Event handler to destroy the download link after it has been clicked.
		 * @param event Download link click event.
		 */
		this._destroyClickedElement = function(event) {
			document.body.removeChild(event.target);
		};

		/**
		 * Determines if the browser is Internet Explorer 9.
		 * @returns {Boolean} True if the browser is Internet Explorer 9.
		 */
		this._isIE9 = function() {
			if (this.getIEVersion().major == 9) {
				return true;
			}
			return false;
		};

		/**
		 * Determines if the browser enables the IE save feature
		 * @returns {Boolean} True if the browser allows the Internet Explorer save feature.
		 */
		this._detectIESaveFeature = function() {
			if (!!window.navigator.msSaveOrOpenBlob) {
				return true;
			}
			return false;
		};

		/**
		 * Determines if the browser is Firefox 17.
		 * @returns {Boolean} True if the browser is Firefox 17.
		 */
		this._isFF17 = function() {
			if (this.getFFVersion().major.indexOf(17) != -1){
				return true;
			}
			return false;
		};

		/**
		 * Determines if the browser is Firefox, but earlier than version 19.
		 */
		this.isFF_EarlierThan19 = function() {
			var version = this.getFFVersion();
			return (version.major > -1 && version.major < 19);
		};

		/**
		 * Determines if the browser is Firefox (any version).
		 */
		this.isFirefox = function() {
			return this.getFFVersion().major > -1;
		};

		/**
		 * Gets the version of Internet Explorer.
		 * This does not work for IE version 11 upwards.
		 * @returns Object with Internet Explorer major and minor.
		 */
		this.getIEVersion = function() {
			var agent = navigator.userAgent;
			var reg = /MSIE\s?(\d+)(?:\.(\d+))?/i;
			var matches = agent.match(reg);
			if (!_.isUndefined(matches) && matches !== null) {
				return {
					major : matches[1],
					minor : matches[2]
				};
			}
			return {
				major : "-1",
				minor : "-1"
			};
		};

		/**
		 * Gets the version of Firefox browser.
		 * @returns Object with Firefox major and minor.
		 */
		this.getFFVersion = function() {
			// "Mozilla/5.0 (X11; Linux i686 on x86_64; rv:17.0) Gecko/20100101 Firefox/17.0"
			var agent = navigator.userAgent;
			var reg = /Firefox[\/\s](\d+)\.(\d+)/;

			var matches = agent.match(reg);
			if (!_.isUndefined(matches) && matches !== null) {
				return {
					major : matches[1],
					minor : matches[2]
				};
			}
			return {
				major : "-1",
				minor : "-1"
			};
		};

		/**
		 * Utility function to detect if browser is Safari
		 * @return boolean
		 */
		this.isSafari = function() {
			return navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
		};
	};

	return new FileDownloader();
});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/writer/pdf-writer.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/writer/pdf-writer', [
	'ossui.pdfexport/common/constants',
	'ossui.pdfexport/common/utils'
], function(constants, utils) {

	/**
	 * PDFWriter provides APIs that can be used from client side to generate an XML based document that can then be sent down
	 * to the server to consume and generate a PDF document. Each API adds an element in the body tag in the sequence in which
	 * they were called.
	 */
	var PDFWriter = function(_sender, _fileDownloader, PDFExportDialogController) {

		this.sender = _sender;
		this.fileDownloader = _fileDownloader;
		if(typeof PDFExportDialogController !== 'undefined') {
			this.pDFExportDialogController = new PDFExportDialogController();
		}
		var self = this;

		/**
		 * Initialize must be invoked to create a document structure onto which various elements can then be added using the APIs.
		 * @param options The following options can be passed in (there are defaults for all, see constants.js)
		 *			pageTitle : String to set the Page Title
					pageSize : String to set the Page Size, eg 'A4'
					pageOrientation : String to set the Page orientation, eg 'Landscape'
					fontSize : String to set font size to be used, eg '12'
					showPageNumber : String to indicate whether to show page numbers eg 'true'
					pageHeader : String to set the page header on all pages
					pageFooter : String to set the page footer on all pages
					documentAuthor : String to set the document author
					documentCreator : String to set the document creator
					fileName : String to set the file name of the downloadable file
		 */
		this.initialize = function(options) {

			this.document = constants.PARENT_START_TAG + constants.NEW_LINE +
				constants.HEAD_START_TAG + constants.NEW_LINE +
				constants.HEAD_TITLE_START_TAG + constants.HEAD_TITLE_END_TAG + constants.NEW_LINE +
				constants.HEAD_PAGE_SIZE_START_TAG + constants.HEAD_PAGE_SIZE_END_TAG + constants.NEW_LINE +
				constants.HEAD_PAGE_ORIENTATION_START_TAG + constants.HEAD_PAGE_ORIENTATION_END_TAG + constants.NEW_LINE +
				constants.HEAD_FONT_SIZE_START_TAG + constants.HEAD_FONT_SIZE_END_TAG + constants.NEW_LINE +
				constants.HEAD_PAGE_NUMBER_START_TAG + constants.HEAD_PAGE_NUMBER_END_TAG + constants.NEW_LINE +
				constants.HEAD_PAGE_HEADER_START_TAG + constants.HEAD_PAGE_HEADER_END_TAG + constants.NEW_LINE +
				constants.HEAD_PAGE_FOOTER_START_TAG + constants.HEAD_PAGE_FOOTER_END_TAG + constants.NEW_LINE +
				constants.HEAD_AUTHOR_START_TAG + constants.HEAD_AUTHOR_END_TAG + constants.NEW_LINE +
				constants.HEAD_CREATOR_START_TAG + constants.HEAD_CREATOR_END_TAG + constants.NEW_LINE +
				constants.HEAD_FILE_FORMAT_START_TAG + constants.DEFAULT_FILE_FORMAT + constants.HEAD_FILE_FORMAT_END_TAG + constants.NEW_LINE +
				constants.HEAD_FILE_NAME_START_TAG + constants.HEAD_FILE_NAME_END_TAG + constants.NEW_LINE +
				constants.HEAD_END_TAG + constants.NEW_LINE +
				constants.BODY_START_TAG + constants.NEW_LINE + constants.BODY_END_TAG + constants.NEW_LINE +
				constants.PARENT_END_TAG;

			options = options || {};

			this.setPageTitle(options.pageTitle);
			this.setPageSize(options.pageSize);
			this.setPageOrientation(options.pageOrientation);
			this.setFontSize(options.fontSize);
			this.setShowPageNumber(options.showPageNumber);
			this.setPageHeader(options.pageHeader);
			this.setPageFooter(options.pageFooter);
			this.setDocumentAuthor(options.documentAuthor);
			this.setDocumentCreator(options.documentCreator);
			this.setFileName(options.fileName);

			this.setDocument(this.document);

			this.sendRESTURL = options.sendRESTURL || constants.DEFAULT_SEND_REST_URL;
		};

		/**
		 * Function to return the generated document in its current state.
		 */
		this.getDocument = function() {
			return this.document;
		};

		/**
		 * Function used to set the generated document in its current state.
		 * @param _document generated document
		 */
		this.setDocument = function(_document) {
			this.document = _document;
		};

		/**
		 * Function to add a new blank page to the generated document body.
		 */
		this.addNewBlankPage = function() {
			addElementToBody(constants.NEW_PAGE_TAG);
		};

		/**
		 * Function to add a blank line to the generated document body.
		 * @param numberOfBlankLines optional parameter to pass number of consecutive blank lines needed.
		 */
		this.addBlankLine = function(numberOfBlankLines) {
			numberOfBlankLines = numberOfBlankLines || constants.DEFAULT_NUMBER_OF_BLANKLINES;

			if(!utils.isNumber(numberOfBlankLines)) {
				numberOfBlankLines = constants.DEFAULT_NUMBER_OF_BLANKLINES;
			}

			var blankLine = constants.BLANKLINE_START_TAG;
			if(numberOfBlankLines !== constants.DEFAULT_NUMBER_OF_BLANKLINES) {
				blankLine = blankLine + constants.BLANKLINE_COUNTER_ATTRIBUTE_START +
					numberOfBlankLines +
					constants.BLANKLINE_COUNTER_ATTRIBUTE_END;
			}
			blankLine = blankLine + constants.BLANKLINE_END_TAG;

			addElementToBody(blankLine);
		};

		/**
		 * Function to add a section header with text to the generated document body.
		 * @param text String
		 */
		this.addSectionHeader = function(text) {
			var sectionHeader = constants.SECTION_HEADER_START_TAG + constants.CDATA_START_TAG + text + constants.CDATA_END_TAG + constants.SECTION_HEADER_END_TAG;
			addElementToBody(sectionHeader);
		};

		/**
		 * Function to add a section sub header with text to the generated document body.
		 * @param text String
		 */
		this.addSectionSubHeader = function(text) {
			var sectionSubHeader = constants.SECTION_SUB_HEADER_START_TAG + constants.CDATA_START_TAG + text + constants.CDATA_END_TAG + constants.SECTION_SUB_HEADER_END_TAG;
			addElementToBody(sectionSubHeader);
		};

		/**
		 * Function to add a new paragraph with text to the generated document body.
		 * @param text String
		 */
		this.addParagraph = function(text, _options) {
			var options = _options || {};
			var paragraph;
			if(typeof options.leftIndent !== 'undefined') {
				if(utils.isNumber(options.leftIndent)) {
					paragraph = constants.PARAGRAPH_START_TAG + constants.PARAGRAPH_LEFT_INDENT_ATTRIBUTE_START + options.leftIndent + constants.PARAGRAPH_LEFT_INDENT_ATTRIBUTE_END + constants.PARAGRAPH_START_END_TAG;
				} else {
					paragraph = constants.PARAGRAPH_START_TAG + constants.PARAGRAPH_START_END_TAG;
				}
			} else {
				paragraph = constants.PARAGRAPH_START_TAG + constants.PARAGRAPH_START_END_TAG;
			}
			paragraph = paragraph + constants.CDATA_START_TAG + text + constants.CDATA_END_TAG + constants.PARAGRAPH_END_TAG;
			addElementToBody(paragraph);
		};

		/**
		 * function to add a table to the generated document body using csv as input
		 * @param csv csv input (must conform to standard csv format using new line between each row)
		 * @param options options that can be passed in are 
		 *		columnWidths : specified columns widths to use. Defaults will be used if not specified. eg '8.0,5.0,12.0'
		 *		Column widths are relative to each other, so not in any particular units.
		 *		columnTypes : column types eg 'text,number,text'
		 */
		this.addTable = function(_csv, options) {
			var csv = utils.replaceAllEmptyQuotesInStringsWithSpace(_csv);
			var tableData = constants.TABLE_START_TAG;
			if(typeof options !== 'undefined' && typeof options.widthPercentage !== 'undefined') {
				tableData = tableData + constants.TABLE_WIDTH_PERCENT_ATTRIBUTE_START + options.widthPercentage + constants.TABLE_WIDTH_PERCENT_ATTRIBUTE_END + constants.TABLE_START_TAG_END + constants.NEW_LINE;
			} else {
				tableData = tableData + constants.TABLE_START_TAG_END + constants.NEW_LINE;
			}
			if(typeof options !== 'undefined' && typeof options.columnWidths !== 'undefined') {
				tableData = tableData + constants.COLUMN_WIDTHS_START_TAG + options.columnWidths + constants.COLUMN_WIDTHS_END_TAG + constants.NEW_LINE;
			}
			if(typeof options !== 'undefined' && typeof options.columnTypes !== 'undefined') {
				tableData = tableData + constants.COLUMN_TYPES_START_TAG + options.columnTypes + constants.COLUMN_TYPES_END_TAG + constants.NEW_LINE;
			}
			tableData = tableData + constants.TABLEDATA_START_TAG + constants.NEW_LINE +
					constants.CDATA_START_TAG + constants.NEW_LINE + csv + constants.NEW_LINE + constants.CDATA_END_TAG + constants.NEW_LINE +
					constants.TABLEDATA_END_TAG + constants.NEW_LINE + constants.TABLE_END_TAG;
			addElementToBody(tableData);
		};

		/**
		 * Function to add an image to the generated document body. The image data has to be base64 encoded.
		 * @param imageURL String to specify the image url source
		 * @param imageName String to specify image name
		 * @param imageType String to specify image type eg 'jpeg'
		 */
		this.addImage = function(imageRelativeURL, _options) {
			var options = _options || {};
			if(typeof imageRelativeURL !== 'undefined' && imageRelativeURL !== null && imageRelativeURL !== "") {
				var imageURL = document.location.origin + '/' + imageRelativeURL;
				var imageData = constants.IMAGE_START_TAG + constants.IMAGE_SRC_ATTRIBUTE_START + imageURL + constants.IMAGE_ATTRIBUTE_END; // + imageName + constants.IMAGE_END_TAG
				if(typeof options.scalePercent !== 'undefined' && utils.isNumber(options.scalePercent)) {
					imageData = imageData + constants.IMAGE_SCALE_PERCENT_ATTRIBUTE_START + options.scalePercent + constants.IMAGE_ATTRIBUTE_END;
				}
				imageData = imageData + constants.IMAGE_END_TAG;
				addElementToBody(imageData);
			}
		};

		/**
		 * Function to add svg to the generated document body.
		 * @param svgXML svg in XML format
		 */
		this.addSVG = function(svgXML) {
			//TODO: Implement this once we have an idea of what the svgXML structure looks like
		};

		/**
		 * Function to set the Page Title.
		 * @param pageTitle String to set the page title
		 */
		this.setPageTitle = function(pageTitle) {
			pageTitle = pageTitle || constants.DEFAULT_TITLE;
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_TITLE_START_TAG, constants.HEAD_TITLE_END_TAG);
			pageTitle = constants.CDATA_START_TAG + pageTitle + constants.CDATA_END_TAG;
			this.document = insertElementInText(this.document, pageTitle, constants.HEAD_TITLE_END_TAG);
		};

		/**
		 * Function to set the page size. Validates that only allowed pages sizes are set, if not default is used. See constants.js.
		 * @param pageSize String to set the page size
		 */
		this.setPageSize = function(pageSize) {
			pageSize = pageSize || constants.DEFAULT_PAGE_SIZE;
			pageSize = pageSize.toLowerCase();
			var validPageSize = false;
			for(var i = 0; i < constants.ALLOWED_PAGE_SIZES.length; i++) {
				if(constants.ALLOWED_PAGE_SIZES[i].id === pageSize) {
					validPageSize = true;
					break;
				}
			}
			if(!validPageSize) {
				pageSize = constants.DEFAULT_PAGE_SIZE;
			}
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_PAGE_SIZE_START_TAG, constants.HEAD_PAGE_SIZE_END_TAG);
			this.document = insertElementInText(this.document, pageSize, constants.HEAD_PAGE_SIZE_END_TAG);
		};

		/**
		 * Function to set the page orientation. Validates that only allowed page orientations are set, if not default is used. See constants.js.
		 * @param pageOrientation String to set the page orientation
		 */
		this.setPageOrientation = function(pageOrientation) {
			pageOrientation = pageOrientation || constants.DEFAULT_PAGE_ORIENTATION;
			pageOrientation = pageOrientation.toLowerCase();
			var validPageOrientation = false;
			for(var i = 0; i < constants.ALLOWED_PAGE_ORIENTATIONS.length; i++) {
				if(constants.ALLOWED_PAGE_ORIENTATIONS[i].id === pageOrientation) {
					validPageOrientation = true;
					break;
				}
			}
			if(!validPageOrientation) {
				pageOrientation = constants.DEFAULT_PAGE_ORIENTATION;
			}
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_PAGE_ORIENTATION_START_TAG, constants.HEAD_PAGE_ORIENTATION_END_TAG);
			this.document = insertElementInText(this.document, pageOrientation, constants.HEAD_PAGE_ORIENTATION_END_TAG);
		};

		/**
		 * Function to set font size. Validates that only positive numbers are passed in, if not default font size is used. See constants.js.
		 * @param fontSize String to set font size
		 */
		this.setFontSize = function(fontSize) {
			fontSize = fontSize || constants.DEFAULT_FONT_SIZE;
			if(!utils.isNumber(fontSize)) {
				fontSize = constants.DEFAULT_FONT_SIZE;
			}
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_FONT_SIZE_START_TAG, constants.HEAD_FONT_SIZE_END_TAG);
			this.document = insertElementInText(this.document, fontSize, constants.HEAD_FONT_SIZE_END_TAG);
		};

		/**
		 * Function to set the show page number indicator.
		 * @param showPageNumber String to set the flag
		 */
		this.setShowPageNumber = function(showPageNumber) {
			if(typeof showPageNumber !== 'undefined') {
				if(showPageNumber === true) {
					showPageNumber = 'true';
				} else if(showPageNumber !== 'true') {
					showPageNumber = 'false';
				}
			} else {
				showPageNumber = constants.DEFAULT_SHOWPAGE_NUMBER;
			}
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_PAGE_NUMBER_START_TAG, constants.HEAD_PAGE_NUMBER_END_TAG);
			this.document = insertElementInText(this.document, showPageNumber, constants.HEAD_PAGE_NUMBER_END_TAG);
		};

		/**
		 * Function to set page header.
		 * @param pageHeader String to set page header
		 */
		this.setPageHeader = function(pageHeader) {
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_PAGE_HEADER_START_TAG, constants.HEAD_PAGE_HEADER_END_TAG);
			if(typeof pageHeader !== 'undefined') {
				this.document = insertElementInText(this.document, pageHeader, constants.HEAD_PAGE_HEADER_END_TAG);
			} else {
				this.document = insertElementInText(this.document, constants.DEFAULT_PAGE_HEADER, constants.HEAD_PAGE_HEADER_END_TAG);
			}
		};

		/**
		 * Function to set page footer.
		 * @param pageFooter String to set page footer
		 */
		this.setPageFooter = function(pageFooter) {
			if(typeof pageFooter !== 'undefined') {
				this.document = emptyExistingContentsInTag(this.document, constants.HEAD_PAGE_FOOTER_START_TAG, constants.HEAD_PAGE_FOOTER_END_TAG);
				this.document = insertElementInText(this.document, pageFooter, constants.HEAD_PAGE_FOOTER_END_TAG);
			}
		};

		/**
		 * Function to set document author.
		 * @param documentAuthor String to set document author
		 */
		this.setDocumentAuthor = function(documentAuthor) {
			documentAuthor = documentAuthor || constants.DEFAULT_AUTHOR;
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_AUTHOR_START_TAG, constants.HEAD_AUTHOR_END_TAG);
			this.document = insertElementInText(this.document, documentAuthor, constants.HEAD_AUTHOR_END_TAG);
		};

		/**
		 * Function to set document creator.
		 * @param documentCreator String to set document creator
		 */
		this.setDocumentCreator = function(documentCreator) {
			documentCreator = documentCreator || constants.DEFAULT_CREATOR;
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_CREATOR_START_TAG, constants.HEAD_CREATOR_END_TAG);
			this.document = insertElementInText(this.document, documentCreator, constants.HEAD_CREATOR_END_TAG);
		};

		/**
		 * Function to set file name. Validates that the extension .pdf is always present at the end of the file name whether passed in or not.
		 * @param fileName String to set file name.
		 */
		this.setFileName = function(fileName) {
			var fileExtension = constants.DEFAULT_FILE_EXTENSION;
			fileName = fileName || constants.DEFAULT_FILE_NAME;
			if(fileName.toLowerCase().indexOf(fileExtension) < 0) {
				fileName = fileName + fileExtension;
			}
			this.document = emptyExistingContentsInTag(this.document, constants.HEAD_FILE_NAME_START_TAG, constants.HEAD_FILE_NAME_END_TAG);
			this.document = insertElementInText(this.document, fileName, constants.HEAD_FILE_NAME_END_TAG);
			this.fileName = fileName;
		};

		/**
		 * Function to save the PDF. This function will internally send the document to the backend via REST
		 * enabling the backend to convert the document to PDF.
		 * @param options - can contain an error function to use as callback to handle errors in PDF generation.
		 */
		this.save = function(options) {
			var fileName = self.fileName || constants.DEFAULT_FILE_EXTENSION;
			options = options || {};
			options._internalSaveCallBack = this._internalSaveCallBack;
			options.fileName = fileName;
			this.sendDocument(this.document, this.sendRESTURL, options);
		};

		/**
		 * Function to show a PDF Export dialog before saving the file. The dialog asks for page size and page orientation
		 * and uses that to reconfigure the document according to selected size and orientation. It then invokes the save() function
		 * to carry on saving the PDF document.
		 * @param options - can contain an error function to use as callback to handle errors in PDF generation.
		 */
		this.saveWithDialog = function(options) {
			var self = this;
			var saveWithDialogCallBack = function(size, orientation) {
				self.setPageSize(size);
				self.setPageOrientation(orientation);
				self.save(options);
			};
			this.pDFExportDialogController.renderPDFExportDialogView(saveWithDialogCallBack);
		};

		/**
		 * Utility method to send a document via REST service. Because AJAX requests do not work well 
		 * in IE9 with PDF, we had to use a form post instead.
		 * @param document XML document
		 * @param sendRESTURL REST url
		 * @param options - should contain fileName to save and the _internalSaveCallBack function
		 */
		this.sendDocument = function(document, sendRESTURL, options) {
			// QC Defect 18629: A bug with Firefox 17.0.2 means that PDF download causes a
			/// blank page in ANN; using the 'old' style IE9 solution seems to work however.
			if(self.fileDownloader._isIE9() || self.fileDownloader.isSafari() ||
			   self.fileDownloader.isFF_EarlierThan19()) {
				this.sender.sendFormPOSTRequest(this.document, this.sendRESTURL, options);
			} else {
				this.sender.sendXMLHttpRequest(this.document, this.sendRESTURL, options);
			}
		};

		/**
		 * This is called on success of the AJAX request and uses the fileDownloader to save the file.
		 * @param response - This is a blob object.
		 */
		this._internalSaveCallBack = function(response) {
			var fileName = self.fileName || constants.DEFAULT_FILE_EXTENSION;
			self.fileDownloader.openSave(response, fileName);
		};

		/**
		 * Utility method to insert an element at a specified point before a tag.
		 * @param text String containing generated document
		 * @param elementToBeInserted String containing the element to be inserted
		 * @param tagBeforeElementInserted String containing the tag before which the element should be inserted
		 */
		var insertElementInText = function(text, elementToBeInserted, tagBeforeElementInserted) {
			if(typeof text !== 'undefined') {
				var splitArray = text.split(tagBeforeElementInserted);
				var start = splitArray[0];
				var end = tagBeforeElementInserted + splitArray[1];
				text = start + elementToBeInserted + end;
			}
			return text;
		};

		/**
		 * Utility method to empty contents in a tag. Can be used before replacing contents in a tag.
		 * @param text - text String containing generated document
		 * @param startTag - start tag element of which to empty the contents
		 * @param endTag - end tag element of which to empty the contents
		 */
		var emptyExistingContentsInTag = function(text, startTag, endTag) {
			if(typeof text !== 'undefined') {
				var splitArray1 = text.split(startTag);
				var splitArray2 = text.split(endTag);
				var start = splitArray1[0] + startTag;
				var end = endTag + splitArray2[1];
				text = start + end;
			}
			return text;
		};

		/**
		 * Utility method to add an element before the closing body tag.
		 * @param element String to be inserted
		 */
		var addElementToBody = function(element) {
			self.document = insertElementInText(self.document, element + constants.NEW_LINE, constants.BODY_END_TAG);
		};
	};

	return PDFWriter;
});

/*
 * $Id: $
 * $DateTime: $
 * $Revision: $
 * $Change: $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/export/secure-ajax-utils', [
	'jquery',
	'underscore',
	'lightsaber',
	'ossui.pdfexport/common/file-downloader'
], function($, _, Lightsaber, fileDownloader) {

	/**
	 * Contains utility methods to get an authorization token and to download a file using iFrame and a form post method.
	 * @exports SecureAjaxUtils
	 */
	var SecureAjaxUtils = function() {

		/**
		 * This function obtains an authorization ticket from an LS datasource
		 * @param options - contains contentType, url and transport method type
		 */
		this.getAuthorizationTicket = function(options) {
			var restDS = new Lightsaber.Core.LSRESTDataSource({
				defaults : {
					contentType : options.contentType,
					fullURL : options.url
				},
				create : {
					method : options.type
				}
			});	

			var authorizationToken = restDS.getToken();
			return authorizationToken;
		};

		/**
		 * This function creates a dummy iFrame and a dummy form element. It uses the form as a target to the 
		 * iFrame and posts the data. This is only used by IE9. The iFrame is created so as to enable us to have a response hook to 
		 * handle any errors. Normal form posts do not give us this hook very easily, so this is a work around.
		 */
		this.downloadFile = function(url, data, _options) {
			var downloadiframe;
			var iFramID = 'downloadiframe';
			var formID = 'pdfGeneratorForm';

			if(url && data) {
				// remove previous iframe if present
				if($('#' + iFramID)) {
					$('#' + iFramID).remove();
				}
				// remove previous form if present
				if($('#' + formID)) {
					$('#' + formID).remove();
				}

				downloadiframe = $('<iframe src="javascript:false;" name="' + iFramID + '" id="' + iFramID + '"></iframe>').appendTo('body').hide();

				// for Firefox the 'onload' event is only triggered when the iframe is successfully
				// loaded; never when there is an error. This was causing the error dialog to popup
				// on successful return/download of the PDF file.
				if (!fileDownloader.isFirefox()) {
					//this will be executed only in case of faliure while downloading the document.
					downloadiframe.load(function(x) {
						console.log('Error generating export. See server logs for details.');
						if(typeof _options.error !== 'undefined') {
							_options.error(x);
						}
					});
				}

				//create form to send request 
				var form = $('<form id="' + formID + '" method="post" target="' + iFramID + '"></form>');
				form.get(0).setAttribute('action', url);
				if (data) {
					for (var key in data) {
						var input = document.createElement("input");
						input.name = key;
						input.value = typeof data[key] === "object" ? JSON.stringify(data[key]) : data[key];
						form.append(input);
					}
				}
				form.appendTo('body').submit().remove();
			}
		};

		_.bindAll(this, 'getAuthorizationTicket', 'downloadFile');
	};

	return new SecureAjaxUtils();
});

/*
 * $Id: $
 * $DateTime: $
 * $Revision: $
 * $Change: $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/export/sender', [
	'ossui.pdfexport/export/secure-ajax-utils'
], function(secureAjaxUtils) {

	/**
	 * Used by the PDF Writer to send the data back to the server to generate the PDF.
	 *
	 */
	var Sender = function() {

		/**
		 * This function uses HTML5 XMLHttpRequest supported by all browsers except IE9. The authorization token is 
		 * obtained separately and passed as a request header.
		 * @param xmlDocument - contains the xml metadata for generating the PDF.
		 * @param url - contains the REST url for the PDF generator
		 * @param _options - contains the _internalSaveCallBack function
		 */
		this.sendXMLHttpRequest = function(xmlDocument, url, _options) {
			var options = {
				type: 'POST',
				url: url,
				data: xmlDocument,
				contentType: 'application/pdf',
			};
			var authorizationToken = secureAjaxUtils.getAuthorizationTicket(options);
			var oReq = new XMLHttpRequest();

			oReq.open("POST", url, true);
			oReq.setRequestHeader("Accept", "application/pdf");
			oReq.setRequestHeader("Content-Type", "text/xml");
			oReq.setRequestHeader("authorization", authorizationToken);
			oReq.setRequestHeader("Content"+"-X"+"-Check", this._basicCheck(xmlDocument));
			oReq.responseType = "blob";

			var self = this;
			oReq.onload = function(oEvent) {
				if(oReq.status === 200) {
					_options._internalSaveCallBack(oReq.response);
				} else {
					console.log('Error generating PDF. See server logs for details.');
					if(typeof _options.error !== 'undefined') {
						_options.error(oReq);
					}
				}
			};
			oReq.onerror = function(oEvent) {
				console.log('Error generating PDF. See server logs for details.');
				if(typeof _options.error !== 'undefined') {
					_options.error(oReq);
				}
			};
			oReq.send(xmlDocument);
		};

		/**
		 * This function uses a form post contained in the function secureAjaxUtils.downloadFile() and is only used by IE9.
		 * @param xmlDocument - contains the xml metadata for generating the PDF.
		 * @param url - contains the REST url for the PDF generator
		 * @param _options - contains the _internalSaveCallBack function
		 */
		this.sendFormPOSTRequest = function(xmlDocument, url, _options) {
			secureAjaxUtils.downloadFile(url, {
				fileName : _options.fileName,
				content : xmlDocument
			}, _options);
		};

		/**
		 * A simple value to help the server have confidence the request hasn't been modified
		 * by a proxy injection. Ideally HTTPS should be used for more confidence.
		 */
		this._basicCheck = function(str) {
			var i, value = 0x12345678;
			for (i = 0; i < str.length && i < 5000; i+=2) {
				value += (str.charCodeAt(i) * (i + 1));
			}
			result = value.toString();
			return result.slice(-8);  // last 8 chars
		};
	};

	return new Sender();
});

define('text!ossui.pdfexport/dialog/templates/pdf-export-dialog-template.html',[
], function () {
	var htmlTemplate ='<div id="page-size" style="padding-bottom: 6px;"><table width = "100%">' +
		'<tr><td style="width: 153px;"><div class="ossui-forminput-text"><%=pageSizeLabel%></div></td>' +
		'<td><input data-uxf-point="pdf-export-page-size" id="pdf-export-page-size" type="text" class="pdf-export-page-size"></td></tr>' +
		'</table></div>' + 
		'<div id="page-orientation"><table width = "100%">' +
		'<tr><td style="width: 153px;"><div class="ossui-forminput-text"><%=pageOrientationLabel%></div></td>' +
		'<td><input data-uxf-point="pdf-export-page-orientation" id="pdf-export-page-orientation" type="text" class="pdf-export-page-orientation"></td></tr>' +
		'</table></div>';

	return htmlTemplate;
});


/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/dialog/pdf-export-dialog-view.js#1 $ 
 * $DateTime: 2017/06/08 19:26:36 $ 
 * $Revision: #1 $ 
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2012 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/dialog/pdf-export-dialog-view',[
	'jquery',
	'underscore',
	'lightsaber',
	'ossui.pdfexport/common/constants',
	'ossui.pdfexport/common/utils',
	'select2'
], function($, _, Lightsaber, constants, utils) {

	var PDFExportDialogView = Lightsaber.PopupView.extend({

		show : function() {
			this._super();
			// override close event to ensure the dialog is
			// properly removed when the close icon is used
			var self = this;
			this.$el.on('dialogclose', function(event, ui) {
				self.close();
			});

			this.populateData();

			var pageSizeElement = $('#pdf-export-page-size');
			this.createWidget(pageSizeElement, this.pageSizes);

			var pageOrientationElement = $('#pdf-export-page-orientation');
			this.createWidget(pageOrientationElement, this.pageOrientations);

			this.$el.css('height', '');
		},

		populateData : function() {
			var i;
			var count = 0;
			var found = false;

			// Gather pageSizes data. Ensure the default page size is at the top of the
			// array so as the select box is correctly populated
			this.pageSizes = [];
			var defaultPageSize = constants.DEFAULT_PAGE_SIZE;
			var tmpPageSizes = constants.ALLOWED_PAGE_SIZES;
			for(i = 0; i < tmpPageSizes.length; i++) {
				if(tmpPageSizes[i].id === defaultPageSize) {
					found = true;
					this.pageSizes[count] = tmpPageSizes[i];
					count = count + 1;
					break;
				}
			}
			if(found) {
				for(i = 0; i < tmpPageSizes.length; i++) {
					if(tmpPageSizes[i].id !== defaultPageSize) {
						this.pageSizes[count] = tmpPageSizes[i];
						count = count + 1;
					}
				}
			} else {
				this.pageSizes = tmpPageSizes;
			}

			count = 0;
			found = false;

			// Now do the same with pageOrientation data. Ensure the default page orientation
			// is at the top of the array so as the select box is correctly populated
			this.pageOrientations = [];
			var defaultPageOrientation = constants.DEFAULT_PAGE_ORIENTATION;
			var tmpPageOrientations = constants.ALLOWED_PAGE_ORIENTATIONS;
			for(i = 0; i < tmpPageOrientations.length; i++) {
				if(tmpPageOrientations[i].id === defaultPageOrientation) {
					found = true;
					this.pageOrientations[count] = tmpPageOrientations[i];
					count = count + 1;
					break;
				}
			}
			if(found) {
				for(i = 0; i < tmpPageOrientations.length; i++) {
					if(tmpPageOrientations[i].id !== defaultPageOrientation) {
						this.pageOrientations[count] = tmpPageOrientations[i];
						count = count + 1;
					}
				}
			} else {
				this.pageOrientations = tmpPageOrientations;
			}
		},

		/**
		 * Creates the select2 widget
		 */
		createWidget : function(inputElement, sizes) {
			var select2Config = {
					data : sizes,
					placeholder : sizes[0].text,
					multiple : false,
					closeOnSelect : true,
					dropdownCss : function() {
						var originalSize = inputElement.siblings('div').outerWidth();
						// calculate the width of the dropdown based on the character length of the data
						var cssWidth = utils.getMaxCssWidth(sizes);

						// only resize if it needs to be bigger
						if (parseInt(cssWidth, 10) > originalSize) {
							return {'width': cssWidth};
						}
						else {
							return {};
						}
					},
					escapeMarkup : function(value) {
						return value;
					}
			};

			inputElement.select2(select2Config);
		},

		/**
		 * When Export button is clicked
		 */
		_handleExportButton : function(event, sucessFn) {
			var size = $('#pdf-export-page-size').select2("val");
			var orientation = $('#pdf-export-page-orientation').select2("val");
			sucessFn(size, orientation);
			this.close();
		},

		close : function() {
			this._super();
		}
	});

	return PDFExportDialogView;
});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/dialog/pdf-export-dialog-controller.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport/dialog/pdf-export-dialog-controller', [
	'jquery',
	'underscore',
	'lightsaber',
	'ossui/utils/OSSUIResourceBundle',
	'ossui.pdfexport/common/constants',
	'ossui.pdfexport/common/utils',
	'ossui.pdfexport/dialog/pdf-export-dialog-view',
	'text!ossui.pdfexport/dialog/templates/pdf-export-dialog-template.html'
], function($, _, Lightsaber, OSSUIResourceBundle, constants, utils, PDFExportDialogView, PDFExportDialogViewTemplate) {

	/**
	 * This is a controller function used to render the PDF Export dialog box
	 */
	var PDFExportDialogController = function() {

		/**
		 * Function used to render the PDF Export dialog box. It takes in a callback 
		 * function which is used to pass back any input fromt the dialog.
		 * @param callbackFn callback function
		 */
		this.renderPDFExportDialogView = function(callbackFn) {
			this.callbackFn = callbackFn;
			var myself = this;

			var pdfExportDialogView = new PDFExportDialogView({
				viewModel : new Lightsaber.Core.ViewModel(),
				config : {
					position : 'center',
					resizable : false,
					show: 'fade',
					hide: 'fade',
					modal: true,
					title: OSSUIResourceBundle.prototype.getMessage('ossui.labels.pdf.dialog.title') || 'Export to PDF options',
					width : 388,
					height : 260,
					autoShow : true,

					buttons: [{
						focus : false,
						text : OSSUIResourceBundle.prototype.getMessage('ossui.labels.pdf.dialog.button.export') || 'Export',
						parentViewModel : this.viewModel,
						click : function(event) {
							var self = pdfExportDialogView;
							self._handleExportButton(event, myself.callbackFn);
						}
					},
					{
						focus : false,
						text : OSSUIResourceBundle.prototype.getMessage('ossui.labels.button.cancelString') || 'Cancel',
						parentViewModel : this.viewModel, 
						click : function(event) {
							var self = pdfExportDialogView;
							self.close(event);
						}
					}],

					createContent : function(self) {
						var pageSizeLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.pdf.dialog.page.size') || 'Page Size';
						var pageOrientationLabel = OSSUIResourceBundle.prototype.getMessage('ossui.labels.pdf.dialog.page.orientation') || 'Page Orientation';
						var viewData = {
							pageSizeLabel : pageSizeLabel,
							pageOrientationLabel : pageOrientationLabel
						};
						return _.template(PDFExportDialogViewTemplate, viewData);
					}
				}
			});

			pdfExportDialogView.render();

			$('.ui-dialog').addClass("ossui-lightbox");
			$('.ui-dialog-titlebar-close').hover(function(){
				$('.ui-dialog-titlebar-close').css('background', 'none');
				$('.ui-dialog-titlebar-close').css('border', '0px');
			});
		};
	};

	return PDFExportDialogController;
});

/*
 * $Id: //depot/Applications/OSSUI/v10.1.0.0/components/ossui-export/ossui-pdf-export-zip/src/main/webapp/pdfexport/pdf-exporter.js#1 $
 * $DateTime: 2017/06/08 19:26:36 $
 * $Revision: #1 $
 * $Change: 1837971 $
 * 
 * COPYRIGHT NOTICE:
 * Copyright (c) 2013 Amdocs.
 * The contents and intellectual property contained herein,
 * remain the property of Amdocs.
 */
define('ossui.pdfexport.components', [
	'ossui.pdfexport/common/constants',
	'ossui.pdfexport/common/utils',
	'ossui.pdfexport/common/file-downloader',
	'ossui.pdfexport/writer/pdf-writer',
	'ossui.pdfexport/export/secure-ajax-utils',
	'ossui.pdfexport/export/sender',
	'ossui.pdfexport/dialog/pdf-export-dialog-controller'
], function(constants, utils, fileDownloader, PDFWriter, secureAjaxUtils, sender, PDFExportDialogController) {
	return {
		constants : constants,
		utils : utils,
		secureAjaxUtils : secureAjaxUtils,
		fileDownloader : fileDownloader,
		sender : sender,
		PDFExportDialogController : PDFExportDialogController,
		pdfWriter : new PDFWriter(sender, fileDownloader, PDFExportDialogController)
	};
});

define('ossui.pdfexport', ['ossui.pdfexport.components'], function (ossuiPDFExporter) { return ossuiPDFExporter; } );
