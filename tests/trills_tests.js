// VexFlow - Trill Tests

Vex.Flow.Test.Trill = {}

Vex.Flow.Test.Trill.Start = function() {
  module("Trill");
  Vex.Flow.Test.runTest("Trill", Vex.Flow.Test.Trill.basic);
  Vex.Flow.Test.runRaphaelTest("Trill (Raphael)",
      Vex.Flow.Test.Trill.basic);
}

Vex.Flow.Test.Trill.basic = function(options, contextBuilder) {
  var ctx = contextBuilder(options.canvas_sel, 500, 240);
  ctx.scale(1.5, 1.5); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 300).
    addClef("treble").setContext(ctx).draw();

  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }

  // var notes = [
  	// newNote({ keys: ["d/4"], duration: "h"}).addTrill(),
    // newNote({ keys: ["f/4"], duration: "h"}).addTrill(),
    // //newNote({ keys: ["a/4"], duration: "w"}).addTrill(Vex.Flow.trillCodes.trills.turn),
    // newNote({ keys: ["a/4"], duration: "h"}).addTrill(),
    // newNote({ keys: ["c/5"], duration: "h"}).addTrill(Vex.Flow.trillCodes.trills.mordent),
    // newNote({ keys: ["e/5"], duration: "h"}).addTrill(Vex.Flow.trillCodes.trills.mordentTurn)
  // ];
  var notes = [];
  
  // Not all the trill types are present in the Vex.Flow.Font.glyphs object
  function fontContains(code){
  	return Vex.Flow.Font.glyphs[code];
  }
  
  for (var trillType in Vex.Flow.trillCodes.trills) {
  	if (fontContains(Vex.Flow.trillCodes.trills[trillType])) {
  	  notes.push(newNote({ keys: ["d/4"], duration: "h"}).addTrill(Vex.Flow.trillCodes.trills[trillType]));
	}
  }

  notes.push(newNote({ keys: ["e/5"], duration: "w"}).addTrill());

  Vex.Flow.Formatter.FormatAndDraw(ctx, stave, notes, 100);
  ok(true, "Trill");
}
