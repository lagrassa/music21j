function OrchestralScore(name){
	this.name = name
	this.pianoMeasure = mixedMeasure;
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
	
	this.addNoteToPart = function (c, noteIndex) {	
		for (var notePlace = 0; notePlace < noteIndex; notePlace++){
			if (typeof(this.p.get(0).elements[notePlace]) == "undefined") {
				var r = new music21.note.Rest();
				if (typeof(os) == "undefined") {
					console.log("No orchestral score was created yet");
					return;
				}
				var correspondingPianoNote = os.pianoMeasure.elements[notePlace];
				r.duration.quarterLength = correspondingPianoNote.duration.quarterLength;
				this.p.get(0).elements[notePlace] = r;
			}
		}
		this.p.get(0).elements[noteIndex] = c;
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
		$("#canvases").append($canvasDiv);
		$canvasDiv.html("<b>" + instrumentName + "</b>")
		
		
		
		
		//Checks to see if splitPart with that name already exists and makes one if not
		
		if (typeof (os.getSplitPart(instrumentName))=="undefined" ) {
			os.makeSplittedPart(instrumentName, p);
		}

		p.appendNewCanvas($canvasDiv);
	}
}
/**
 * Changes the appropriate canvases (very similar to createCanvases, might merge them)
 * 
 */
function displayParts() {
	for (var sp = 0; sp < os.partList.length; sp++) {
		splitPart = os.partList[sp];
		var $specifiedCanvas = $('#instrument_'  + splitPart.instrument);
		$specifiedCanvas.empty();
		var thisPart = splitPart.p;
		thisPart.appendNewCanvas($specifiedCanvas);
	}
}


/**
 * @params {Array} [chord.Chord, diatomicNoteNum]
 * @returns {chord.Chord} chord made from the selected note and chord
 */
function getNoteFromChordAndDNN(_) {
	console.log(_)
	dNN = _[0];
	c = _[1];
	if (typeof(c) == "undefined") {
		console.log('undefined chord');
		return undefined
	}
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
	oneNoteChord.add(selectedNote);
	console.log(oneNoteChord.pitches[0].name);
	return oneNoteChord;
}


var clickFunction = function (e) {
	var canvasElement = e.currentTarget;
    var _ = this.findNoteForClick(canvasElement, e);
    var dNN = _[0];
    var c = _[1];
    var noteIndex = undefined;
    for (var i = 0; i < this.flat.elements.length; i++ ){
    	if ( c === this.flat.elements[i] ) {
    		noteIndex = i;
    	}
    }
	var oneNoteChord=getNoteFromChordAndDNN(_)
	if (typeof(oneNoteChord)=="undefined") {
		return;
	}
	assignNoteToParts(oneNoteChord, noteIndex)
	displayParts()
};


function assignNoteToParts(c,  noteIndex) {
	var selectedInstruments = os.getSelectedInstruments();
	for (var i = 0; i < selectedInstruments.length; i++) {
		var instrument = selectedInstruments[i];
		partToAppendTo = os.getSplitPart(instrument);
		partToAppendTo.addNoteToPart(c, noteIndex);
		
	}
	
}
/*
 * @params chord.Chord one note chord to be added
 * 
 * Adds the note to all of the selected parts. Consider 
 * finding a way to do this without using global variables...
 */


