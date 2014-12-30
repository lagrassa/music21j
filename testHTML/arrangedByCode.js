function OrchestralScore(pianoPart){
	this.pianoScore = pianoPart
	if (typeof this.partList == "undefined") {
		console.log("initialize partList as undefined")
		this.partList = []
	}
	
	this.getSelectedInstruments = function() {
		var selectedInstruments = [];
		$('#instrumentSelect :checked').each(function() {
			selectedInstruments.push($(this).val());
		    });
		return selectedInstruments
	}
	
	this.getSplitPart = function(selectedInstrument) {
		for (var i = 0; i < this.partList.length; i++ ) {
			var splitPart = this.partList[i]
			if (splitPart.instrument == selectedInstrument) {
				return splitPart
			}
		}
	}
	this.setSplitPart = function(instrument, p) {
		newSplitPart = new SplitPart(instrument, p);
		this.partList.push(newSplitPart);
	}
}

function SplitPart (instrument, p, OrchestralScore) {
	
	if (typeof(OrchestralScore) == "undefined" ) {
		OrchestralScore = os
	}
	
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
	
	this.addRest = function (pianoChord) {
		measureNumber = 0
		r = new music21.note.Rest();
		r.duration.quarterLength = pianoChord.duration.quarterLength
		this.p.get(measureNumber).append(r)
	}
	
	this.lengthenChord = function (pianoChord) {
		measureNumber = 0;
		var startOfRest = this.p.flat.elements.get(-1);
		newRest = new music21.note.Rest();
		newRest.duration.quarterLength = startOfRest.duration.quarterLength + pianoChord.duration.quarterLength
	}
	
	this.addNote = function (noteIndex, pianoChord) {
		measureNumber = 0;
		n = new music21.note.Note()
		n.pitch = pianoChord.pitches[noteIndex]
		this.p.get(measureNumber).append(n)
	}
	this.displayPart = function () {
		var $specifiedCanvas = $('#instrument_'  + splitPart.instrument);
		$specifiedCanvas.empty();
		var thisPart = splitPart.p;
		thisPart.appendNewCanvas($specifiedCanvas);
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
		os.setSplitPart(instrumentName, p)
		
		var $canvasDiv = $("<div class = 'canvasHolder' id='instrument_" + instrumentName + "' align = 'left' > </div>");
		
		var $inputBox = $('<label>Input for '+ instrumentName + ' : </label>' +
	      '<input type="text" name="textbox' + instrumentName + 
	      '" id="input_for_' + instrumentName + '" value="" >')
		
		var $button = $("<button id = 'renderButton' > Render </button>")
		$button.attr('val', instrumentName);
	    
		$button.bind('click', function() {
			splitPartName = $(this).attr('val');
			splitPart = os.getSplitPart(splitPartName);
			processCommand(splitPart);
			splitPart.displayPart();	
		});
		
		$inputBox.after().html($button)
		$canvasDiv.append($inputBox)
		$("#canvases").append($canvasDiv);
		p.appendNewCanvas($canvasDiv);
	}
}

function processCommand(splitPart) {
	
	var rawText = $('#input_for_' + splitPart.instrument + '' ).val();

	var nonSpaceCount = 0;
	for (var i = 0; i < rawText.length; i++ ) {
		char = rawText.charAt(i);
		var pianoChord = os.pianoScore.flat.elements[nonSpaceCount];
		if (rawText.charAt(i) != ' ') {
			nonSpaceCount++
			if (char == 'r' ) {
				splitPart.addRest(pianoChord);
			} else if ( typeof(parseInt(char)) == "number") {
				splitPart.addNote(parseInt(char), pianoChord);
			} else if ( char == 'r') {
				splitPart.lengthenNote();
			}	else {
				alert("At position " + i + "there is an invalid character.")
			}
		}
	}
}

