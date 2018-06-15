'use strict';

class Color {
	get rgb() { return this; };
	get red() { return this._r; };
	get green() { return this._g; };
	get blue() { return this._b; };

	constructor(r,g,b) {
		this._r = r;
		this._g = g;
		this._b = b;
	}
}

module.exports = class PanelBuffer {
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

	color(r,g,b) { return new Color(r,g,b); };
}