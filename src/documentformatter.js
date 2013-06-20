/**
 * DocumentFormatter - format and display a Document
 * @author Daniel Ringwalt (ringw)
 */

/**
 * Accepts document as argument and draws document in discrete blocks
 *
 * @param {Vex.Flow.Document} Document object to retrieve information from
 * @constructor
 */
Vex.Flow.DocumentFormatter = function(document) {
  if (arguments.length > 0) this.init(document);
}

Vex.Flow.DocumentFormatter.prototype.init = function(document) {
  if (typeof document != "object")
    throw new Vex.RERR("ArgumentError",
      "new Vex.Flow.DocumentFormatter() requires Document object argument");
  this.document = document;

  // Groups of measures are contained in blocks (which could correspond to a
  // line or a page of music.)
  // Each block is intended to be drawn on a different canvas.
  // Blocks must be managed by the subclass.
  this.measuresInBlock = []; // block # -> array of measure # in block
  this.blockDimensions = []; // block # -> [width, height]

  // Stave layout managed by subclass
  this.vfStaves = []; // measure # -> stave # -> VexFlow stave

  // Minimum measure widths can be used for formatting by subclasses
  this.minMeasureWidths = [];
  // minMeasureHeights:
  //  this.minMeasureHeights[m][0] is space above measure
  //  this.minMeasureHeights[m][s+1] is minimum height of stave s
  this.minMeasureHeights = [];
}

/**
 * Vex.Flow.DocumentFormatter.prototype.getStaveX: to be defined by subclass
 * Params: m (measure #), s (stave #)
 * Returns: x (number)
 */

/**
 * Calculate vertical position of stave within block
 * @param {Number} Measure number
 * @param {Number} Stave number
 */
Vex.Flow.DocumentFormatter.prototype.getStaveY = function(m, s) {
  // Default behavour: calculate from stave above this one (or 0 for top stave)
  // (Have to make sure not to call getStave on this stave)
  // If s == 0 and we are in a block, use the max extra space above the
  // top stave on any measure in the block
  if (s == 0) {
    var extraSpace = 0;
    // Find block for this measure
    this.measuresInBlock.forEach(function(measures) {
      if (measures.indexOf(m) > -1) {
        var maxExtraSpace = 50 - (new Vex.Flow.Stave(0,0,500).getYForLine(0));
        measures.forEach(function(measure) {
          var extra = this.getMinMeasureHeight(measure)[0];
          if (extra > maxExtraSpace) maxExtraSpace = extra;
        }, this);
        extraSpace = maxExtraSpace;
        return;
      }
    }, this);
    return extraSpace;
  }

  var higherStave = this.getStave(m, s - 1);
  return higherStave.y + higherStave.getHeight();
}

/**
 * Vex.Flow.DocumentFormatter.prototype.getStaveWidth: defined in subclass
 * Params: m (measure #), s (stave #)
 * Returns: width (number) which should be less than the minimum width
 */

/**
 * Create a Vex.Flow.Stave from a Vex.Flow.Measure.Stave.
 * @param {Vex.Flow.Measure.Stave} Original stave object
 * @param {Number} x position
 * @param {Number} y position
 * @param {Number} width of stave
 * @return {Vex.Flow.Stave} Generated stave object
 */
Vex.Flow.DocumentFormatter.prototype.createVexflowStave = function(s, x,y,w) {
  var vfStave = new Vex.Flow.Stave(x, y, w);
  s.modifiers.forEach(function(mod) {
    switch (mod.type) {
      case "clef": vfStave.addClef(mod.clef); break;
      case "key": vfStave.addKeySignature(mod.key); break;
      case "time":
        var time_sig;
        if (typeof mod.time == "string") time_sig = mod.time;
        else time_sig = mod.num_beats.toString() + "/"
                      + mod.beat_value.toString();
        vfStave.addTimeSignature(time_sig);
        break;
    }
  });
	if(s.time && false){
		var time_sig;
		if (typeof s.time == "string") 
		{ 
			time_sig = s.time; 
		} else {
			time_sig = s.time.num_beats.toString() + "/" + s.time.beat_value.toString();
		}
		vfStave.addTimeSignature(time_sig);
	}
  if (typeof s.clef == "string") vfStave.clef = s.clef;
  return vfStave;
}

/**
 * Use getStaveX, getStaveY, getStaveWidth to create a Vex.Flow.Stave from
 * the document and store it in vfStaves.
 * @param {Number} Measure number
 * @param {Number} Stave number
 * @return {Vex.Flow.Stave} Stave for the measure and stave #
 */
Vex.Flow.DocumentFormatter.prototype.getStave = function(m, s) {
  if (m in this.vfStaves && s in this.vfStaves[m])
    return this.vfStaves[m][s];
  if (typeof this.getStaveX != "function"
      || typeof this.getStaveWidth != "function")
    throw new Vex.RERR("MethodNotImplemented",
                "Document formatter must implement getStaveX, getStaveWidth");
  var stave = this.document.getMeasure(m).getStave(s);
  if (! stave) return undefined;
  var vfStave = this.createVexflowStave(stave,
                                        this.getStaveX(m, s),
                                        this.getStaveY(m, s),
                                        this.getStaveWidth(m, s));
  if (! (m in this.vfStaves)) this.vfStaves[m] = [];
  this.vfStaves[m][s] = vfStave;
  return vfStave;
}

/**
 * Create a Vex.Flow.Voice from a Vex.Flow.Measure.Voice.
 * Each note is added to the proper Vex.Flow.Stave in staves
 * (spanning multiple staves in a single voice not currently supported.)
 * @param {Vex.Flow.Measure.Voice} Voice object
 * @param {Array} Vex.Flow.Staves to add the notes to
 * @return {Array} Vex.Flow.Voice, objects to be drawn, optional voice w/lyrics
 */
Vex.Flow.DocumentFormatter.prototype.getVexflowVoice =function(voice, staves){
  var vfVoice = new Vex.Flow.Voice({num_beats: voice.time.num_beats,
                                  beat_value: voice.time.beat_value,
                                  resolution: Vex.Flow.RESOLUTION});

  if (voice.time.soft) vfVoice.setMode(Vex.Flow.Voice.Mode.SOFT);
  // TODO: support spanning multiple staves
  if (typeof voice.stave != "number")
    throw new Vex.RERR("InvalidIRError", "Voice should have stave property");
  vfVoice.setStave(staves[voice.stave]);

  var vexflowObjects = new Array();
  var beamedNotes = null; // array of all vfNotes in beam
  var tiedNote = null; // only last vFNote in tie
  var tupletNotes = null, tupletOpts = null;
  var clef = staves[voice.stave].clef;
  var lyricVoice = null;
  for (var i = 0; i < voice.notes.length; i++) {
    var note = voice.notes[i];
    var vfNote = this.getVexflowNote(voice.notes[i], {clef: clef});
    if (note.beam == "begin") beamedNotes = [vfNote];
    else if (note.beam && beamedNotes) {
      beamedNotes.push(vfNote);
      if (note.beam == "end") {
        vexflowObjects.push(new Vex.Flow.Beam(beamedNotes, true));
        beamedNotes = null;
      }
    }


		// TIE
    if (note.tie == "end" || note.tie == "continue") {
			vfNote.tieEnd = true; // needed for ignoring in syncs
			// console.log("found tie",this.tiedNotes[note.tieNumer],vfNote);
      // TODO: Tie only the correct indices
      vexflowObjects.push(new Vex.Flow.StaveTie({
        first_note: this.tiedNotes[note.tieNumber], last_note: vfNote
      }));
			this.tiedNotes[note.tieNumber] = null;
		}
    if (note.tie == "begin" || note.tie == "continue") {
			//
			// doas the tiedNotes array exist? If not create it
			if( !this.tiedNotes ) this.tiedNotes = new Array();
			//
			// doas the number of the tied note exists in the array? 
			if( !(note.tieNumber in this.tiedNotes) || this.tiedNotes[note.tieNumber] == null) {
				this.tiedNotes[note.tieNumber] = vfNote;
			} else {
				console.log("FUCK the TIE in DocForm");
			}
			// tiedNote = vfNote; 
		}

		// SLUR
		if(typeof note.slur == "object") {
			if( !this.slurNotes ) this.slurNotes = new Array();

			if(note.slur.type == "start"){
				if( !(note.slur.number in this.slurNotes) || this.slurNotes[note.slur.number] == null )
					this.slurNotes[note.slur.number] = vfNote;
			} else if(note.slur.type == "stop"){
				vexflowObjects.push(new Vex.Flow.StaveSlur({
					first_note: this.slurNotes[note.slur.number], last_note: vfNote
				}));
				this.slurNotes[note.slur.number] = null;
			}
		}

    if (note.tuplet) {
      if (tupletNotes) tupletNotes.push(vfNote);
      else {
        tupletNotes = [vfNote];
        tupletOpts = note.tuplet;
      }
      if (tupletNotes.length == tupletOpts.num_notes) {
        vexflowObjects.push(new Vex.Flow.Tuplet(tupletNotes, tupletOpts));
        tupletNotes.forEach(function(n) { vfVoice.addTickable(n) });
        tupletNotes = null; tupletOpts = null;
      }
    }
    else vfVoice.addTickable(vfNote);
		
		// Note Dynamics
		if(vfVoice.stave.dynamic) {
			if(!lyricVoice){
				lyricVoice = new Vex.Flow.Voice(vfVoice.time);
				lyricVoice.setMode(Vex.Flow.Voice.Mode.SOFT);
				lyricVoice.setStave(vfVoice.stave);
			}

			lyricVoice.addTickable(new Vex.Flow.TextNote({
						text: "", duration: "64", glyphs:"mm", soft:true, line:1
			}));
		}

    if (note.lyric) {
      if (! lyricVoice) {
        lyricVoice = new Vex.Flow.Voice(vfVoice.time);
        if (voice.time.soft) lyricVoice.setMode(Vex.Flow.Voice.Mode.SOFT);
        lyricVoice.setStave(vfVoice.stave);
        // TODO: add padding at start of voice if necessary
      }
      lyricVoice.addTickable(new Vex.Flow.TextNote({
        text: note.lyric.text, duration: note.duration
      }));
    }
    else if (lyricVoice) {
      // Add GhostNote for padding lyric voice
      lyricVoice.addTickable(new Vex.Flow.GhostNote({
        duration: note.duration
      }));
    }
  }
  Vex.Assert(vfVoice.stave instanceof Vex.Flow.Stave,
             "VexFlow voice should have a stave");
  return [vfVoice, vexflowObjects, lyricVoice];
}

/**
 * Create a Vex.Flow.StaveNote from a Vex.Flow.Measure.Note.
 * @param {Vex.Flow.Measure.Note} Note object
 * @param {Object} Options (currently only clef)
 * @return {Vex.Flow.StaveNote} StaveNote object
 */
Vex.Flow.DocumentFormatter.prototype.getVexflowNote = function(note, options) {
  var note_struct = Vex.Merge({}, options);
  note_struct.keys = note.keys;
  note_struct.duration = note.duration;
  if (note.stem_direction) note_struct.stem_direction = note.stem_direction;
  var vfNote = new Vex.Flow.StaveNote(note_struct);
  var i = 0;
  if (note.accidentals instanceof Array)
    note.accidentals.forEach(function(acc) {
      if (acc != null) vfNote.addAccidental(i, new Vex.Flow.Accidental(acc));
      i++;
    });
	var numDots = Vex.Flow.parseNoteDurationString(note.duration).dots;
  for (var i = 0; i < numDots; i++) vfNote.addDotToAll();
	if(typeof note.articulations == "object" && note.articulations.staccato == true) 
	{
		vfNote.addArticulation(0, new Vex.Flow.Articulation("a.").setPosition(vfNote.stem_direction==1?4:3));
	}
  return vfNote;
}

Vex.Flow.DocumentFormatter.prototype.getMinMeasureWidth = function(m) {
  if (! (m in this.minMeasureWidths)) {
    // Calculate the maximum extra width on any stave (due to modifiers)
    var maxExtraWidth = 0;
    var measure = this.document.getMeasure(m);
    var vfStaves = measure.getStaves().map(function(stave) {
      var vfStave = this.createVexflowStave(stave, 0, 0, 500);
      var extraWidth = 500 - (vfStave.getNoteEndX()-vfStave.getNoteStartX());
      if (extraWidth > maxExtraWidth) maxExtraWidth = extraWidth;
      return vfStave;
    }, this);

    // Create dummy canvas to use for formatting (required by TextNote)
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    var allVfVoices = [];
    var startStave = 0; // stave for part to start on
    measure.getParts().forEach(function(part) {
      var numStaves = part.getNumberOfStaves();
      var partStaves = vfStaves.slice(startStave, startStave + numStaves);
      part.getVoices().forEach(function(voice) {
        var vfVoice = this.getVexflowVoice(voice, partStaves)[0];
        allVfVoices.push(vfVoice);
        vfVoice.tickables.forEach(function(t) {
          t.setContext(context)
        });
      }, this);
      startStave += numStaves;
    }, this);
    var formatter = new Vex.Flow.Formatter();
    var noteWidth = formatter.preCalculateMinTotalWidth(allVfVoices);

    // Find max tickables in any voice, add a minimum space between them
    // to get a sane min width
    var maxTickables = 0;
    allVfVoices.forEach(function(v) {
      var numTickables = v.tickables.length;
      if (numTickables > maxTickables) maxTickables = numTickables;
    });
		// OWN
    this.minMeasureWidths[m] = Vex.Max(200, maxExtraWidth + noteWidth + maxTickables*10 + 10);
		// this.minMeasureWidths[m] = 200; //Vex.Max(50, maxExtraWidth + noteWidth + maxTickables*10 + 10);

    // Calculate minMeasureHeight by merging bounding boxes from each voice
    // and the bounding box from the stave
    var minHeights = [];
    // Initialize to zero
    for (var i = 0; i < vfStaves.length + 1; i++) minHeights.push(0);

    var i=-1; // allVfVoices consecutive by stave, increment for each new stave
    var lastStave = null;
    var staveY = vfStaves[0].getYForLine(0);
    var staveH = vfStaves[0].getYForLine(4) - staveY;
    var lastBoundingBox = null;
    allVfVoices.forEach(function(v) {
      if (v.stave !== lastStave) {
        if (i >= 0) {
          minHeights[i]  += -lastBoundingBox.getY();
          minHeights[i+1] =  lastBoundingBox.getH()
                            +lastBoundingBox.getY();
        }
        lastBoundingBox = new Vex.Flow.BoundingBox(0, staveY, 500, staveH);
        lastStave = v.stave;
        i++;
      }
      lastBoundingBox.mergeWith(v.getBoundingBox());
    });
    minHeights[i]  += -lastBoundingBox.getY();
    minHeights[i+1] =  lastBoundingBox.getH()
                      +lastBoundingBox.getY();
    this.minMeasureHeights[m] = minHeights;
  }
  return this.minMeasureWidths[m];
};

Vex.Flow.DocumentFormatter.prototype.getMinMeasureHeight = function(m) {
  if (! (m in this.minMeasureHeights)) this.getMinMeasureWidth(m);
  return this.minMeasureHeights[m];
}

// Internal drawing functions
Vex.Flow.DocumentFormatter.prototype.drawPart =
  function(part, vfStaves, context) {
  var staves = part.getStaves();
  var voices = part.getVoices();

	// add the dynamic information to a stave
	if( part.dynamic )
		vfStaves[part.dynamic[0].stave].dynamic = part.dynamic[0].type;

  vfStaves.forEach(function(stave) { 
		// HERE
		if(typeof part.bars == "object") {
			if(part.bars.location == "right" && part.bars.direction == "backward") {
				stave.setEndBarType(Vex.Flow.Barline.type.REPEAT_END);
			}
			if(part.bars.location == "left" && part.bars.direction == "forward") {
				stave.setBegBarType(Vex.Flow.Barline.type.REPEAT_BEGIN);
			}
		}
		stave.setContext(context).draw(); 
	});

  var allVfObjects = new Array();
  var vfVoices = new Array();
  voices.forEach(function(voice) {
    var result = this.getVexflowVoice(voice, vfStaves);
    Array.prototype.push.apply(allVfObjects, result[1]);
    var vfVoice = result[0];
    var lyricVoice = result[2];
    vfVoice.tickables.forEach(function(tickable) {
      tickable.setStave(vfVoice.stave); });
    vfVoices.push(vfVoice);
    if (lyricVoice) {
      lyricVoice.tickables.forEach(function(tickable) {
        tickable.setStave(lyricVoice.stave); });
      vfVoices.push(lyricVoice);
    }
  }, this);
  var formatter = new Vex.Flow.Formatter().joinVoices(vfVoices);
  formatter.format(vfVoices, vfStaves[0].getNoteEndX()
                             - vfStaves[0].getNoteStartX() - 10);
  var i = 0;
  vfVoices.forEach(function(vfVoice,v) {
    vfVoice.draw(context, vfVoice.stave);
		// create syncs array if not exists
		if(!this.syncs) this.syncs = new Array();
		vfVoice.tickables.forEach(function(tickable,t){
			// creates a new voice entry if the 
			// if(!(v in this.syncs)) this.syncs[v] = new Array();
			this.syncs.push({
					numTickable: t,
					type: tickable.noteType,
					x: tickable.getAbsoluteX(),
					keys: tickable.keys,
					keyProps: tickable.keyProps,
					tickable: tickable
			});
		},this);
	},this);

	this.syncs.sort(function(a,b){
		return a.x - b.x;
	});

  allVfObjects.forEach(function(obj) {
    obj.setContext(context).draw(); });
}

// Options contains system_start, system_end for measure
Vex.Flow.DocumentFormatter.prototype.drawMeasure =
  function(measure, vfStaves, context, options) {
  var startStave = 0;
  var parts = measure.getParts();
  parts.forEach(function(part) {
    var numStaves = part.getNumberOfStaves();
    var partStaves = vfStaves.slice(startStave, startStave + numStaves);
    this.drawPart(part, partStaves, context);
    startStave += numStaves;
  }, this);

  this.document.getStaveConnectors().forEach(function(connector) {
    if (! ((options.system_start && connector.system_start)
        || (options.system_end && connector.system_end)
        || connector.measure_start)) return;
    var firstPart = connector.parts[0],
        lastPart = connector.parts[connector.parts.length - 1];
    var firstStave, lastStave;
		var repeat_begin, repeat_end;
    // Go through each part in measure to find the stave index
    var staveNum = 0, partNum = 0;
    parts.forEach(function(part) {
      if (partNum == firstPart) firstStave = staveNum;
      if (partNum == lastPart)
        lastStave = staveNum + part.getNumberOfStaves() - 1;
      staveNum += part.getNumberOfStaves();
      partNum++;
    });
    if (isNaN(firstStave) || isNaN(lastStave)) return;
    var type = connector.type == "single" ? Vex.Flow.StaveConnector.type.SINGLE
             : connector.type == "double" ? Vex.Flow.StaveConnector.type.DOUBLE
             : connector.type == "brace"  ? Vex.Flow.StaveConnector.type.BRACE
             : connector.type =="bracket"? Vex.Flow.StaveConnector.type.BRACKET
             : null;
		// TODO: What if measure holds multiple parts?
		var bars =  measure.getParts()[0].bars;
		if ( typeof bars == "object" ) {
			if( bars.location == "left" ) {
				type = Vex.Flow.StaveConnector.type.REPEAT_BEGIN;
			}
			if( bars.location == "right" ) {
				var stave1 = vfStaves[firstStave], stave2 = vfStaves[lastStave];
				(new Vex.Flow.StaveConnector(stave1, stave2)
          ).setType(Vex.Flow.StaveConnector.type.REPEAT_END).setContext(context).draw();
			}
		}
    if ((options.system_start && connector.system_start)
        || connector.measure_start) {
      (new Vex.Flow.StaveConnector(vfStaves[firstStave], vfStaves[lastStave])
          ).setType(type).setContext(context).draw();
    }
    if (options.system_end && connector.system_end) {
      var stave1 = vfStaves[firstStave], stave2 = vfStaves[lastStave];
      (new Vex.Flow.StaveConnector(stave1, stave2)
          ).setType(Vex.Flow.StaveConnector.type.SINGLE_END).setContext(context).draw();
    }
  });
}

Vex.Flow.DocumentFormatter.prototype.drawBlock = function(b, context) {
  this.getBlock(b);
  var measures = this.measuresInBlock[b];
  measures.forEach(function(m) {
    var stave = 0;
    while (this.getStave(m, stave)) stave++;
    this.drawMeasure(this.document.getMeasure(m), this.vfStaves[m], context,
                     {system_start: m == measures[0],
                      system_end: m == measures[measures.length - 1]});
  }, this);
}

/**
 * Vex.Flow.DocumentFormatter.prototype.draw - defined in subclass
 * Render document inside HTML element, creating canvases, etc.
 * Called a second time to update as necessary if the width of the element
 * changes, etc.
 * @param {Node} HTML node to draw inside
 * @param {Object} Subclass-specific options
 */

/**
 * Vex.Flow.DocumentFormatter.Liquid - default liquid formatter
 * Fit measures onto lines with a given width, in blocks of 1 line of music
 *
 * @constructor
 */
Vex.Flow.DocumentFormatter.Liquid = function(document) {
  if (arguments.length > 0) Vex.Flow.DocumentFormatter.call(this, document);
  this.width = 500; // default value
  this.zoom = 1.0;
  this.scale = 1.0;
  if (typeof window.devicePixelRatio == "number"
      && window.devicePixelRatio > 1)
    this.scale = Math.floor(window.devicePixelRatio);
}
Vex.Flow.DocumentFormatter.Liquid.prototype = new Vex.Flow.DocumentFormatter();
Vex.Flow.DocumentFormatter.Liquid.constructor
  = Vex.Flow.DocumentFormatter.Liquid;

Vex.Flow.DocumentFormatter.Liquid.prototype.setWidth = function(width) {
  this.width = width; return this; }

Vex.Flow.DocumentFormatter.Liquid.prototype.getBlock = function(b) {
  if (b in this.blockDimensions) return this.blockDimensions[b];

  var startMeasure = 0;
  if (b > 0) {
    this.getBlock(b - 1);
    var prevMeasures = this.measuresInBlock[b - 1];
    startMeasure = prevMeasures[prevMeasures.length - 1] + 1;
  }
  var numMeasures = this.document.getNumberOfMeasures();
  if (startMeasure >= numMeasures) return null;

  // Update modifiers for first measure
  this.document.getMeasure(startMeasure).getStaves().forEach(function(s) {
    if (typeof s.clef == "string" && ! s.getModifier("clef")) {
      s.addModifier({type: "clef", clef: s.clef, automatic: true});
    }
    if (typeof s.key == "string" && ! s.getModifier("key")) {
      s.addModifier({type: "key", key: s.key, automatic: true});
    }
    // Time signature on first measure of piece only
		if (startMeasure == 0 && ! s.getModifier("time")) {
      if (typeof s.time_signature == "string")
        s.addModifier({type: "time", time: s.time_signature,automatic:true});
      else if (typeof s.time == "object" && !s.time.soft)
        s.addModifier(Vex.Merge({type: "time", automatic: true}, s.time));
    }
  });
  
  // Store x, width of staves (y calculated automatically)
  if (! this.measureX) this.measureX = new Array();
  if (! this.measureWidth) this.measureWidth = new Array();

  // Calculate start x (15 if there are braces, 10 otherwise)
  var start_x = 10;
  this.document.getMeasure(startMeasure).getParts().forEach(function(part) {
    if (part.showsBrace()) start_x = 15;
  });

  if (this.getMinMeasureWidth(startMeasure) + start_x + 10 >= this.width) {
    // Use only this measure and the minimum possible width
    var block = [this.getMinMeasureWidth(startMeasure) + start_x + 10, 0];
    this.blockDimensions[b] = block;
    this.measuresInBlock[b] = [startMeasure];
    this.measureX[startMeasure] = start_x;
    this.measureWidth[startMeasure] = block[0] - start_x - 10;
  }
  else {
    var curMeasure = startMeasure;
    var width = start_x + 10;
    while (width < this.width && curMeasure < numMeasures) {
      // Except for first measure, remove automatic modifiers
      // If there were any, invalidate the measure width
      if (curMeasure != startMeasure)
        this.document.getMeasure(curMeasure).getStaves().forEach(function(s) {
          if (s.deleteAutomaticModifiers()
              && this.minMeasureWidths && curMeasure in this.minMeasureWidths)
            delete this.minMeasureWidths[curMeasure];
        });
      width += this.getMinMeasureWidth(curMeasure);
      curMeasure++;
    }
    var endMeasure = curMeasure - 1;
    var measureRange = [];
    for (var m = startMeasure; m <= endMeasure; m++) measureRange.push(m);
    this.measuresInBlock[b] = measureRange;

    // Allocate width to measures
    var remainingWidth = this.width - start_x - 10;
    for (var m = startMeasure; m <= endMeasure; m++) {
      // Set each width to the minimum
      this.measureWidth[m] = Math.ceil(this.getMinMeasureWidth(m));
      remainingWidth -= this.measureWidth[m];
    }
    // Split rest of width evenly
    var extraWidth = Math.floor(remainingWidth / (endMeasure-startMeasure+1));
    for (var m = startMeasure; m <= endMeasure; m++)
      this.measureWidth[m] += extraWidth;
    remainingWidth -= extraWidth * (endMeasure - startMeasure + 1);
    this.measureWidth[startMeasure] += remainingWidth; // Add remainder
    // Calculate x value for each measure
    this.measureX[startMeasure] = start_x;
    for (var m = startMeasure + 1; m <= endMeasure; m++)
      this.measureX[m] = this.measureX[m-1] + this.measureWidth[m-1];
    this.blockDimensions[b] = [this.width, 0];
  }

  // Calculate height of first measure
  var i = 0;
  var lastStave = undefined;
  var stave = this.getStave(startMeasure, 0);
  while (stave) {
    lastStave = stave;
    i++;
    stave = this.getStave(startMeasure, i);
  }
  var height = this.getStaveY(startMeasure, i-1);
  // Add max extra space for last stave on any measure in this block
  var maxExtraHeight = 100; // default: height of stave
  for (var i = startMeasure; i <= endMeasure; i++) {
    var minHeights = this.getMinMeasureHeight(i);
    var extraHeight = minHeights[minHeights.length - 1];
    if (extraHeight > maxExtraHeight) maxExtraHeight = extraHeight;
  }
  height += maxExtraHeight;
  this.blockDimensions[b][1] = height;

  return this.blockDimensions[b];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.getStaveX = function(m, s) {
  if (! (m in this.measureX))
    throw new Vex.RERR("FormattingError",
                "Creating stave for measure which does not belong to a block");
  return this.measureX[m];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.getStaveWidth = function(m, s) {
  if (! (m in this.measureWidth))
    throw new Vex.RERR("FormattingError",
                "Creating stave for measure which does not belong to a block");
  return this.measureWidth[m];
}

Vex.Flow.DocumentFormatter.Liquid.prototype.draw = function(elem, options) {
  if (this._htmlElem != elem) {
    this._htmlElem = elem;
    elem.innerHTML = "";
    this.canvases = [];
  }

  // var canvasWidth = $(elem).width() - 10; // TODO: can we use jQuery?
	var canvasWidth = this.document.getNumberOfMeasures()*200+10;
  var renderWidth = Math.floor(canvasWidth / this.zoom);
  // Invalidate all blocks/staves/voices
  this.minMeasureWidths = []; // heights don't change with stave modifiers
  this.measuresInBlock = [];
  this.blockDimensions = [];
  this.vfStaves = [];
  this.measureX = [];
  this.measureWidth = [];
  this.setWidth(renderWidth);

  // Remove all non-canvas child nodes of elem using jQuery
  $(elem).children(":not(canvas)").remove();

  var b = 0;
  while (this.getBlock(b)) {
    var canvas, context;
    var dims = this.blockDimensions[b];
    var width = Math.ceil(dims[0] * this.zoom);
    var height = Math.ceil(dims[1] * this.zoom)+30; // OWN: stave ties are cutted here
    if (! this.canvases[b]) {
      canvas = document.createElement('canvas');
      canvas.width = width * this.scale;
      canvas.height = height * this.scale;
      if (this.scale > 1) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      canvas.id = elem.id + "_canvas" + b.toString();
      // If a canvas exists after this one, insert before that canvas
      for (var a = b + 1; this.getBlock(a); a++)
        if (typeof this.canvases[a] == "object") {
          elem.insertBefore(canvas, this.canvases[a]);
          break;
        }
      if (! canvas.parentNode)
        elem.appendChild(canvas); // Insert at the end of elem
      this.canvases[b] = canvas;
      context = canvas.getContext("2d");
    }
    else {
      canvas = this.canvases[b];
      canvas.style.display = "inherit";
      canvas.width = width * this.scale;
      canvas.height = height * this.scale;
      if (this.scale > 1) {
        canvas.style.width = width.toString() + "px";
        canvas.style.height = height.toString() + "px";
      }
      context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    // TODO: Figure out why setFont method is called
    if (typeof context.setFont != "function")
      context.setFont = function(font) { this.font = font; return this; };
    context.scale(this.zoom * this.scale, this.zoom * this.scale);
    this.drawBlock(b, context);
    // Add anchor elements before canvas
    var lineAnchor = document.createElement("a");
    lineAnchor.id = elem.id + "_line" + (b+1).toString();
    elem.insertBefore(lineAnchor, canvas);
    this.measuresInBlock[b].forEach(function(m) {
      var anchor = elem.id + "_m" +
                   this.document.getMeasureNumber(m).toString();
      var anchorElem = document.createElement("a");
      anchorElem.id = anchor;
      elem.insertBefore(anchorElem, canvas);
    }, this);
    b++;
  }
  while (typeof this.canvases[b] == "object") {
    // Remove canvases beyond the last one we are using
    elem.removeChild(this.canvases[b]);
    delete this.canvases[b];
    b++;
  }
}
