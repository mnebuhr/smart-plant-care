let Panel = require('./panel');

let BLANK = '.';

let BlockData = {
	'Z' : {
		"views" : [
			[
				[1,0],
				[1,1],
				[0,1]
			],
			[
				[0,1,1],
				[1,1,0]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),
		"freezeColor" : Panel.fromName('orange'),
	},
	'L' : {
		"views" : [
			[
				[1,0],
				[1,0],
				[1,1]
			],[
				[1,1,1],
				[1,0,0]
			],[
				[1,1],
				[0,1],
				[0,1]
			],[
				[0,0,1],
				[1,1,1]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),
		"freezeColor" : Panel.fromName('orange'),
	},
	'O' : {
		"views" : [
			[
				[1,1],
				[1,1]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),		
		"freezeColor" : Panel.fromName('orange'),
	},
	'T' : {
		"views" : [
			[
				[0,1,0],
				[1,1,1]
			],[
				[1,0],
				[1,1],
				[1,0]
			],[
				[1,1,1],
				[0,1,0]
			],[
				[0,1],
				[1,1],
				[0,1]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),		
		"freezeColor" : Panel.fromName('orange'),
	},
	'I' : {
		"views" : [
			[
				[1,1,1,1]
			],[
				[1],
				[1],
				[1],
				[1]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),		
		"freezeColor" : Panel.fromName('orange'),
	},
	'#' : {
		"views" : [
			[
				[1]
			]
		],
		"color" : Panel.fromName('cornflowerblue'),		
		"freezeColor" : Panel.fromName('orange'),
	}
};

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
* Die Tetris Klasse bietet alle notwendigen Methoden und 
* Eigenschaften eines Tetris Spielfeldes an. Das Spiel
* selbst wird in dieser Klasse nicht implementiert.
**/
class Tetris {

	get blockCount() { return this._level_blocks.length; }

	/**
	* Legt ein neues Tetris Spielfeld an. Übergeben wird ein
	* Panel, dass zum einen genommen wird, um die Dimensionen
	* festzulegen. Und zum Anderen um die Steine darzustellen. 
	*
	* @param {Panel} panel - Das Panel, auf dem das Spielfeld angezeigt werden soll.
	* @constructor
	* @author FirstKlaas
	**/
	constructor (panel) {
		this._panel = panel;
		this._gamefield = new Array(panel.width * panel.height);
		this._gamefield.fill(BLANK);
		this._current = {
			"rotation" : 0,
			"x" : 0,
			"y" : 2,
			"getView" : () => {
				return this.block.data.views[this.block.rotation];
			}
		};
		this._backgroundColor = Panel.Black;
		this._level_blocks = Object.keys(BlockData);	
		this.newRandomBlock();
	}

	/**
	* Die Blöcke, aus denen der neue Stein ausgewählt werden kann. Zurück
	* gegeben wird ein Array mit den IDs der erlaubten Steine.
	**/
	get levelBlocks() { return this._level_blocks; }

	/**
	* Erzeugt zufällig einen neuen Block. Dieser wird dann der aktuelle
	* "Drop-Down" Block. Der Block wird zufällig aus der List der *this.levelBlocks* 
	*/ 
	newRandomBlock() {
		let i = getRandomInt(this.blockCount);
		this.setBlock(this.levelBlocks[i]);
		return this.block;
	}

	setBlock(id) {
		let block = BlockData[id];
		if ( block === undefined ) throw new Error(`Cannot set block ${id}. No such block.`);		
		this.block.data = block;
		this.block.id = id; 
		this.block.rotation = this.block.rotation % this.numberOfRotations;
	}

	getBlockColor(id) {
		if (!BlockData[id]) throw new Error(`No such block with id ${id}.`);
		return BlockData[id].color;
	}

	getBlockFreezeColor(id) {
		if (!BlockData[id]) throw new Error(`No such block with id ${id}.`);
		return BlockData[id].freezeColor;
	}

	toIndex(x,y) {
		return this.panel.toIndex(x,y);
	}

	setStone(x,y,id) {
		if (this.panel.isValid(x,y)) {
			let index = this.toIndex(x,y);
			this.gamefield[index] = id;
		}
	}

	isBlockPixel(x,y) {
		let view = this.view;
		return view[y][x] > 0;
	}

	get panel() { return this._panel; }
	get gamefield() { return this._gamefield; }
	get block() { return this._current; } 
	get view() { return this.block.getView(); }
	get x() { return this.block.x; }
	set x( val ) { this.block.x = val; } 
	get y() { return this.block.y; }
	set y( val ) { this.block.y = val; } 
	get width() { return this.panel.width; }
	get height() { return this.panel.height; }
	get blockWidth() { return this.view[0].length; }
	get blockHeight() { return this.view.length; }
	get blockId() { return this.block.id; }
	get color() { return this.block.data.color }
	set color( color ) { this.block.data.color = color; }
	get freezeColor() { return this.block.data.freezeColor }
	set freezeColor( color ) { this.block.data.freezeColor = color; }
	get numberOfRotations() { return this.block.data.views.length; }

	get rotation() { return this.block.rotation; }
	set rotation( val ) { this.block.rotation = (val % this.numberOfRotations); }

	get backgroundColor() { return this._backgroundColor; }
	set backgroundColor( col ) { this._backgroundColor = col; }

	/**
	* Prüft, ob der Stein über den rechten Rand hinausragt und schiebt ihn
	* solange hach links, bis der Stein keinen "overflox" auf der rechten 
	* Seite hat.
	**/  
	adjustRight() {
		while (this.overflowRight) this.moveLeft();
	}

	/**
	* Prüft, ob der Stein über de linken Rand hinausragt und schiebt ihn
	* solange hach rechts, bis der Stein keinen "overflox" auf der linken 
	* Seite hat.
	**/  
	adjustLeft() {
		while (this.overflowLeft) this.moveRight();
	}

	/**
	* Stellt durch horizontales Schieben sicher, dass der STein weder
	* auf der linkne, noch der rechten Seite hinausragt.
	**/
	adjustX() {
		this.adjustLeft();
		this.adjustRight();
	}

	adjustTop() {
		while(this.overflowTop) this.moveDown();
	}

	adjustBottom() {
		while(this.overflowBottom) this.moveUp();
	}

	adjustY() {
		this.adjustTop();
		this.adjustBottom();
	}

	adjust() {
		this.adjustX();
		this.adjustY();
	}

	rotateRight() {
		this.rotation = this.rotation + 1;
	}

	rotateLeft() {
		this.rotation = this.numberOfRotations + this.rotation - 1;
	}

	/**
	* Boolean property that is true, if the current block
	* exceeds the right or the right of the gamefield.
	*/
	get overflowRight() {		
		return (this.x + this.blockWidth > this.width);
	}

	/**
	* Boolean property that is true, if the current block
	* exceeds the the left of the gamefield.
	*/
	get overflowLeft() {
		return (this.x < 0);
	}

	/**
	* Boolean property that is true, if the current block
	* exceeds the right or the left of the gamefield.
	*/
	get overflowX() {
		return [this.overflowLeft, this.overflowRight];
	}

	/**
	* Boolean property that is true, if the current block
	* exceeds the bottom of the gamefield.
	*/
	get overflowBottom() {
		return (this.y + this.blockHeight > this.height);
	}

	/**
	* Boolean property that is true, if the current block
	* exceeds the top of the gamefield.
	*/
	get overflowTop() {
		return (this.y < 0);
	}

	moveRight() {
		this.x = this.x + 1;
	}

	moveLeft() {
		this.x = this.x - 1;
	}

	moveUp() {
		this.y = this.y - 1;
	}

	moveDown() {
		this.y = this.y + 1;
	}

	/**
	* Schreibt den Block in das Spielfeld.
	*/
	writeBlockToGamefield() {
		let view = this.view;
		for (var dy = 0; dy < view.length; dy++) {
			let row = view[dy];
			for (var dx = 0; dx < row.length; dx++) {
				let x = this.x + dx;
				let y = this.y + dy;
				if (this.isBlockPixel(dx,dy)) {
					this.setStone(x,y,this.blockId);	
				}
			}
		}
	}


	checkforGamefieldCollision(mx=0,my=0) {
		let view = this.view;
		for (var dy = 0; dy < view.length; dy++) {
			let row = view[dy];
			for (var dx = 0; dx < row.length; dx++) {
				let x = this.x + dx + mx;
				let y = this.y + dy + my;
				if (this.panel.isValid(x,y) && this.isBlockPixel(dx,dy) && this.gamefield[this.toIndex(x,y)] != BLANK) {
					//console.log(`BOOOM at ${x}x${y} at ${this.toIndex(x,y)} with id ${this.blockId}`);
					return true;	
				}
			}
		}
		return false;
	}

	reachedTop() {
		for (var x=0; x < this.width; x++) {
			if (this.gamefield[this.toIndex(x,0)] != BLANK) return true;
		};
		return false;
	}

	clearGamefield() {
		this.gamefield.fill(BLANK);
	}

	drawBlock() {
		let view = this.view;
		for (var dy = 0; dy < view.length; dy++) {
			let row = view[dy];
			for (var dx = 0; dx < row.length; dx++) {
				let x = this.x + dx;
				let y = this.y + dy;
				if (view[dy][dx] > 0) {
					if (this.panel.isValid(x,y)) {
						this.panel.setPixelXY(x,y,this.color);	
					} 
				}
			}
		}
	}

	drawGamefield(transparent = true) {
		for (var i=0; i<this.gamefield.length; i++) {
			if (this.gamefield[i] != BLANK) {
				this.panel.setPixelAt(i,this.getBlockFreezeColor(this.gamefield[i]));	
			} else {
				if (!transparent) {
					this.panel.setPixelAt(i,this.backgroundColor);
				} 
			}
		}
	}
}

module.exports = Tetris;