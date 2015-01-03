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
	
	this.hold = function (pianoChord) {
		measureNumber = 0;
		var allElements = this.p.flat.elements
		if (allElements.length > 1) {
			var last = allElements[allElements.length-1];
		} else {
			var last = allElements[0];
		}
		if (last.isRest) {
			var held = new music21.note.Rest();
		} else {
			var held = new music21.note.Note();
			held.pitch = last.pitch;
		}
		//held.duration.quarterLength = last.duration.quarterLength + pianoChord.duration.quarterLength
		//held.type = music21.duration.typeFromNumDict[held.duration.quarterLength]
		last.tie=  new music21.tie.Tie("start")
		held.tie = new music21.tie.Tie("stop")
		if (last.tie.type == 'stop') {
			last.tie.type = new music21.tie.Tie('continue');
		}
		this.p.get(measureNumber).append(held)
		
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
	var displayedPartName = $('#inputPart').val()
	var newPartName = displayedPartName.replace(" ", "");
	os.addPart(newPartName);
	$('#inputPart').val('');
	$newPartName = $('<p> </p>')
	$newPartName.text(displayedPartName)
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
		instrumentDisplayedName = selectedInstruments[i]
		var instrumentName = instrumentDisplayedName.replace(" ", "");
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
		$label.text('Input for ' + instrumentDisplayedName);
		$label.css('display', 'inline')
		
		var $inputBox = $('<input type="text" name="textbox' + instrumentName + 
	      '" id="input_for_' + instrumentName + '" value="" >')
	      
		$inputBox.css('display', 'block')
		$button.css('display', 'block')
		

		
		
		$canvasDiv.append($label, $button, $inputBox)
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
			} else if ( char == 'h') {
				splitPart.hold(pianoChord);
			} else if ( typeof(parseInt(char)) == "number") {
				splitPart.addNote(parseInt(char), pianoChord);
			}	else {
				alert("At position " + i + "there is an invalid character.")
			}
		}
	}
}

