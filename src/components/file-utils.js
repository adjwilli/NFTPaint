import * as Modal from '../components/modal.js';

const canvas = document.getElementById('drawing-board');
const defaultFilename = 'nftpaint-untitled.png';

let filename = defaultFilename;

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
			Modal.display(err);
		}

		return filename;
	},
	setFilename = (_filename) => {
		if (typeof _filename !== 'string' || _filename.length < 1) {
			Modal.display('Filename is not valid.');
			return;
		}

		filename = _filename.trim();

		try {
	        localStorage.nftPaintFilename = filename;
		} catch (err) {
			Modal.display(err);
		}
	},
	clearFilename = () => {
		try {
	        filename = localStorage.nftPaintFilename = defaultFilename;
		} catch (err) {
			Modal.display(err);
		}

		return filename;
	};
