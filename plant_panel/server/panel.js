const dgram = require('dgram');
const message = Buffer.from('Some bytes');

module.exports = class Panel{
	static get FILL_RGB() { return 1; };
	static get SET_PIXEL_AT_RGB() { return 3; };

	static get RGB() { return 0; };
	static get HSV() { return 1; };

	constructor(ip, port) {
		this._ip   = ip;
		this._port = port;
		this._client = dgram.createSocket('udp4');
	}

	_send(message) {
		return new Promise( (resolve, reject) => {
			this._client.send(message, 3548, '192.168.178.30', (err) => {
				if(err) {
					return reject(err);
				} else {
					return resolve();
				}
			});
		})
	}

	close() {
		this._client.close();
	}

	fillRGB(r,g,b) {
		let buf = Buffer.allocUnsafe(4);
		buf[0] = Panel.FILL_RGB;
		buf[1] = r;
		buf[2] = g;
		buf[3] = b;
		return this._send(buf);
	}

	setPixelAt(colormodel, i, r, g, b) {
		let buf = Buffer.allocUnsafe(5);
		buf[0] = Panel.SET_PIXEL_AT_RGB;
		buf[1] = i;
		buf[2] = r;
		buf[3] = g;
		buf[4] = b;
		return this._send(buf);
	}
}


