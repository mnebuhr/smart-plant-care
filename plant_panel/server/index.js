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

function anim() {
	displayTime();
	panel.update().then( () => setTimeout(anim,1000) )
	.catch( err => {
		console.log(err);
		panel.close();
	});
}
/*
panel.fill(0,0,0,Panel.UPDATE)
.then( () => {
	return test();
})
.then( () => {
	//return panel.fill(0,0,0,Panel.UPDATE);
	return Promise.resolve();	
})
.then( () => {
	panel.close();
	console.log('Connection closed');	
})
.catch( err => {
	console.log(err);
	panel.close();
});

*/
//panel.showSprite('sprites/test02.png',true).then(() => console.log('t'));
anim();
/*
panel.fill(Panel.Black)
.then( () => panel.writeColors([Panel.White, Panel.Red, Panel.Green, Panel.Blue]) )
.then(() => panel.close());
*/