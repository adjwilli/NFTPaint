import "./index.scss";

import * as DrawingBoard from '../components/drawing-board.js';

const Moralis = require('moralis');

const titlebar = document.getElementById('titlebar');

const buttons = document.getElementById('buttons');
const modal = document.getElementById('modal');
const closeButton = document.getElementById('close');
const modalMessage = document.getElementById('modal-message');

titlebar.addEventListener('click', e => {
	if (e.target.id === 'logout') {
		Moralis.User.logOut();
		user = false;
		initUser();
	} else if (e.target.id === 'export') {
		if (!user) {
			const loginButton = document.createElement('button');
			loginButton.innerText = 'Log-in';
			loginButton.addEventListener('click', login);
			displayModal(`To export as an NFT, you must first log in.`, loginButton);

		} else {
			Moralis.enableWeb3();
			exportNFT();
		}
	}
});

closeButton.addEventListener('click', e => {
	closeModal(e);
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
			console.log(user.get("ethAddress"));
		} else {
			const logoutButton = document.getElementById('logout');
			if (logoutButton) {
				logoutButton.remove();
			}
		}
	};


const serverUrl = "https://1g7kkxivghof.usemoralis.com:2053/server";
const appId = "jU999BVgaiapYNxVNgi3yTzPmqaNS8oMpEOmBi4T";
Moralis.start({ serverUrl, appId });
let user = Moralis.User.current();
initUser();

const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);

	let n = bstr.length,
		u8arr = new Uint8Array(n);

    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, {type:mime});
};

const exportNFT = async () => {
	console.log('Exporting NFT');

	const filename = 'nftpaint-untitled.png';
	const dataUrl = DrawingBoard.dataUrl();
	const data = dataURLtoFile(dataUrl, filename);

	const imageFile = new Moralis.File(data.name, data);
    await imageFile.saveIPFS();
    let imageHash = imageFile.hash();

	const ipfsUrl = imageFile.ipfs();
	displayModal(`Successfully uploaded image to <a href="${ipfsUrl}">${ipfsUrl}</a>`);

    let metadata = {
        name: filename,
        description: `${filename} was created by NFTPaint`,
        image: "/ipfs/" + imageHash
    };
    console.log(metadata);
    const jsonFile = new Moralis.File("metadata.json", {
		base64 : btoa(JSON.stringify(metadata))
	});
    await jsonFile.saveIPFS();

	console.log(jsonFile);

    let metadataHash = jsonFile.hash();
    console.log(jsonFile.ipfs(), 'ipfs://' + metadataHash);

	const config = {
        chain: 'rinkeby',
        userAddress: user.get('ethAddress'),
        tokenType: 'ERC721',
        tokenUri: 'ipfs://' + metadataHash,
        royaltiesAmount: 5, // 0.05% royalty. Optional
    };
	console.log('config', config);
    let res = await Moralis.Plugins.rarible.lazyMint(config);
    console.log(res);

	displayModal(`NFT minted. <a href="https://rinkeby.rarible.com/token/${res.data.result.tokenAddress}:${res.data.result.tokenId}">View NFT`);
};
