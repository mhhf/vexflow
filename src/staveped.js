// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements varies types of ties between contiguous notes. The
// ties include: regular ties, hammer ons, pull offs, and slides.

/**
 * Create a new tie from the specified notes. The notes must
 * be part of the same line, and have the same duration (in ticks).
 *
 * @constructor
 * @param {!Object} context The canvas context.
 * @param {!Object} notes The notes to tie up.
 * @param {!Object} Options
 */
Vex.Flow.StavePed = function(notes) {
  if (arguments.length > 0) this.init(notes);
}

// TODO: release press as symbols and on short release/press on line
//
Vex.Flow.StavePed.prototype.init = function(notes) {
  /**
   * Notes is a struct that has:
   *
   *  {
   *    first_note: Note,
   *    last_note: Note,
   *    first_indices: [n1, n2, n3],
   *    last_indices: [n1, n2, n3]
   *  }
   *
   **/

  this.notes = notes;
  this.context = null;

  this.render_options = {
      first_x_shift: 0,
      last_x_shift: 0,
      y_shift: 29
    }

  this.font = this.render_options.font;
  this.setNotes(notes);
}

Vex.Flow.StavePed.prototype.setContext = function(context) {
  this.context = context;
  return this; }

/**
 * Set the notes to attach this tie to.
 *
 * @param {!Object} notes The notes to tie up.
 */
Vex.Flow.StavePed.prototype.setNotes = function(notes) {
  if (!notes.first_note && !notes.last_note)
    throw new Vex.RuntimeError("BadArguments",
        "Tie needs to have either first_note or last_note set.");

  if (!notes.first_indices) notes.first_indices = [0];
  if (!notes.last_indices) notes.last_indices = [0];

  if (notes.first_indices.length != notes.last_indices.length)
    throw new Vex.RuntimeError("BadArguments", "Tied notes must have similar" +
      " index sizes");

  // Success. Lets grab 'em notes.
  this.first_note = notes.first_note;
  this.first_indices = notes.first_indices;
  this.last_note = notes.last_note;
  this.last_indices = notes.last_indices;
  return this;
}

Vex.Flow.StavePed.prototype.renderPed = function(params) {
  if (params.first_ys.length == 0 || params.last_ys.length == 0)
    throw new Vex.RERR("BadArguments", "No Y-values to render");

  var ctx = this.context;

  var y_shift = this.render_options.y_shift;
	var first_y_px = params.first_ys[0] + y_shift;
	var last_y_px = params.last_ys[0] + y_shift;

	if (first_y_px < params.stave_y-15 ) first_y_px = params.stave_y-15;
	
	// Render PED symbol
	// console.log();
	Vex.Flow.renderGlyph(this.context, params.first_x_px -10, first_y_px, 38, "v36");


	if (isNaN(first_y_px) || isNaN(last_y_px))
		throw new Vex.RERR("BadArguments", "Bad indices for tie rendering.");

	ctx.beginPath();

	ctx.moveTo(params.first_x_px+22, first_y_px);
	ctx.lineTo(params.last_x_px , first_y_px);
	ctx.lineTo(params.last_x_px , first_y_px -14);
	ctx.stroke();
	ctx.closePath();
}

Vex.Flow.StavePed.prototype.draw = function() {
  if (!this.context)
    throw new Vex.RERR("NoContext", "No context to render tie.");
	if (!this.first_note || !this.last_note)
		throw new Vex.RERR("NoNote", "Missing note");

  var first_note = this.first_note;
  var last_note = this.last_note;
  var first_x_px, last_x_px, first_ys, last_ys;

	var n = last_note;
	var dur = n.getStave().getNoteEndX() - n.getStave().getNoteStartX();
	dur /= n.getDuration();



	first_x_px = first_note.getBoundingBox().x;
	first_ys = first_note.getYs();

	last_x_px = last_note.getBoundingBox().x + last_note.width + dur -10;
	last_ys = last_note.getYs();


  this.renderPed({
    first_x_px: first_x_px,
    last_x_px: last_x_px,
    first_ys: first_ys,
    last_ys: last_ys,
		stave_y: this.first_note.getStave().getBottomY()
  });

  return true;
}
