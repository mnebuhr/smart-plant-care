let Panel = require('./panel');

let panel = new Panel('192.168.178.30',3548);

panel.fillRGB(0,0,0)
.then( () => {
	console.log('Wohoo');
	return panel.setPixelAt(Panel.RGB, 4, 240,0,128);
})
.then( () => {
	panel.close();
	console.log('Connection closed');	
})
.catch( err => {
	console.log('Error');
	panel.close();
});



