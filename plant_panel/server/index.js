let Panel = require('./panel');

let panel = new Panel('192.168.178.30',3548,7,7, Panel.MODE_LTR);

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function test() {
	for (r=0; r<13; r++) {
		panel.setPixelAt(getRandomInt(49),Panel.RGBColor(getRandomInt(255),getRandomInt(255),getRandomInt(255)));
	}
	return panel.update();
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

	var rainbowAnim = function() {
		panel.fill(color);
		color.h = (color.h + 1) % 360;
		panel.update()
		.then( setTimeout(rainbowAnim,50))
		.catch( err => {
			console.log(err);
			panel.close();
		});
	}	
	rainbowAnim();
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
	
function panim() {
	displayTime();
	panel.update().then( () => setTimeout(anim,1000) )
	.catch( err => {
		console.log(err);
		panel.close();
	});
}
//panel.showSprite('sprites/test02.png',true).then(() => console.log('t'));
//anim();
rainbow2();