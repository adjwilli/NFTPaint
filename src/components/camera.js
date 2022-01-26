import * as Modal from '../components/modal.js';
import * as FileUtils from '../components/file-utils.js';

const cameraOptions = document.getElementById('camera-options');

const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
const takePhotoButton = document.querySelector('#take-photo');
const retakePhotoButton = document.querySelector('#retake-photo');
const filters = document.querySelector('#filters');

const offsetX = video.offsetLeft;
const offsetY = video.offsetTop;

let mode = 'video';

export const init = () => {

		const dimensions = getDimensions(),
			constraints = {
				audio: false,
				video: {
					width: {
						exact: dimensions.width
					},
					height: {
						exact: dimensions.height
					}
				}
			};

		canvas.style.display = 'none';
		retakePhotoButton.style.display = 'none';

		navigator.mediaDevices.getUserMedia(constraints).then(stream => {
			window.stream = stream; // make stream available to browser console
			video.srcObject = stream;
			console.log('stream', stream);
		}).catch(err => {
			Modal.display(err);
		});

		resizeCanvasAndVideo();
	},
	getFilename = FileUtils.getFilename,
	clearFilename = FileUtils.clearFilename,
	setFilename = FileUtils.setFilename,
	toFile = () => {
		if (mode == 'video') {
			takePhoto();
		}
		return FileUtils.toFile();
	};

const getDimensions = () => {
		return {
			width: window.innerWidth - offsetX,
			height: window.innerHeight - (offsetY + cameraOptions.offsetHeight)
		};
	},
	resizeCanvasAndVideo = () => {
		const dimensions = getDimensions();
		video.width = dimensions.width;
		video.height = dimensions.height;
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
	},
	filterHandler = (e) => {
		const clickId = e.target.id,
			filters = [
				'none',
				'grayscale',
				'invert',
				'sepia',
				'blur',
				'superblur'
			];
		let arg = '',
			filter = 'none';

		console.log('Click: ', clickId);
		if (filters.indexOf(clickId) > -1) {
			video.className = clickId;

			if (clickId == 'blur') {
				arg = '3px';
			}

			filter = `${clickId}(${arg})`;

			canvas.getContext('2d').filter = filter;
		}
	},
	takePhoto = () => {
		canvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height);
		mode = 'canvas';

		video.style.display = 'none';
		canvas.style.display = 'block';

		takePhotoButton.style.display = 'none';
		retakePhotoButton.style.display = 'inline-block';
	},
	retakePhoto = () => {
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		mode = 'video';

		video.style.display = 'block';
		canvas.style.display = 'none';

		takePhotoButton.style.display = 'inline-block';
		retakePhotoButton.style.display = 'none';

		Modal.close();
	};

filters.addEventListener('click', filterHandler);
takePhotoButton.addEventListener('click', takePhoto);
retakePhotoButton.addEventListener('click', retakePhoto);
