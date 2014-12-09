function orchestralScore(name){
	this.name = name
	if (typeof partList == "undefined") {
		this.partList = []
	}
	//this.splitPart = splitPart(instrument, part)
	this.getSplitPart = function(selectedInstrument) {
		for (var i =0; i < this.partList.length; i++ ) {
			var splitPart = this.partList[i]
			if (splitPart.instrument == selectedInstrument) {
				return splitPart
			}
		}
	}
	
	this.makeSplittedPart = function (instrument, p) {
		var newSplitPart = new splitPart(instrument, p)
		this.partList.push(newSplitPart)
	}
	function splitPart (instrument, p) {
		if (undefined === instrument) {
			this.instrument = 'piano';
		} else {
			this.instrument = instrument;
		}
		if (p  == "undefined") {
			this.p = new music21.stream.Part();
			var m = new music21.stream.Measure()
			p.append(m);
		} else {
			this.p = p;
		}
		
		this.addNoteToPart = function (c, offsetIndex) {	
			c.offset = offsetIndex
			this.p.append(c);
		}
		
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
		os= new orchestralScore('protoPainting score')
	createCanvases();
});


function createCanvases() {
	$("#canvases").empty();
	var selectedInstruments=getSelectedInstruments();
	for (var i in selectedInstruments) {
		instrumentName = selectedInstruments[i]
		var p= new music21.stream.Part();
		var newMeasure = new music21.stream.Measure();
		p.append(newMeasure);
		$("#canvases").append("<div class = 'canvas' id='instrument' align = 'left' > </div>");
		var $specifiedCanvas = $('.canvas:eq(' + i + ')');
		$specifiedCanvas.text(instrumentName)
		try {
			os.makeSplittedPart(instrumentName, p)
		}
		catch (err){
			os = new orchestralScore('protopainter orchestral score')
		}
		p.appendNewCanvas($specifiedCanvas);
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
		var $specifiedCanvas = $('.canvas:eq(' + instrumentName + ')');
		$specifiedCanvas.empty();
		os.getSplitPart(instrumentName).p.appendNewCanvas($specifiedCanvas);
	}
}


/**
 * @params {Array} [chord.Chord, diatomicNoteNum]
 * @returns {chord.Chord} chord made from the selected note and chord
 */
function getNoteFromChordAndDNN(_) {
	c=_[0];
	dNN=_[1];
	var selectedNote = new music21.note.Note();
	selectedNote.pitch.diatonicNoteNum=dNN;
	var oneNoteChord = new music21.chord.Chord();
	selectedNote.offset = c.offset
	oneNoteChord.add(selectedNote);
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


