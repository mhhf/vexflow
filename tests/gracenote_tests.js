// VexFlow - Trill Tests

Vex.Flow.Test.GraceNote = {}

Vex.Flow.Test.GraceNote.Start = function() {
  module("Grace Notes");
  Vex.Flow.Test.runTest("Grace Note Basic", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runRaphaelTest("Grace Note Basic (Raphael)", Vex.Flow.Test.GraceNote.basic);
  Vex.Flow.Test.runTest("Grace Note Throws", Vex.Flow.Test.GraceNote.thrown);
  Vex.Flow.Test.runRaphaelTest("Grace Note Throws (Raphael)", Vex.Flow.Test.GraceNote.thrown);
  Vex.Flow.Test.runTest("Grace Note Doublings", Vex.Flow.Test.GraceNote.doublings);
  Vex.Flow.Test.runRaphaelTest("Grace Note Doublings (Raphael)", Vex.Flow.Test.GraceNote.doublings);
  Vex.Flow.Test.runTest("Grace Note Birls", Vex.Flow.Test.GraceNote.birls);
  Vex.Flow.Test.runRaphaelTest("Grace Note Birls (Raphael)", Vex.Flow.Test.GraceNote.birls);
  Vex.Flow.Test.runTest("Grace Note Grips", Vex.Flow.Test.GraceNote.grips);
  Vex.Flow.Test.runRaphaelTest("Grace Note Grips (Raphael)", Vex.Flow.Test.GraceNote.grips);
  Vex.Flow.Test.runTest("Grace Note Taurluaths", Vex.Flow.Test.GraceNote.taurluaths);
  Vex.Flow.Test.runRaphaelTest("Grace Note Taurluaths (Raphael)", Vex.Flow.Test.GraceNote.taurluaths);
}

Vex.Flow.Test.GraceNote.helper = function(options, contextBuilder, ctxWidth, staveWidth){
  var ctx = contextBuilder(options.canvas_sel, ctxWidth, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, staveWidth).addClef("treble").setContext(ctx).draw();
  return {
 	ctx: ctx,
 	stave: stave,
 	newNote: function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
 };
}

Vex.Flow.Test.GraceNote.basic = function(options, contextBuilder) {
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  // G grace note on low A
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.graceG));

  // D grace note on low A
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.graceD));

  // E grace note on low A
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.graceE));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteBasic");
}

Vex.Flow.Test.GraceNote.thrown = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  // A throw on high A
  notes.push(measure.newNote({
	keys: ["a/5"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.throwA));
    
  // G throw on high G
  notes.push(measure.newNote({
	keys: ["g/5"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.throwG));
  
  // D throw
  notes.push(measure.newNote({
	keys: ["d/5"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.throwD));
  
  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteThrows");
}

Vex.Flow.Test.GraceNote.doublings = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 625, 400);

  var notes = [];
  
  var doublingNotes = ['g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5'];
  var doublings = [Vex.Flow.GraceNoteGroup.ornaments.doublingLowG
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingLowA
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingB
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingC
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingD
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingE
  	, Vex.Flow.GraceNoteGroup.ornaments.doublingF]
  
  for (var d = 0; d < doublingNotes.length; d++) {
	  // Low G doubling
	  notes.push(measure.newNote({
		keys: [doublingNotes[d]],
		duration: "q",
		stem_direction: Vex.Flow.StaveNote.STEM_DOWN
	  }).addGraceNoteGroup(doublings[d]));
  }

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteDoublings");
}

Vex.Flow.Test.GraceNote.birls = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];

  // standard birl
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.birl));
  
  // extra low A birl
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.birlLeadingA));

  // G gracenote birl
  notes.push(measure.newNote({
	keys: ["a/4"],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.birlGraceG));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteBirls");
}

Vex.Flow.Test.GraceNote.grips = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  var validGripNotes = ['b/4', 'c/5', 'e/5', 'f/5', 'g/5', 'a/5'];
  
  for (var i = 0; i < validGripNotes.length; i++) {
	  notes.push(measure.newNote({
		keys: [validGripNotes[i]],
		duration: "q",
		stem_direction: Vex.Flow.StaveNote.STEM_DOWN
	  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.grip));
  }
  
  notes.push(measure.newNote({
	keys: ['a/4'],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.gripFromD));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteDoublings");
}

Vex.Flow.Test.GraceNote.taurluaths = function(options, contextBuilder){
  var measure = new Vex.Flow.Test.GraceNote.helper(options, contextBuilder, 500, 300);

  var notes = [];
  
  // Taurluaths on low A, B and C
  var taorluathNotes = ['a/4', 'b/4', 'c/5'];
  
  for (var t = 0; t < taorluathNotes.length; t++) {
	  notes.push(measure.newNote({
		keys: [taorluathNotes[t]],
		duration: "q",
		stem_direction: Vex.Flow.StaveNote.STEM_DOWN
	  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.taorluath));
  }
    
  notes.push(measure.newNote({
	keys: ['a/4'],
	duration: "q",
	stem_direction: Vex.Flow.StaveNote.STEM_DOWN
  }).addGraceNoteGroup(Vex.Flow.GraceNoteGroup.ornaments.taorluathFromD));

  Vex.Flow.Formatter.FormatAndDraw(measure.ctx, measure.stave, notes);
  ok(true, "GraceNoteTaurluaths");
}
