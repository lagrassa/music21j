/*
 
Require file for require.js

Call with

<script data-main="src/requireMain.js" src="ext/require/require.js"></script>

*/

require(['music21'], function(music21) {
	var n = new music21.Note("C#4");
	n.duration.type="half";
	var n2 = new music21.Note("F#4");
	n2.duration.type="half";
	var s = new music21.Stream();
	s.append(n);
	s.append(n2);
	
	s.appendNewCanvas();	
});