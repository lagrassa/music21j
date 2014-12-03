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

function createCanvases() {
	var selectedInstruments=getSelectedInstruments()
	partList = []
	for (var i = 0; i < selectedInstruments.length; i++) {
		var partToAdd= new music21.stream.Part()
		var newMeasure = new music21.stream.Measure()
		partToAdd.append(newMeasure)
		partList.append(partToAdd)
		$("#canvases").append("<div class = 'canvas' id='instrument' align = 'left' > </div>");
		var $specifiedCanvas = $('.canvas:eq(' + i + ')');
		partToAdd.appendNewCanvas($specifiedCanvas)
	}
}
/**
 * Changes the appropriate canvases (very similar to createCanvases, might merge them)
 * 
 */
function displayParts() {
	var selectedInstruments=getSelectedInstruments()
	for (var i = 0; i < selectedInstruments.length; i++) {
		var canvasIndex = parseInt(selectedInstruments[i])
		var $specifiedCanvas = $('.canvas:eq(' + canvasIndex + ')');
		$specifiedCanvas.empty();
		partList[i].appendNewCanvas($specifiedCanvas)
	}
}


/**
 * @params {Array} [chord.Chord, diatomicNoteNum]
 * @returns {chord.Chord} chord made from the selected note and chord
 */
function getNoteFromChordAndDNN(_) {
	c=_[0]
	dNN=_[1]
	var selectedNote = new music21.note.Note()
	selectedNote.pitch.diatonicNoteNum=dNN
	var oneNoteChord = new music21j.chord.Chord()
	oneNoteChord.append(selectedNote)
	console.log(oneNoteChord)
	return oneNoteChord
}


mixedPart.renderOptions.events['click'] = function (e) {
	console.log('click event')
    // this = canvas...
	if ( mixedPart != undefined) {
	    var _ = mixedPart.findNoteForClick(this, e);
	    var dNN = _[0];
	    var c = _[1];
	    var noteIndex = undefined
	    for (var i = 0; i < mixedPart.flat.elements.length; i++ ){
	    	if ( c === mixedPart.flat.elements[i] ) {
	    		noteIndex = i
	    		}
	    }
	}
	    	
	var oneNoteChord=getNoteFromChordAndDNN(_)
	assignNoteToParts(oneNoteChord, measureIndex, noteIndex)
	displayParts()
}

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

