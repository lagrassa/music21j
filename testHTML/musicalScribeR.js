function setupScribe() {
	t = new music21.stream.Measure();
    b = new music21.stream.Measure();
    tPart = new music21.stream.Part();
    bPart = new music21.stream.Part();
    tPart.append(t);
    bPart.append(b);
    sc= new music21.stream.Score();
    sc.insert(0, tPart);
    sc.insert(0, bPart);
    t.clef = new music21.clef.TrebleClef();
    b.clef = new music21.clef.BassClef();

    t.renderOptions.scaleFactor = {x: 1.5, y: 1.5};
    b.renderOptions.scaleFactor = {x: 1.5, y: 1.5};
    metro = new music21.tempo.Metronome();
    // metro.addDiv($("#metronomeDiv"));
    
    music21.miditools.metronome = metro;
    k = new music21.keyboard.Keyboard();
    k.showNames = true;
    
    k.scaleFactor = 2.0;
    k.startPitch = 22;
    k.endPitch = k.startPitch + 14;
    k.scrollable = true;
    k.hideable = true;
    
    var $kd = $('#keyboardDiv');
    k.appendKeyboard($kd); // 25key keyboard
    
    var playSound = true;
                
    var midiCallbacksPlay = [music21.miditools.makeChords, 
                             music21.miditools.sendToMIDIjs,
                             music21.keyboard.jazzHighlight.bind(k)];
    
    var midiCallbacksNoPlay = [music21.miditools.makeChords, 
                               music21.keyboard.jazzHighlight.bind(k)];
    
    lastRestStream = t;
    lastNoteStream = b;

    var Jazz = music21.jazzMidi.createPlugin();
    music21.jazzMidi.createSelector($("#putMidiSelectHere"), Jazz);
    music21.jazzMidi.callBacks.general = [music21.miditools.makeChords, 
                                          music21.miditools.sendToMIDIjs,
                                          music21.keyboard.jazzHighlight.bind(k)];
    music21.jazzMidi.callBacks.sendOutChord = appendElement;
    
    $('#markC').bind('click', function () { k.markC = this.checked; k.redrawSVG() })
    $('#showNames').bind('click', function () { k.showNames = this.checked; k.redrawSVG() })
    $('#showOctaves').bind('click', function () { k.showOctaves = this.checked; k.redrawSVG() })

    $('#playSound').bind('click', function() {
        if (this.checked) {
            music21.jazzMidi.callBacks.general = midiCallbacksPlay;
        } else {
            music21.jazzMidi.callBacks.general = midiCallbacksNoPlay;
        }
    });
}

//Will be changed if I decide to use something more sophisticated than a global variable
function getStreamLength(){
	if (typeof(globalStreamLength)=="undefined"){
		var streamLength=5;
	} else{
		var streamLength = globalStreamLength;
	}
	return streamLength;
}

var useOneStaffAlways = false;

function hideStaff(){
	//hides the canvas that isn't selected
	var $checked = $('#staffSelect').find('input[type="radio"]:checked').val();
	console.log($checked);
	if ($checked == 'bassOnly') {
		$('#canvasDivTreble').hide();
		$('#canvasDivBass').show();
		console.log('treble hidden')
	}
	else if ($checked == 'trebleOnly') {
		$('#canvasDivTreble').show();
		$('#canvasDivBass').hide();
		console.log('bass hidden')	
	}
	if (useOneStaffAlways !== false) {
		return;
	}
	//other case hides the rest stream
	else if ( lastNoteStream != t && t.get(-1).isRest == true) {
		$('#canvasDivBass').show();
		$('#canvasDivTreble').hide();
		console.log('hid treble because it was a rest stream')
	}
	else if (lastNoteStream != b && b.get(-1).isRest == true ) {
		$('#canvasDivTreble').show();
		$('#canvasDivBass').hide();
		console.log('hid bass because it was a rest stream')
	} else { 
		$('#canvasDivTreble').show();
		$('#canvasDivBass').show();
		console.log('Recognized that I should show both')
	}
		
}

function getSelectedStaff() {
		var trebleOnly = false;
		var bassOnly = false;
		var $checked = $('#staffSelect').find('input[type="radio"]:checked').val();
		
		if ($checked == 'bassOnly') {
			bassOnly = true;
			trebleOnly = false;			
		}
		if ($checked=='trebleOnly') {
			trebleOnly = true; 
			bassOnly = false; 
		}
		
		return [trebleOnly, bassOnly];
}


/**
 * Automatically called when a note or chord is played.
 * Calls append functions for notes and chords separately, 
 * then appends the updated stream to the score canvas.
 * 
 * @param appendObject Note or chord; 
 * @param {int} streamLength - length of the measure
 * @returns undefined
 */


function appendElement(appendObject) {	
	var streamLength=getStreamLength();

	if (appendObject.isNote) {
		var appendChord = new music21.chord.Chord();
		appendChord.add(appendObject.pitch);
	} else if (appendObject.isChord) {
		appendChord = appendObject;
	} else {
		console.log('Can only take notes or chords');
		return;
	}
	appendChordToScore(appendChord, streamLength);
	if (t.length > 0 && music21.miditools.lastElement != undefined ) {
		t.get(-1).duration = music21.miditools.lastElement.duration;
	}
	if (b.length > 0 && music21.miditools.lastElement != undefined) {
		b.get(-1).duration = music21.miditools.lastElement.duration;
	}
	
	displayParts();
}

function displayParts(){
	if 	($('#separatedValue').text() == 0) {
	    var $canvasDivScore = $("#canvasDivScore");    
	    $canvasDivScore.empty();        
		sc.appendNewCanvas($canvasDivScore);
	
	} else if ( $('#separatedValue').text() == 1) {
		// create if statements depending on [00] [10] etc and append only correct part
		var $canvasDivEither = $("#canvasDivEither");
		$canvasDivEither.empty();
		sc.appendNewCanvas($canvasDivEither);
		
		var $canvasDivTreble=$("#canvasDivTreble");
		$canvasDivTreble.empty();
		t.appendNewCanvas($canvasDivTreble);
		
		var $canvasDivBass=$("#canvasDivBass");
		$canvasDivBass.empty();
		b.appendNewCanvas($canvasDivBass);

		hideStaff();
		
	} else {
		console.log(" I can't tell if you want the streams separated or not");
	}
}
/**
 * 
 * @param {int} streamLength - length of the measure
 * @param {chord.Chord} appendObject fixes duration of chord and appends it to score
 */
function appendChordToScore(appendObject, streamLength) {
	var separatedChords = separateChord(appendObject);

	var treblePartOfChord = separatedChords[0];
	var bassPartOfChord = separatedChords[1];
	
	var newRest = new music21.note.Rest();
	newRest.duration = appendObject.duration.clone();
    fixRestDuration(lastRestStream, lastNoteStream);
    appendChordsToStreams(t, treblePartOfChord, newRest, streamLength);
    appendChordsToStreams(b, bassPartOfChord, newRest, streamLength);	
}
/**
 * 
 * @param {stream} s -stream that chord will be appended to
 * @param {chord.Chord} chordToAppend 
 * @param {note.Rest} newRest - a rest with the correct duration
 * @param {int} streamLength - length of the measure
 */
function appendChordsToStreams(s, chordToAppend, newRest, streamLength) {
	if (chordToAppend.pitches.length > 0) {
		s.append(chordToAppend);
		lastNoteStream = s;
	} else if (chordToAppend.pitches.length == 0) {
        s.append(newRest);
        lastRestStream = s;
	}
	shortenStream(s, streamLength);
}


function consolidateRests(s){
	var notes = s.elements;
	var i = 0;
	beginRestIndex = null;
	while (i < notes.length) {
		while (notes[i].isRest()) {
			if (beginRestIndex == null) {
				var beginRestIndex = i;
			} 
			var restLength = restLength+notes[i].duration.quarterLength();
			i++;
		} 
		
		if (restLength>0) {
			var endRestIndex = i;
			var before_rest = s.elements.slice(0,beginRestIndex);
			var after_rest = s.elements.slice(endRestIndex);
			var r = new music21.note.Rest();
			r.duration.quarterLength = restLength;
			before_rest.push(r);
			s.elements=before_rest + after_rest;
			
		}
		var restLength=0;
		beginRestIndex = null;
		var endRestIndex = null;
		i++;
		}
		
	}


/**
 * Takes a chord and creates two chords in separate staves
 * 
 * @param rawChord Chord
 * @returns {Array<music21.chord.Chord>} Two element array: [0] Treble; [1] Bass
 */
function separateChord(rawChord, options) {
	var params = {
			maxSpread: 6, //max spread of diatonic note numbers in a single chord
			splitPoint: 29, //middle C
			};
	music21.common.merge(params, options);
	
	var selectedStaves = getSelectedStaff();
	var trebleOnly = selectedStaves[0];
	var bassOnly = selectedStaves[1];
	
	var i = 0;
	var treblePartOfChord = new music21.chord.Chord();
	var bassPartOfChord = new music21.chord.Chord();
	
	var topdNN = rawChord.pitches[rawChord.pitches.length-1].diatonicNoteNum
	var bottomdNN = rawChord.pitches[0].diatonicNoteNum

	var maxSpread = params.maxSpread;
	var splitPoint = params.splitPoint;
	
	if (topdNN - bottomdNN < maxSpread ) {
		var midpoint = ( (topdNN + bottomdNN ) / 2.0)
		if (midpoint >= splitPoint) {
			trebleOnly = true
		} else if (midpoint < splitPoint) {
			bassOnly = true
		}
	} 
	
	while ( i < rawChord.pitches.length) {	
		var noteInChord = new music21.note.Note();
		noteInChord.pitch = rawChord.pitches[i];
		noteInChord.duration = rawChord.duration;
	
		if ((noteInChord.pitch.octave >= 4 && bassOnly == false) || trebleOnly == true) {
			treblePartOfChord.add(noteInChord);		
		} else if ((noteInChord.pitch.octave < 4 && trebleOnly == false) || bassOnly == true) {
			bassPartOfChord.add(noteInChord);
		}
		
		i++;
	}
	return [treblePartOfChord, bassPartOfChord];
}

	
function fixRestDuration(streamToBeFixed, correctStream){
	if (streamToBeFixed.elements.length == 0 || correctStream.elements.length == 0 ){
		return undefined;
	}
	var previousNote=(streamToBeFixed.elements[streamToBeFixed.elements.length-1]);
	previousNote.duration = correctStream.elements[correctStream.elements.length-1].duration.clone();
	
	return streamToBeFixed;
}	

/**
 * 
 * @param {stream} s -any stream with a recently appended object
 * @param {int} streamLength - length of the measure
 * @returns {stream} s -the stream with a length no longer than streamLength
 */
function shortenStream(s, streamLength) {	
	var streamLength = getStreamLength();
	if (s.elements.length > streamLength) {
			var difference = s.elements.length-streamLength;
			s.elements = s.elements.slice(difference);  		    
	}
	return s;
}

$('#changeStreamLength').click(function () {
	globalStreamLength = parseInt($('#inputStreamLength').val());
	shortenStream(t, globalStreamLength);
	shortenStream(b, globalStreamLength);
	displayParts();
}); 

$('#addPart').click(function ()  {
	var displayedPartName = $('#inputPart').val()
	var newPartName = displayedPartName.replace(" ", "");
	os.addPart(newPartName);
	$newPartName = $('<p> </p>')
	$newPartName.text(displayedPartName)
	$('#existingParts').append($newPartName)
});
