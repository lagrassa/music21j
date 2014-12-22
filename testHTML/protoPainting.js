function OrchestralScore(name){
	this.name = name
	if (typeof this.partList == "undefined") {
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
	
	this.makeSplittedPart = function (instrument, p) {
		var newSplitPart = new SplitPart(instrument, p)
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
}

/**
 * Called by create canvases to determine which instruments were selected
 * @returns {Array} selected instruments returns a list of instrument identifiers that correspond to jQuery canvases
 */
function getSelectedInstruments() {
	var selectedInstruments = [];
	$('#instrumentSelect :checked').each(function() {
		selectedInstruments.push($(this).val());
	    });
	var totalInstruments = []
	return selectedInstruments
}

/**
*Creates the correct number of canvases with appropriate identifiers. 
*in the future, this should correspond to the name of the instrument
*creates partList (global variable) which are parts with currently one measure
*/

$('#createCanvases').click(function () {
	os= new OrchestralScore('protoPainting score')
	createCanvases();
});


function createCanvases() {
	$("#canvases").empty();
	var selectedInstruments = getSelectedInstruments();
	for (var i in selectedInstruments) {
		instrumentName = selectedInstruments[i]
		var p = new music21.stream.Part();
		var newMeasure = new music21.stream.Measure();
		p.append(newMeasure);
		var $canvasDiv = $("<div class = 'canvasHolder' id='instrument_" + instrumentName + "' align = 'left' > </div>");
		$("#canvases").append($canvasDiv);
		$canvasDiv.html("<b>" + instrumentName + "</b>")
		
		if (typeof(os) == "undefined") {
			os = new OrchestralScore('protopainter orchestral score')
		}
		
		os.makeSplittedPart(instrumentName, p) 
		p.appendNewCanvas($canvasDiv);
	}
}
/**
 * Changes the appropriate canvases (very similar to createCanvases, might merge them)
 * 
 */
function displayParts() {
	var selectedInstruments=getSelectedInstruments();
	for (var i = 0; i < selectedInstruments.length; i++) {
		instrumentName = selectedInstruments[i];
		var $specifiedCanvas = $('#instrument_'  + instrumentName);
		$specifiedCanvas.empty();
		var splittedPart = os.getSplitPart(instrumentName);
		var thisPart = splittedPart.p;
		thisPart.appendNewCanvas($specifiedCanvas);
	}
}


/**
 * @params {Array} [chord.Chord, diatomicNoteNum]
 * @returns {chord.Chord} chord made from the selected note and chord
 */
function getNoteFromChordAndDNN(_) {
	dNN = _[0];
	c = _[1];
	console.log(c);
	console.log(dNN);
	var minNoteDistance = 100; //some big number
	for (var i = 0; i< c.pitches.length; i++) {
		chordDNN= c.pitches[i].diatonicNoteNum
		noteDistance = chordDNN-dNN;
		if (noteDistance < 0) {
			noteDistance = -1*noteDistance
		}
		
		if (noteDistance < minNoteDistance  ) {
			minNoteDistance = noteDistance;
			correctdNN=c.pitches[i].diatonicNoteNum;
		}
	}
	
	var selectedNote = new music21.note.Note();
	selectedNote.pitch.diatonicNoteNum=correctdNN;
	var oneNoteChord = new music21.chord.Chord();
	selectedNote.offset = c.offset
	oneNoteChord.add(selectedNote);
	console.log(oneNoteChord.pitches[0].name);
	return oneNoteChord;
}


var clickFunction = function (e) {
	var canvasElement = e.currentTarget;
    var _ = this.findNoteForClick(canvasElement, e);
    var dNN = _[0];
    var c = _[1];
    var noteIndex = undefined
    for (var i = 0; i < this.flat.elements.length; i++ ){
    	if ( c === this.flat.elements[i] ) {
    		noteIndex = i
    	}
    }
	var oneNoteChord=getNoteFromChordAndDNN(_)
	offsetIndex = oneNoteChord.offset
	assignNoteToParts(oneNoteChord, offsetIndex)
	displayParts()
};


function assignNoteToParts(c,  offsetIndex) {
	var selectedInstruments = getSelectedInstruments();
	for (var i = 0; i < selectedInstruments.length; i++) {
		var instrument = selectedInstruments[i];
		partToAppendTo = os.getSplitPart(instrument);
		partToAppendTo.addNoteToPart(c, offsetIndex);
		
	}
}
/*
 * @params chord.Chord one note chord to be added
 * 
 * Adds the note to all of the selected parts. Consider 
 * finding a way to do this without using global variables...
 */


