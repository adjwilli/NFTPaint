
const toolbar = document.getElementById('toolbar');
const canvas = document.getElementById('drawing-board');
const context = canvas.getContext('2d');
let imageHistory = [];
let imageHistoryIndex;

const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let lineWidth = 5;
let startX;
let startY;

export const dataUrl = () => canvas.toDataURL("image/png");

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
		if (localStorage.nftPaint) {
			const img = document.createElement("img");
			img.onload = () => {
				context.drawImage(img, 0, 0, img.width, img.height);
			};
			img.src = localStorage.nftPaint;
		}
		imageHistory.push(localStorage.nftPaint);
		imageHistoryIndex = 0;
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
		imageHistory = imageHistory.slice(0,imageHistoryIndex + 1);
		imageHistory.push(dataUrl);
		imageHistoryIndex = imageHistory.length - 1;
	},
	clear = () => {
		saveToStorage();
		context.clearRect(0, 0, canvas.width, canvas.height);
		saveToHistory();
	},
	undo = () => {
		console.log('imageHistory', imageHistory);
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
			}
		}

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
	};

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
		clear(e);
	} else if (e.target.id === 'undo') {
        undo(e);
	} else if (e.target.id === 'redo') {
        redo(e);
	}
});


toolbar.addEventListener('change', e => {
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
