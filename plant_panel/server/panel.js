let dgram        = require('dgram');
let colorconvert = require('color-convert');
let getPixels = require("get-pixels");


let gamma8_table = [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,
    	              0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  1,  1,  1,  1,
        	          1,  1,  1,  1,  1,  1,  1,  1,  1,  2,  2,  2,  2,  2,  2,  2,
            	      2,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4,  4,  4,  5,  5,  5,
                	  5,  6,  6,  6,  6,  7,  7,  7,  7,  8,  8,  8,  9,  9,  9, 10,
	                 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16,
    	             17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25,
        	         25, 26, 27, 27, 28, 29, 29, 30, 31, 32, 32, 33, 34, 35, 35, 36,
            	     37, 38, 39, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 50,
	                 51, 52, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 66, 67, 68,
    	             69, 70, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 85, 86, 87, 89,
        	         90, 92, 93, 95, 96, 98, 99,101,102,104,105,107,109,110,112,114,
            	    115,117,119,120,122,124,126,127,129,131,133,135,137,138,140,142,
                	144,146,148,150,152,154,156,158,160,162,164,167,169,171,173,175,
                	177,180,182,184,186,189,191,193,196,198,200,203,205,208,210,213,
					215,218,220,223,225,228,231,233,236,239,241,244,247,249,252,255 ];

function isFloat(n) {
    return n === +n && n !== (n|0);
}

function isInteger(n) {
    return n === +n && n === (n|0);
}

class HSVColor {
	constructor(h,s,v) {
		this._h = h;
		this._s = s;
		this._v = v;
	}

	get rgb() {
		let val = colorconvert.hsv.rgb(this._h, this._s, this._v);
		return new RGBColor(val[0],val[1],val[2]);
	}

	get hsv() {
		return this;
	}
}

class RGBColor {
	constructor(r,g,b) {
		this._r = r;
		this._g = g;
		this._b = b;
	}

	get red() { return this._r; };
	get green() { return this._g; };
	get blue() { return this._b; };

	get r() { return this._r; };
	get g() { return this._g; };
	get b() { return this._b; };

	get hsv() {
		let val = colorconvert.rgb.hsv(this._r, this._g, this._b);
		return new HSVColor(val[0],val[1],val[2]);
	}

	get rgb() {
		return this;
	}

	get gammaCorrectedColor() {
		return new RGBColor(gamma8_table[this.red],gamma8_table[this.green],gamma8_table[this.blue]);
	}

	toString () {
        return `RGB | (${this.r},${this.g},${this.b})`
    }
}

class PanelBuffer {
	get width() { return this._width; };
	get height() { return this._heigth; };
	get size() { return this._width * this._height; };
	get buffer() {
		let result = Buffer.allocUnsafe(this.size * 3);
		var b = 0;
		for(var i=0; i < this.size; i++) {
			var rgb = this.getColorAt(i).rgb;
			result[b++] = rgb.red;
			result[b++] = rgb.green;
			result[b++] = rgb.blue;
		}
		return result;
	}

	constructor(w,h) {
		this._width = w;
		this._height = h;
		this._buf = new Array(this.size);
		// Todo: fill with black color
	}

	setColorAt(index, color) {
		if (!Number.isInteger(index)) throw new Error(`Index needs to be an integer value. Was ${index}`);
		if (index < 0) throw new Error(`Index below zero. Was ${index}`);
		if (index >= this.size) throw new Error(`Index out of bounds. Was ${index}`);
		this._buf[index] = color;
	}

	getColorAt(index) {
		if (!Number.isInteger(index)) throw new Error(`Index needs to be an integer value. Was ${index}`);
		if (index < 0) throw new Error(`Index below zero. Was ${index}`);
		if (index >= this.size) throw new Error(`Index out of bounds. Was ${index}`);
		if (index < 0) throw new Error('Index below zero.');
		if (index >= this.size) throw new Error('Index out of bounds.');
		return this._buf[index];
	}

	fill(color) {
		for(var i=0; i < this.size; i++) {
			this.setColorAt(i,color);
		}
	}
}

module.exports = class Panel{
	static get FILL() { return 1; };
	static get WRITE_RAW() { return 2; };
	static get SET_PIXEL_AT() { return 3; };
	static get SHOW() { return 4; };

	static get NONE() { return 0; };
	static get RGB() { return 0; };
	static get HSV() { return 1; };
	static get UPDATE() { return 2; };
	
	static get MODE_ZIGZAG() { return 1; };
	static get MODE_LTR() { return 2; };

	static RGBColor(r,g,b) { return new RGBColor(r,g,b); };
	static HSVColor(h,s,v) { return new HSVColor(h,s,v); };

	static get Black() { return Panel.RGBColor(0,0,0); };
	static get White() { return Panel.RGBColor(255,255,255); };
	static get Red() { return Panel.RGBColor(255,0,0); };
	static get Green() { return Panel.RGBColor(0,255,0); };
	static get Blue() { return Panel.RGBColor(0,0,255); };
	
	constructor(ip, port, width, height, mode=Panel.MODE_ZIGZAG) {
		this._ip   = ip;
		this._port = port;
		this._client = dgram.createSocket('udp4');
		this._width = width,
		this._height = height,
		this._mode = mode;		
		this._buffer = new PanelBuffer(width, height);
		this.fill(Panel.Black);
	}

	get port() { return this._port; };
	get ip() { return this._ip; };
	get width() { return this._width; };
	get height() { return this._height; };


	_send(message) {
		return new Promise( (resolve, reject) => {
			this._client.send(message, this.port, this.ip, (err) => {
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

	fill(color, update = false, direct = false) {
		if (direct) {
			let rgb = color.rgb;
			let buf = Buffer.allocUnsafe(5);
			buf[0] = Panel.FILL;
			buf[1] = (update ? Panel.UPDATE : Panel.NONE);
			buf[2] = rgb.red;
			buf[3] = rgb.green;
			buf[4] = rgb.blue;
			return this._send(buf);
		}
		this._buffer.fill(color);
		if (update) return this.update();
		return this;
	}

	writeBitmaskRow(row, color, value) {
		if (row < 0) throw new Error(`Invalid row number. Got ${row}. Should be a value between 0 and ${this.height - 1}`);
		if (row >= this.height) throw new Error(`Invalid row number. Got ${row}. Should be a value between 0 and ${this.height - 1}`);
		var bitmask = 1;
		for (var i=this.width-1; i>=0; i--) {
			this.setPixelXY(i,row,value & bitmask ? color : Panel.Black);
			bitmask = bitmask << 1;
		}
		return this;
	}

	writeBitmaskColumn(column, color, value) {
		if (column < 0) throw new Error(`Invalid column number. Got ${column}. Should be a value between 0 and ${this.width - 1}`);
		if (column >= this.width) throw new Error(`Invalid column number. Got ${column}. Should be a value between 0 and ${this.width - 1}`);
		var bitmask = 1;
		for (var i=0; i<this.height; i++) {
			this.setPixelXY(column,i,value & bitmask ? color : Panel.Black);
			bitmask = bitmask << 1;
		}
		return this;
	}

	_getIndex(x,y) {
		if ((this._mode === Panel.MODE_ZIGZAG) && (y & 1 === 1)) {
			return (y+1)*this._width-x-1;
		}
		return y*this._width+x;
	}

	
	setPixelXY(x,y, color, update = false, direct = false) {
		if (direct) {
			return this.setPixelAt(this._getIndex(x,y), color.red, color.green, color.blue, update);
		}
		this._buffer.setColorAt(this._getIndex(x,y), color);
		if (update) return this.update();
		return this;
	}

	setPixelAt(i, color, update = false, direct = false) {
		if (direct) {
			let rgb = color.rgb.gammaCorrectedColor;
			let buf = Buffer.allocUnsafe(6);
			buf[0] = Panel.SET_PIXEL_AT;
			buf[1] = (update ? Panel.UPDATE : Panel.NONE);
			buf[2] = i;
			buf[3] = rgb.red;
			buf[4] = rgb.green;
			buf[5] = rgb.blue;
			return this._send(buf);
		};
		this._buffer.setColorAt(i, color);
		if (update) return this.update();
		return this;
	}

	show() {
		let buf = Buffer.allocUnsafe(1);
		buf[0] = Panel.SHOW;
		return this._send(buf);		
	}

	update(update = true) {
		let buf = Buffer.allocUnsafe(4+(this._buffer.size*3));
		buf[0] = Panel.WRITE_RAW;
		buf[1] = (update ? Panel.UPDATE : Panel.NONE);
		buf[2] = this._buffer.size;
		buf[3] = 0;
		let panelbuffer = this._buffer.buffer;
		panelbuffer.copy(buf,4);
		for (var i=4; i<buf.length; i++) {
			buf[i] = gamma8_table[buf[i]];
		}
		return this._send(buf);
	}

	setPixels(colors, offset = 0, update = false) {
		for (var i=0; i<colors.length; i++) {
			this.setPixelAt(i+offset, colors[i]);
		}
		if (update) return this.update();
		return this;
	}

	showSprite(path, update=false) {
		let me = this;
		return new Promise( (resolve, reject) => {
			this._buffer.fill(Panel.Black);
		
			getPixels(path, function(err, pixels) {
				if (err) return reject(err);
				let width = pixels.shape[0];
				let height = pixels.shape[1];
				let channels = pixels.shape[2];
				for (var x=0; x<width; x++) {
					for (var y=0; y<height; y++) {
						let index = me._getIndex(x,y);
						if (index < 49) {
							me._buffer.setColorAt(index, new RGBColor(pixels.get(x,y,0),pixels.get(x,y,1),pixels.get(x,y,2)));
						};
					}
				}
				
				if (update) return me.update();
				return Promise.resolve(); 
			});
		});
	}

}
