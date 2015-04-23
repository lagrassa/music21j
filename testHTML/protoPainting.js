function OrchestralScore(name){
	this.name = name
	this.notesFilledCount;
	if (typeof this.score == "undefined") {
		this.score = new music21.stream.Score();
	}
	if (typeof this.notesFilledCount == "undefined") {
		this.notesFilledCount = 0;
	}
	this.pianoMeasure = mixedMeasure;
	if (typeof this.partList == "undefined") {
		console.log("initialize partList as undefined")
		this.partList = [];
	}
	//this.splitPart = SplitPart(instrument, part)
	this.getSplitPart = function(selectedInstrument) {
		for (var i = 0; i < this.partList.length; i++ ) {
			var splitPart = this.partList[i];
			if (splitPart.instrument == selectedInstrument) {
				return splitPart;
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
		return selectedInstruments;
	}


	this.addRests = function (newSplitPart) {

		for (var splitPartWithRests = 0; splitPartWithRests < this.partList[0].p.flat.elements.length; splitPartWithRests++ ) {
			r = new music21.note.Rest()
			r.duration.quarterLength
			newSplitPart.p.get(0).append(r);
			while (newSplitPart.p.get(0).elements.length > os.notesFilledCount) {
				os.notesFilledCount++;
			}
			return splitPartWithRests;
		}
	}

	this.makeSplittedPart = function (instrument, p) {
		console.log(instrument);
		for (var i = 0; i < this.notesFilledCount; i++) {
			var r = new music21.note.Rest();
			var correspondingPianoNote = this.pianoMeasure.flat.elements[i]
			r.duration.quarterLength = correspondingPianoNote.duration.quarterLength
			p.get(0).append(r);
		}
		var newSplitPart = new SplitPart(instrument, p)
		this.partList.push(newSplitPart);
		this.score.insert(0,newSplitPart.p);


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
			if (this.p.get(0).elements.length-1 < notePlace &&  notePlace < os.notesFilledCount ){
				var r = new music21.note.Rest();				
				var correspondingPianoNote = os.pianoMeasure.elements[notePlace];
				r.duration.quarterLength = correspondingPianoNote.duration.quarterLength;
				this.p.get(0).elements[notePlace] = r;
				console.log("fills in missing rests");
			}
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
		if (p.get(0).elements.length > os.notesFilledCount) {
			os.notesFilledCount++;
		}
	}


}




/**
 *Creates the correct number of canvases with appropriate identifiers. 
 *in the future, this should correspond to the name of the instrument
 *creates partList (global variable) which are parts with currently one measure
 */

$('#createCanvases').click(function () {
	if (typeof(os) == "undefined" ) {
		os = new OrchestralScore('protoPainting score');
	}
	createCanvases();
});


function createCanvases() {
	$("#canvases").empty();

	if (typeof(os) == "undefined") {
		os = new OrchestralScore('protopainter orchestral score');
		console.log("created new os object");
	}
	var selectedInstruments = os.getSelectedInstruments();
	for (var i in selectedInstruments) {
		instrumentName = selectedInstruments[i]
		if (typeof(os.getSplitPart(instrumentName))=="undefined" ) {
			var p = new music21.stream.Part();
			var newMeasure = new music21.stream.Measure();
			p.append(newMeasure);			
			os.makeSplittedPart(instrumentName, p);
		} else {
			var p = os.getSplitPart(instrumentName).p;
		}
	}
	var $canvasDiv = $("<div class = 'canvasHolder' id = 'canvasDiv' align = 'left' > </div>");
	$("#canvases").append($canvasDiv);
	$canvasDiv.html("<b>" + "Score" + "</b>")
	os.score.appendNewCanvas($canvasDiv);

}
/**
 * Changes the appropriate canvases (very similar to createCanvases, might merge them)
 * 
 */
function displayParts() {
	var $specifiedCanvas = $('#canvasDiv');
	$specifiedCanvas.empty();
	var currentScore = os.score;
	currentScore.appendNewCanvas($specifiedCanvas);

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
		return undefined;
	}
	var minNoteDistance = 100; //some big number
	for (var i = 0; i< c.pitches.length; i++) {
		chordDNN= c.pitches[i].diatonicNoteNum;
		noteDistance = chordDNN-dNN;
		if (noteDistance < 0) {
			noteDistance = -1*noteDistance;
		}

		if (noteDistance < minNoteDistance  ) {
			minNoteDistance = noteDistance;
			correctdNN=c.pitches[i].diatonicNoteNum;
		}
	}

	var selectedNote = new music21.note.Note();
	selectedNote.pitch.diatonicNoteNum = correctdNN;
	var oneNoteChord = new music21.chord.Chord();
	oneNoteChord.duration.quarterLength = c.duration.quarterLength;
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
	if (typeof(oneNoteChord) == "undefined") {
		return;
	}
	assignNoteToParts(oneNoteChord, noteIndex);
	displayParts();
};


function assignNoteToParts(c,  noteIndex) {
	var selectedInstruments = os.getSelectedInstruments();
	for (var i = 0; i < selectedInstruments.length; i++) {
		var instrument = selectedInstruments[i];
		partToAppendTo = os.getSplitPart(instrument);
		partToAppendTo.addNoteToPart(c, noteIndex);

	}

}


function setupDemonstration(){
	var cChord=new music21.chord.Chord(['C5', 'E5', 'G5']);
	var c1 = new music21.chord.Chord(['C5']);
	var c2 = new music21.chord.Chord(['D5']);
	var c3 = new music21.chord.Chord(['E5']);
	var c4 = new music21.chord.Chord(['F5']);
	var c5 = new music21.chord.Chord(['G5']);
	var c6 = new music21.chord.Chord(['C5', 'G5']);
	var c7 = new music21.chord.Chord(['C5', 'E5']);
	var c8 = new music21.chord.Chord(['A5']);
	c8.duration.quarterLength = 2;
	var c9 = new music21.chord.Chord(['B5']);
	var c10 = new music21.chord.Chord(['E5', 'G5']);
	var c11 = new music21.chord.Chord(['B5', 'D5']);

	var gChord=new music21.chord.Chord(['G5', 'B5', 'D5']);
	var fChord=new music21.chord.Chord(['F5', 'A5', 'C5']);
	var amChord= new music21.chord.Chord(['A5', 'C5', 'E5']); 
	var shortChord = new music21.chord.Chord(['A5', 'C5']);
	mixedMeasure = new music21.stream.Measure();
	mixedMeasure.append(amChord);
	mixedMeasure.append(cChord);
	mixedMeasure.append(c1);
	mixedMeasure.append(c2);
	mixedMeasure.append(c3);
	mixedMeasure.append(c4);
	mixedMeasure.append(c5);
	mixedMeasure.append(c6);
	mixedMeasure.append(c7);
	mixedMeasure.append(c8);
	mixedMeasure.append(c9);
	mixedMeasure.append(c10);
	mixedMeasure.append(c11);

	mixedMeasure.append(gChord);
	mixedMeasure.append(fChord);


	/* for (var z = 0; z < 4; z++) {
for (var i = 0; i<chordArray.length; i++){
mixedMeasure.append(chordArray[i]);
}
} */
	mixedMeasure.renderOptions.events['click'] = clickFunction.bind(mixedMeasure); 
	var $canvasDivScore = $('#canvasDivScore');
	mixedMeasure.appendNewCanvas($canvasDivScore);


	$('#playSound').bind('click', function() {
		if (this.checked) {
			music21.jazzMidi.callBacks.general = midiCallbacksPlay;
		} else {
			music21.jazzMidi.callBacks.general = midiCallbacksNoPlay;
		}
	});
}
