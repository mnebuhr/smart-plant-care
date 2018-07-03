let Panel = require('./panel');
let Tetris = require('./tetris');

let panel = new Panel('192.168.178.96',3548,7,7, Panel.MODE_LTR);
let tetris = new Tetris(panel);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function test() {
	for (r=0; r<13; r++) {
		panel.setPixelAt(getRandomInt(49),Panel.RGBColor(getRandomInt(255),getRandomInt(255),getRandomInt(255)));
	}
	return panel.update();
}

function glitter(delay=50, hue=undefined) {
	let glitterData = new Array(20);

	var getHue = function() {
		if (hue != undefined) {
			hue += 0.1;
			if (hue > 360) hue = 0;
			return Math.floor(hue);
		}
		return getRandomInt(256);
	}

	for (var i=0; i<glitterData.length; i++) {
		glitterData[i] = {
			index : getRandomInt(49),
			hsv   : Panel.HSVColor(getHue(),getRandomInt(100), getRandomInt(100))
		}; 
	}

	var drawGlitter = function(hue=undefined) {
		for (var i=0; i<glitterData.length; i++) {
			if (glitterData[i].hsv.v <= 0) {
				glitterData[i].hsv = Panel.HSVColor(getHue(),getRandomInt(100), 100);
				glitterData[i].index = getRandomInt(49);
			}
			panel.setPixelAt(glitterData[i].index, glitterData[i].hsv.rgb);
			glitterData[i].hsv.v = glitterData[i].hsv.v - 1;
		}
	}

	var anim = function() {
		drawGlitter(hue);		
		panel.update().then(setTimeout(anim,delay));
	}
	anim();
}

function displayTime() {
	var d = new Date();
	panel.writeBitmaskRow(0,Panel.Red, Math.floor(d.getHours() / 10));
	panel.writeBitmaskRow(1,Panel.Red, d.getHours() % 10);
	
	panel.writeBitmaskRow(2,Panel.Green, Math.floor(d.getMinutes() / 10));
	panel.writeBitmaskRow(3,Panel.Green, d.getMinutes() % 10);
	
	panel.writeBitmaskRow(4,Panel.Blue, Math.floor(d.getSeconds() / 10));
	panel.writeBitmaskRow(5,Panel.Blue, d.getSeconds() % 10);	
}

function rainbow() {
	let color = Panel.Red.hsv;
	color.s = 100;
	color.v = 50;

	var anim = function() {
		panel.fill(color);
		color.h = (color.h + 1) % 360;
		panel.update()
		.then( setTimeout(anim,50))
		.catch( err => {
			console.log(err);
			panel.close();
		});
	}	
	anim();
}

function rainbow2() {
	let color = Panel.Red.hsv;
	color.s = 100;
	color.v = 50;
	var delta = 1;
	var anim = function() {
		let h = color.h;
		for (var i=0; i<49; i++) {
			panel.setPixelAt(i,color.rgb);
			color.h = (color.h + (delta)) % 360;
		}
		color.h = (h + 1) % 360;
		delta = (delta + 1) & 255;
		panel.update()
		.then( setTimeout(anim,50))
		.catch( err => {
			console.log(err);
			panel.close();
		});
	}	
	anim();
}
	
function clock() {
	displayTime();
	panel.update().then( () => setTimeout(clock,1000) )
	.catch( err => {
		console.log(err);
		panel.close();
	});
}

function tetrisAnimation1() {
	var hue = 0;
	var right = true;
	
	newblock = () => {
		let id =  getRandomInt(Tetris.blockCount);
		tetris.setBlock(id); 
		tetris.color = Panel.HSVColor(hue,100,100);
		tetris.rotateRight();
		tetris.adjust();
	};

	newblock();

	anim = () => {
		panel.fill(Panel.HSVColor((hue) % 360,100,30));
		tetris.drawBlock();
		hue = (hue + 1) % 360;		

		if (right) {
			tetris.moveRight()
			if (tetris.overflowRight) { 
				right = false;
				newblock();			
			}
		} else {
			tetris.moveLeft();
			if (tetris.overflowLeft) { 
				right = true; 
				newblock(); 
			}
		}
		panel.update().then( () => setTimeout(anim,150) );
	};
	anim();
	
}

function tetrisAnimation2() {
	var hue = 0;
	
	newblock = () => {
		tetris.newRandomBlock(); 
		tetris.rotation = getRandomInt(tetris.numberOfRotations);
		tetris.color = Panel.HSVColor(hue,100,100);
		tetris.freezeColor = Panel.HSVColor((hue + 180) % 360,100,100);
		tetris.x = getRandomInt(panel.width-tetris.blockWidth);
		tetris.y = 0 - tetris.blockHeight;
		tetris.adjustX();
	};

	newblock();

	anim = () => {
		tetris.backgroundColor = Panel.HSVColor((hue) % 360,100,30);
		//if(tetris.y == 4) tetris.writeBlockToGamefield();
		tetris.drawGamefield(false);
		tetris.drawBlock();
		hue = (hue + 1) % 360;
		if (tetris.checkforGamefieldCollision(0,1) || tetris.y + tetris.blockHeight == tetris.panel.height ) {
			tetris.writeBlockToGamefield();
			if (tetris.reachedTop()) {
				tetris.clearGamefield();
			}
			newblock();
		} else {
			tetris.moveDown();
		};

		panel.update().then( () => setTimeout(anim,200) );
	};
	anim();
	
}

//panel.showSprite('sprites/test02.png',true).then(() => console.log('t'));
//anim();
//rainbow2();
//glitter(80,0);
tetrisAnimation2();
//clock();



