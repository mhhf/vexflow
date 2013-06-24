/**
 * VexFlow - StavePed Tests
 * Copyright Mohit Muthanna 2010 <mohit@muthanna.com>
 */

Vex.Flow.Test.StavePed = {}

Vex.Flow.Test.StavePed.Start = function() {
  module("StavePed");
  Vex.Flow.Test.runTest("Simple StavePed", Vex.Flow.Test.StavePed.simple);
}

Vex.Flow.Test.StavePed.tieNotes = function(notes, stave, ctx) {
  var voice = new Vex.Flow.Voice(Vex.Flow.Test.TIME4_4);
  voice.addTickables(notes);

  var formatter = new Vex.Flow.Formatter().joinVoices([voice]).
    format([voice], 250);
  voice.draw(ctx, stave);

  var tie = new Vex.Flow.StavePed({
    first_note: notes[0],
    last_note: notes[1]
  });

  tie.setContext(ctx);
  tie.draw();
}

Vex.Flow.Test.StavePed.drawPad = function(notes, options) {
  Vex.Flow.Test.resizeCanvas(options.canvas_sel, 350, 140);
  var ctx = Vex.getCanvasContext(options.canvas_sel);
  ctx.scale(0.9, 0.9); ctx.fillStyle = "#221"; ctx.strokeStyle = "#221";
  var stave = new Vex.Flow.Stave(10, 10, 350).setContext(ctx).draw();

  Vex.Flow.Test.StavePed.tieNotes(notes, stave, ctx);
}

Vex.Flow.Test.StavePed.simple = function(options) {
  function newNote(note_struct) { return new Vex.Flow.StaveNote(note_struct); }
  function newAcc(type) { return new Vex.Flow.Accidental(type); }

  Vex.Flow.Test.StavePed.drawPad([
    newNote({ keys: ["c/4", "e/4", "a/4"], duration: "h"}).
      addAccidental(0, newAcc("b")).
      addAccidental(1, newAcc("#")),
    newNote({ keys: ["d/4", "e/4", "f/4"], duration: "h"})
  ], options);

  ok(true, "Simple Test");
}

