/**
 * Called by create canvases to determine which instruments were selected
 * @returns {Array} [instruments] returns a list of instrument identifiers that correspond to jQuery canvases
 */

function getSelectedInstruments() {
	var selectedInstruments = [];
	$('#instrumentSelect :checked').each(function() {
		selectedInstruments.push($(this).val());
	    });
	return selectedInstruments
}

/**
*Creates the correct number of canvases with appropriate identifiers. 
*in the future, this should correspond to the name of the instrument
*creates partList (global variable) which are parts with currently one measure
*/

$('#createCanvases').click(function () {
	createCanvases();
});


function createCanvases() {
	$("#canvases").empty()
	var selectedInstruments=getSelectedInstruments();
	partList = [];
	for (var i = 0; i < selectedInstruments.length; i++) {
		var partToAdd= new music21.stream.Part();
		var newMeasure = new music21.stream.Measure();
		partToAdd.append(newMeasure);
		partList.push(partToAdd);
		$("#canvases").append("<div class = 'canvas' id='instrument' align = 'left' > </div>");
		var $specifiedCanvas = $('.canvas:eq(' + i + ')');
		partToAdd.appendNewCanvas($specifiedCanvas);
	}
}
/**
 * Changes the appropriate canvases (very similar to createCanvases, might merge them)
 * 
 */
function displayParts() {
	var selectedInstruments=getSelectedInstruments();
	for (var i = 0; i < selectedInstruments.length; i++) {
		var canvasIndex = parseInt(selectedInstruments[i]);
		var $specifiedCanvas = $('.canvas:eq(' + canvasIndex + ')');
		$specifiedCanvas.empty();
		partList[i].appendNewCanvas($specifiedCanvas);
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
	oneNoteChord.add(selectedNote);
	console.log(oneNoteChord);
	return oneNoteChord;
}


var clickFunction = function (e) {
	console.log('click event');
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
	assignNoteToParts(oneNoteChord, noteIndex)
	displayParts()
};



/*
 * @params chord.Chord one note chord to be added
 * 
 * Adds the note to all of the selected parts. Consider 
 * finding a way to do this without using global variables...
 */
function assignNoteToParts(c, noteIndex) {
	var selectedInstruments = getSelectedInstruments();
	
	for (var i = 0; i<selectedInstruments.length; i++) {
		var partToAppendTo = partList[parseInt(selectedInstruments[i])]
		partToAppendTo.flat.elements[noteIndex] = c
	}
}

