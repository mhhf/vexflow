// VexFlow - Music Engraving for HTML5
// Copyright Mohit Muthanna 2010
//
// This class implements trill modifiers for notes.

/**
 * @constructor
 */
Vex.Flow.Trill = function(glyph) {
  this.init(glyph);
}
Vex.Flow.Trill.prototype = new Vex.Flow.Modifier();
Vex.Flow.Trill.prototype.constructor = Vex.Flow.Trill;
Vex.Flow.Trill.superclass = Vex.Flow.Modifier.prototype;

Vex.Flow.Trill.prototype.init = function(glyph) {
  var superclass = Vex.Flow.Trill.superclass;
  superclass.init.call(this);

  this.note = null;
  this.index = null;
  this.position = Vex.Flow.Modifier.Position.ABOVE;

  // Ensure a valid trill glyph
  if (!glyph) {
  	this.glyph = Vex.Flow.trillCodes.trills.tr;
  }
  else {
    for (var validGlyphs in Vex.Flow.trillCodes.trills) {
      if (glyph === Vex.Flow.trillCodes.trills[validGlyphs]) {
      	this.glyph = glyph;
      	break;
      }
  	}
  	if (!this.glyph) {
  		this.glyph = Vex.Flow.trillCodes.trills.tr;
  	}
  }
}

Vex.Flow.Trill.prototype.getCategory = function() { return "trills"; }
Vex.Flow.Trill.prototype.getNote = function() { return this.note; }
Vex.Flow.Trill.prototype.setNote = function(note)
  { this.note = note; return this; }
Vex.Flow.Trill.prototype.getIndex = function() { return this.index; }
Vex.Flow.Trill.prototype.setIndex = function(index) {
  this.index = index; return this; }

Vex.Flow.Trill.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoContext",
    "Can't draw trill without a context.");
  if (!(this.note && (this.index != null))) throw new Vex.RERR("NoAttachedNote",
    "Can't draw trill without a note and index.");

  var start = this.note.getModifierStartXY(this.position, this.index);
  var trill_x = (start.x + this.x_shift);
  var trill_y = this.note.getYForTopText(0) - 1;
  
  new Vex.Flow.Glyph(this.glyph, 30).render(this.context, trill_x, trill_y);
}
