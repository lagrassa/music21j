function getSelectedInstruments() {
	var selectedInstruments = [];
	$('#instrumentSelect :checked').each(function() {
		selectedInstruments.push($(this).val());
	    });
	return selectedInstruments
}

function createCanvases() {
	var selectedInstruments=getSelectedInstruments()
	for (i=0; i<selectedInstruments.length; i++) {
		partToAdd= new music21.stream.Part()
		newNote= new music21.note.Note()
		newMeasure = new music21.stream.Measure()
		newMeasure.append(newNote);
		partToAdd.append(newMeasure)
		console.log(partToAdd)
		//$("#canvases").append("<div class = 'canvas' id='instrument' align = 'left' > </div>");
		$("#canvases").append("<div class = 'canvas' id='instrument' align = 'left' > </div>");
		//var $specifiedCanvas = $('.instrument:eq(' + i + ')');
		var $specifiedCanvas = $('.canvas:eq(' + i + ')');
		console.log($specifiedCanvas)
		partToAdd.appendNewCanvas($specifiedCanvas)
		console.log($specifiedCanvas)
		//var $instrument = $('.instrument')
		//$canvas.css('display', 'block');
	}
}

createCanvases()

