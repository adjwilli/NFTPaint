
const paintOptions = document.getElementById('paint-options');
const canvas = document.getElementById('drawing-board');
const clearButton = document.getElementById('clear');
const undoButton = document.getElementById('undo');
const redoButton = document.getElementById('redo');
const context = canvas.getContext('2d');

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

const defaultFilename = 'nftpaint-untitled.png';
let filename = defaultFilename;

let imageHistory = [];
let imageHistoryIndex = -1;
let isPainting = false;
let lineWidth = 5;
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

		filename = _filename;

		try {
	        localStorage.nftPaintFilename = _filename;
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
	};

undoButton.addEventListener('click', undo);
redoButton.addEventListener('click', redo);
clearButton.addEventListener('click', clear);

paintOptions.addEventListener('change', e => {
    if (e.target.id === 'stroke') {
        context.strokeStyle = e.target.value;
    }

    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }

});

canvas.addEventListener('mousedown', drawStart);
canvas.addEventListener('mouseup', drawEnd);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', drawStart);
canvas.addEventListener('touchend', drawEnd);
canvas.addEventListener('touchmove', draw);

loadSavedImage();
resizeCanvas();
