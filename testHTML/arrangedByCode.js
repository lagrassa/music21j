function OrchestralScore(pianoPart){
	this.pianoScore = pianoPart
	this.partList = []
	if (typeof this.splitPartList == "undefined") {
		console.log("initialize splitPartList as undefined")
		this.splitPartList = []
	}
	if (typeof this.partList == "undefined") {
		this.partList = []
	}
	
	this.addPart = function (partName) {
		this.partList.push(partName);
	}
	
	this.getSplitPart = function(selectedInstrument) {
		for (var i = 0; i < this.splitPartList.length; i++ ) {
			var splitPart = this.splitPartList[i]
			if (splitPart.instrument == selectedInstrument) {
				return splitPart
			}
		}
	}
	this.setSplitPart = function(instrument, p) {
		newSplitPart = new SplitPart(instrument, p);
		this.splitPartList.push(newSplitPart);
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
		var last = this.p.flat.elements.get(-1);
		if (last.isRest()) {
			var held = new music21.note.Rest();
		} else {
			var held = new music21.note.Note();
			held.pitch = last.pitch;
		}
		held.duration.quarterLength = last.duration.quarterLength + pianoChord.duration.quarterLength
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
*creates splitPartList  which are parts with currently one measure
*/

$('#createCanvases').click(function () {
	if (typeof(os) == "undefined" ) {
		os = new OrchestralScore('protoPainting score')
	}
	createCanvases();
});

$('#addPart').click(function ()  {
	var newPartName = $('#inputPart').val()
	console.log(newPartName)
	os.addPart(newPartName);
	$('#inputPart').val('');
	$newPartName = $('<p> </p>')
	$newPartName.text(newPartName)
	$('#existingParts').append($newPartName)
});

function createCanvases() {
	$("#canvases").empty();
	
	if (typeof(os) == "undefined") {
		os = new OrchestralScore('protopainter orchestral score')
		console.log("created new os object")
	}
	selectedInstruments = os.partList
	for (var i in selectedInstruments) {
		instrumentName = selectedInstruments[i]
		var p = new music21.stream.Part();
		var newMeasure = new music21.stream.Measure();
		p.append(newMeasure);
		os.setSplitPart(instrumentName, p)
		
		var $canvasDiv = $("<div class = 'canvasHolder' id='instrument_" + instrumentName + "' align = 'left' > </div>");
		$canvasDiv.css('display', 'list-item')		
		
	
		
		var $button = $("<button id = 'renderButton' > Render </button>")
		$button.attr('val', instrumentName);
		$button.bind('click', function() {
			splitPartName = $(this).attr('val');
			splitPart = os.getSplitPart(splitPartName);
			processCommand(splitPart);
			splitPart.displayPart();	
		});
		
		var $label = $('<p></p>')
		$label.text('Input for ' + instrumentName);
		$label.css('display', 'inline')
		
		var $inputBox = $('<input type="text" name="textbox' + instrumentName + 
	      '" id="input_for_' + instrumentName + '" value="" >')
	      
		//$inputBox.prepend($label)
		$inputBox.css('display', 'block')
		$button.css('display', 'inline')
		
		//$inputBox.append($button)
		
		$inputBox.add($button);
		$canvasDiv.append($label, $inputBox)
		p.appendNewCanvas($canvasDiv);
		
		$("#canvases").append($canvasDiv);
		
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

