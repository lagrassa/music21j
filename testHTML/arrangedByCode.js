function OrchestralScore(name){
	this.name = name
	if (typeof this.partList == "undefined") {
		console.log("initialize partList as undefined")
		this.partList = []
	}
	//this.splitPart = SplitPart(instrument, part)
	this.getSplitPart = function(selectedInstrument) {
		for (var i = 0; i < this.partList.length; i++ ) {
			var splitPart = this.partList[i]
			if (splitPart.instrument == selectedInstrument) {
				return splitPart
			}
		}
	}
	
	/**
	 * Called by create canvases to determine which instruments were selected
	 * @returns {Array} selected instruments returns a list of instrument identifiers that correspond to jQuery canvases
	 */
	this.getSelectedInstruments = function() {
		var selectedInstruments = [];
		$('#instrumentSelect :checked').each(function() {
			selectedInstruments.push($(this).val());
		    });
		return selectedInstruments
	}
	
	this.getRestingInstruments = function () {
		var unchecked = [];
		$('#instrumentSelect :not(:checked)').each(function() {
			unchecked.push($(this).val());
		    });
		var resting = [];
		for (var i = 0; i < unchecked.length; i++) {
			if (typeof (os.getSplitPart(unchecked[i])) != "undefined") {
					if (unchecked[i] != "") {
						resting.push(unchecked[i])
					}
			}
		}
		return resting
	}
	
	this.addRests = function (newSplitPart) {
			
			for (var splitPartWithRests = 0; splitPartWithRests < this.partList[0].p.flat.elements.length; splitPartWithRests++ ) {
				r = new music21.note.Rest()
				r.duration
				newSplitPart.p.append(r);
				return splitPartWithRests;
				}
	}
	
	this.makeSplittedPart = function (instrument, p) {
		var newSplitPart = new SplitPart(instrument, p)
		console.log(instrument);
		if (typeof this.partList != "undefined") {
			if (this.partList.length > 0 ) {
				splitPartWithRests = this.addRests(newSplitPart)
			}
		}
		this.partList.push(newSplitPart)
		
		
	}
}

function SplitPart (instrument, p) {
	if (instrument === undefined) {
		instrument = 'piano';
	} 
	if (p  === undefined) {
		p = new music21.stream.Part();
		var m = new music21.stream.Measure()
		p.append(m);
	} 
	
	this.instrument = instrument;
	this.p = p;
	
	this.addNoteToPart = function (c, offsetIndex) {	
		c.offset = offsetIndex
		this.p.get(0).append(c);
	}
	this.addCorrespondingRest = function (c, offsetIndex) {
		console.log("add Corresponding rest")
		r = new music21.note.Rest()
		r.offset = offsetIndex
		r.duration.quarterLength = c.duration.quarterLength
		this.p.get(0).append(r);
	}
	
	
}



/**
*Creates the correct number of canvases with appropriate identifiers. 
*in the future, this should correspond to the name of the instrument
*creates partList (global variable) which are parts with currently one measure
*/

$('#createCanvases').click(function () {
	if (typeof(os) == "undefined" ) {
		os = new OrchestralScore('protoPainting score')
	}
	createCanvases();
});


function createCanvases() {
	$("#canvases").empty();
	
	if (typeof(os) == "undefined") {
		os = new OrchestralScore('protopainter orchestral score')
		console.log("created new os object")
	}
	var selectedInstruments = os.getSelectedInstruments();
	for (var i in selectedInstruments) {
		instrumentName = selectedInstruments[i]
		var p = new music21.stream.Part();
		var newMeasure = new music21.stream.Measure();
		p.append(newMeasure);
		
		var $canvasDiv = $("<div class = 'canvasHolder' id='instrument_" + instrumentName + "' align = 'left' > </div>");
		
		var $inputBox = $('<label>Input for '+ instrumentName + ' : </label>' +
	      '<input type="text" name="textbox' + instrumentName + 
	      '" id="input_for_' + instrumentName + '" value="" >')
		
		var $button = $('<button> Render </button>')
	      
		$inputBox.after().html($button)
		$canvasDiv.append($inputBox)
		$("#canvases").append($canvasDiv);
		p.appendNewCanvas($canvasDiv);
	}
}