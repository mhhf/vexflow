// Vex Flow Notation
// Mohit Muthanna <mohit@muthanna.com>
//
// Copyright Mohit Muthanna 2013

/** @constructor */
Vex.Flow.TextNote = function(text_struct) {
  if (arguments.length > 0) this.init(text_struct);
}
Vex.Flow.TextNote.prototype = new Vex.Flow.Note();
Vex.Flow.TextNote.superclass = Vex.Flow.Note.prototype;
Vex.Flow.TextNote.constructor = Vex.Flow.TextNote;

Vex.Flow.TextNote.Justification = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3
};

Vex.Flow.TextNote.GLYPHS = {
  "segno": {
    code: "v8c",
    point: 40,
    x_shift: 0,
    y_shift: -10
    // width: 10 // optional
  },
  "tr": {
    code: "v1f",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "mordent": {
    code: "v1e",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "f": {
    code: "vba",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "p": {
    code: "vbf",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "m": {
    code: "v62",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "s": {
    code: "v4a",
    point: 40,
    x_shift: 0,
    y_shift: 0
    // width: 10 // optional
  },
  "coda": {
    code: "v4d",
    point: 40,
    x_shift: 0,
    y_shift: -8
    // width: 10 // optional
  }
}

Vex.Flow.TextNote.prototype.init = function(text_struct) {
  var superclass = Vex.Flow.TextNote.superclass;
  superclass.init.call(this, text_struct);

	if(text_struct.glyphs && text_struct.glyphs.length == 1) {
		text_struct.glyph = text_struct.glyphs;
		text_struct.glyphs = null;
	}


	// Note properties
  this.text = text_struct.text;
  this.glyph_type = text_struct.glyph;
  this.glyphs_type = text_struct.glyphs; // multiple glyphs support -> ff,pp, mf
  this.glyph = null;
  this.glyphs = null; // multiple glyphs
  this.font = {
    family: "Arial",
    size: 12,
    weight: ""
  }
	if( this.glyph_type && this.glyphs_type )
		throw new Vex.RERR("Please use glyphs_type for multiple glyphs");

  if (text_struct.font) this.font = text_struct.font;

	// multiple glyphes support
	if (this.glyphs_type) {
		var struct = new Array();
		this.glyphs = new Array();
		for (var i=0; i < this.glyphs_type.length; i++) {
			struct[i] = Vex.Flow.TextNote.GLYPHS[this.glyphs_type[i]];
			this.glyphs[i] = new Vex.Flow.Glyph( struct[i].code, struct[i].point, {cache: false});
		}

		// calculate width 
		var width = 0;
		for (var i=0; i < struct.length; i++) {
			if( struct[i].width ) {
				width += struct[i].width;
			} else {
				width += this.glyphs[i].getMetrics().width;
			}
		}
		this.setWidth(width);

		this.glyphs_struct = struct;
	} else if (this.glyph_type) {
    var struct = Vex.Flow.TextNote.GLYPHS[this.glyph_type];
    if (!struct) throw new Vex.RERR("Invalid glyph type: " + this.glyph_type);

    this.glyph = new Vex.Flow.Glyph(struct.code, struct.point, {cache: false});

    if (struct.width)
      this.setWidth(struct.width)
    else
      this.setWidth(this.glyph.getMetrics().width);

    this.glyph_struct = struct;
  } else {
    this.setWidth(Vex.Flow.textWidth(this.text));
  }

  this.line = text_struct.line || 0;
  this.smooth = text_struct.smooth || false;
  this.ignore_ticks = text_struct.ignore_ticks || false;
  this.justification = Vex.Flow.TextNote.Justification.LEFT;
}

Vex.Flow.TextNote.prototype.setJustification = function(just) {
  this.justification = just;
  return this;
}

Vex.Flow.TextNote.prototype.setLine = function(line) {
  this.line = line;
  return this;
}

// Pre-render formatting
Vex.Flow.TextNote.prototype.preFormat = function() {
  if (!this.context) throw new Vex.RERR("NoRenderContext",
      "Can't measure text without rendering context.");
  if (this.preFormatted) return;

  if (this.smooth) {
    this.setWidth(0);
  } else {
    if (this.glyph) {
      // Width already set.
    } else {
      this.setWidth(this.context.measureText(this.text).width);
    }
  }

  if (this.justification == Vex.Flow.TextNote.Justification.CENTER) {
    this.extraLeftPx = this.width / 2;
  } else if (this.justification == Vex.Flow.TextNote.Justification.RIGHT) {
    this.extraLeftPx = this.width;
  }

  this.setPreFormatted(true);
}

Vex.Flow.TextNote.prototype.draw = function() {
  if (!this.context) throw new Vex.RERR("NoCanvasContext",
      "Can't draw without a canvas context.");
  if (!this.stave) throw new Vex.RERR("NoStave", "Can't draw without a stave.");

  var ctx = this.context;
  var x = this.getAbsoluteX();
  if (this.justification == Vex.Flow.TextNote.Justification.CENTER) {
    x -= this.getWidth() / 2;
  } else if (this.justification == Vex.Flow.TextNote.Justification.RIGHT) {
    x -= this.getWidth();
  }

	if (this.glyphs) {
    var y = this.stave.getYForLine(this.line + (-3));
		var offset = 0;
		for (var i=0; i < this.glyphs.length; i++) {
			this.glyphs[i].render(this.context,
				x + this.glyphs_struct[i].x_shift + offset,
				y + this.glyphs_struct[i].y_shift
			);
			if( this.glyphs_struct[i].width ) {
				offset += (this.glyphs_struct[i].width);
			} else {
				offset += (this.glyphs[i].getMetrics().width);
			}
		}
	} else if (this.glyph) {
    var y = this.stave.getYForLine(this.line + (-3));
    this.glyph.render(this.context,
                      x + this.glyph_struct.x_shift,
                      y + this.glyph_struct.y_shift)
  } else {
    var y = this.stave.getYForLine(this.line + (-3));
    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    ctx.fillText(this.text, x, y);
    ctx.restore();
  }
}
