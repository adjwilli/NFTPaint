import "./submit.scss";

const Moralis = require('moralis');

const toolbar = document.getElementById('toolbar');

const buttons = document.getElementById('buttons');
const modal = document.getElementById('modal');
const closeButton = document.getElementById('close');
const modalMessage = document.getElementById('modal-message');

const loginForm = document.getElementById('login-form');
const loginButton = document.getElementById('log-in');

const uploadForm = document.getElementById('upload-form');
const uploadButton = document.getElementById('uploadButton');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');

toolbar.addEventListener('click', e => {
	if (e.target.id === 'logout') {
		Moralis.User.logOut();
		user = false;
		initUser();
	}
});

closeButton.addEventListener('click', e => {
	closeModal(e);
});

loginButton.addEventListener('click', e => {
	e.preventDefault();
	login();
});

uploadButton.addEventListener('click', e => {
	e.preventDefault();
	uploadImage();
});

fileInput.addEventListener('change', e => {

	const metadataName = document.getElementById('metadataName');

	const file = fileInput.files[0];

	metadataName.value = file.name;

	const img = document.createElement("img");

	img.file = file;

	preview.appendChild(img);

    const reader = new FileReader();
    reader.onload = ((_img) => {
		return (e) => { _img.src = e.target.result; };
	})(img);
    reader.readAsDataURL(file);

	fileInput.style.display = 'none';
});

const closeModal = (e) => {
		modal.style.display = 'none';
		modalMessage.innerHTML = '';
	},
	displayModal = (message, button) => {
		console.log(message);
		modalMessage.innerHTML = message;
		if (button) {
			modalMessage.appendChild(button);
		}
		modal.style.display = 'block';
	},
	login = () => {
		user = Moralis.authenticate({ signingMessage: "Log in using Moralis" }).then(_user => {
			console.log("logged in user:", _user);
			initUser();
			closeModal();
		}).catch(function (error) {
			displayModal(error);
		});
	},
	initUser = () => {
		if (user) {
			const logoutButton = document.createElement("button");
			logoutButton.innerText = 'Log-out';
			logoutButton.id = 'logout';
			buttons.appendChild(logoutButton);
			//console.log(user.get("ethAddress"));

			loginForm.style.display = 'none';
			uploadForm.style.display = 'block';
		} else {
			const logoutButton = document.getElementById('logout');
			if (logoutButton) {
				logoutButton.remove();
			}

			loginForm.style.display = 'block';
			uploadForm.style.display = 'none';
		}
	};

const serverUrl = "https://1g7kkxivghof.usemoralis.com:2053/server";
const appId = "jU999BVgaiapYNxVNgi3yTzPmqaNS8oMpEOmBi4T";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();
initUser();

const uploadImage = async () => {
	console.log('Uploading image to IPFS');

	const data = fileInput.files[0];
	const file = new Moralis.File(data.name, data);

	await file.saveIPFS();
	console.log(file.ipfs(), file.hash());

	const ipfsUrl = file.ipfs();
	uploadForm.innerHTML = `Successfully uploaded image to <a href="${ipfsUrl}">${ipfsUrl}</a>`;

	return file.ipfs();
};
