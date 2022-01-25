
const paintOptions = document.getElementById('paint-options');
const canvas = document.getElementById('drawing-board');
const clearButton = document.getElementById('clear');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const context = canvas.getContext('2d');
const colorSelector = document.getElementById('stroke');
const lineWidths = document.getElementById('line-widths');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

const defaultFilename = 'nftpaint-untitled.png';
let filename = defaultFilename;

let imageHistory = [];
let imageHistoryIndex = -1;
let isPainting = false;
let lineWidth = 5;
let colors = [
	'#ff0000',
	'#ffff00',
	'#00ff00',
	'#00ffff',
	'#0000ff',
	'#ff00ff',
	'#ffffff',
	'#000000'
];
let startX;
let startY;

export const toFile = () => {
	    const dataurl = canvas.toDataURL("image/png"),
			arr = dataurl.split(','),
	        mime = arr[0].match(/:(.*?);/)[1],
	        bstr = atob(arr[1]);

		let n = bstr.length,
			u8arr = new Uint8Array(n);

	    while(n--){
	        u8arr[n] = bstr.charCodeAt(n);
	    }

	    return new File([u8arr], getFilename(), {type:mime});
	},
	getFilename = () => {
		try {
	        filename = localStorage.nftPaintFilename || filename || defaultFilename;
		} catch (err) {
			displayModal(err);
		}

		return filename;
	},
	setFilename = (_filename) => {
		if (typeof _filename !== 'string' || _filename.length < 1) {
			displayModal('Filename is not valid.');
			return;
		}

		filename = _filename.trim();

		try {
	        localStorage.nftPaintFilename = filename;
		} catch (err) {
			displayModal(err);
		}
	},
	clearFilename = () => {
		try {
	        filename = localStorage.nftPaintFilename = defaultFilename;
		} catch (err) {
			displayModal(err);
		}

		return filename;
	};

const drawStart = (e) => {
		const touch = (e.touches || [])[0] || e;
		isPainting = true;
	    startX = touch.clientX;
	    startY = touch.clientY;
		draw(e);
	},
	drawEnd = (e) => {
	    isPainting = false;
	    context.stroke();
	    context.beginPath();
		saveToStorage();
		saveToHistory();
	},
	draw = (e) => {
		if (!isPainting) {
	        return;
	    }

		const touch = (e.touches || [])[0] || e;

	    context.lineWidth = lineWidth;
	    context.lineCap = 'round';

	    context.lineTo(touch.clientX - canvasOffsetX, touch.clientY - canvasOffsetY);
	    context.stroke();
	},
	loadSavedImage = () => {
		const img = document.createElement("img");
		img.onload = () => {
			context.drawImage(img, 0, 0, img.width, img.height);
		};
		if (localStorage.nftPaint) {
			img.src = localStorage.nftPaint;
		}
		imageHistory.push(localStorage.nftPaint);
		imageHistoryIndex = 0;

		undoRedoState();
	},
	saveToStorage = () => {
		const dataUrl = canvas.toDataURL("image/png");
		try {
	        localStorage.nftPaint = canvas.toDataURL(dataUrl);
		} catch (err) {
			displayModal(err);
		}
	},
	saveToHistory = () => {
		const dataUrl = canvas.toDataURL("image/png");
		imageHistory = imageHistory.slice(0, imageHistoryIndex + 1);
		imageHistory.push(dataUrl);
		imageHistoryIndex = imageHistory.length - 1;
		undoRedoState();
	},
	clear = () => {
		saveToStorage();
		context.clearRect(0, 0, canvas.width, canvas.height);
		localStorage.removeItem('nftPaint');
		clearFilename();
		saveToHistory();
		undoRedoState();
	},
	undo = () => {
		if (imageHistoryIndex > 0) {
			imageHistoryIndex = imageHistoryIndex - 1;

			const dataUrl = imageHistory[imageHistoryIndex],
				img = document.createElement("img");

			if (dataUrl) {
				img.onload = () => {
			        context.clearRect(0, 0, canvas.width, canvas.height);
					context.drawImage(img, 0, 0, img.width, img.height);
					saveToStorage();
				};
				img.src = dataUrl;
			} else {
				clear();
			}
		}

		undoRedoState();
	},
	redo = () => {

		if (imageHistoryIndex < imageHistory.length - 1) {

			imageHistoryIndex = imageHistoryIndex + 1;
			const dataUrl = imageHistory[imageHistoryIndex],
				img = document.createElement("img");

			img.onload = () => {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(img, 0, 0, img.width, img.height);
				saveToStorage();
			};
			img.src = dataUrl;
		}

		undoRedoState();

	},
	undoRedoState = () => {

		if (imageHistoryIndex > 0) {
			undoButton.removeAttribute('disabled');
		} else {
			undoButton.disabled = 'disabled';
		}

		if (imageHistoryIndex < imageHistory.length - 1) {
			redoButton.removeAttribute('disabled');
		} else {
			redoButton.disabled = 'disabled';
		}

		if (localStorage.nftPaint) {
			clearButton.removeAttribute('disabled');
		} else {
			clearButton.disabled = 'disabled';
		}
	},
	resizeCanvas = () => {
		const canvasOffsetX = canvas.offsetLeft;
		const canvasOffsetY = canvas.offsetTop;
		canvas.width = window.innerWidth - canvasOffsetX;
		canvas.height = window.innerHeight - (canvasOffsetY + paintOptions.offsetHeight);
	},
	selectLineWidth = (width) => {
		if (width > 0) {
			const lineWidthButton = document.getElementById(`line-width-${width}`),
				selectedLineWidthButton = document.querySelector('.line-width.selected');

			lineWidth = width;

			if (selectedLineWidthButton) {
				selectedLineWidthButton.classList.remove('selected');
			}

			lineWidthButton.classList.add('selected');
		}
	},
	processColor = (str) => {
		if (str.indexOf('#') === 0) {
			return str;
		} else {
			const comps = str.replace(/[^\d,]+/g, '').split(',');
			return '#' + comps.map(x => {
				const hex = parseInt(x).toString(16);
				return hex.length === 1 ? '0' + hex : hex;
			}).join('');
		}
	},
	selectColor = (color) => {
		console.log('Select color:', color);

		color = processColor(color);

		const colorBlocks = document.querySelectorAll('.color-block');

		let _colors = [color];

		colors.forEach(_color => {
			if (_color !== color) {
				_colors.push(_color);
			}
		});

		colors = _colors.slice(0,8);
		console.log('colors', colors);

		colorBlocks.forEach((colorBlock, i) => {
			colorBlock.style.backgroundColor = colors[i];
		});

	    context.strokeStyle = color;
		colorSelector.value = color;
	},
	initColors = () => {
		const colorBlocks = document.querySelectorAll('.color-block'),
			colorSelector = document.getElementById('stroke');

		colorBlocks.forEach((colorBlock, i) => {
			colorBlock.style.backgroundColor = colors[i];
			colorBlock.addEventListener('click', e => {
				const color = e.target.style.backgroundColor;
				selectColor(color);
			});
		});
	};

undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
clearButton.addEventListener('click', clear);

canvas.addEventListener('mousedown', drawStart);
canvas.addEventListener('mouseup', drawEnd);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', drawStart);
canvas.addEventListener('touchend', drawEnd);
canvas.addEventListener('touchmove', draw);

colorSelector.addEventListener('change', e => {
	const color = e.target.value;
	selectColor(color);
});

lineWidths.addEventListener('click', e => {
	const targetId = e.target.closest('.line-width').id || '5',
		_lineWidth = targetId.replace('line-width-', '');
	selectLineWidth(_lineWidth);
});

loadSavedImage();
resizeCanvas();
selectLineWidth(lineWidth);
initColors();
