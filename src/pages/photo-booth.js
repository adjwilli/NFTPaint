import "./photo-booth.scss";

import * as Camera from '../components/camera.js';
import * as Modal from '../components/modal.js';

const Moralis = require('moralis');

const buttons = document.getElementById('buttons');

const login = () => {
		user = Moralis.authenticate({ signingMessage: "Log in using Moralis" }).then(_user => {
			console.log("logged in user:", _user);
			initUser();
			Modal.close();
			chooseFilename();
			gtag('event', 'login-success');
		}).catch(function (error) {
			if (error.toString().indexOf('Non ethereum enabled browser') > -1) {
				Modal.display(`You need to install <a href="https://metamask.io/download/" target="_metaMask">MetaMask</a> or another Web3 wallet to export as an NFT.`);
			} else {
				Modal.display(error);
			}
			user = false;
			gtag('event', 'non-ethereum-browser');
		});
	},
	initUser = () => {
		if (user) {
			const logoutButton = document.createElement("button");
			logoutButton.innerText = 'Log-out';
			logoutButton.id = 'logout';
			buttons.appendChild(logoutButton);
			console.log('User: ', user);
		} else {
			const logoutButton = document.getElementById('logout');
			if (logoutButton) {
				logoutButton.remove();
			}
		}
	},
	chooseFilename = () => {
		console.log('chooseFilename');
		const nextButton = document.createElement('button');
		nextButton.innerText = 'Next';
		nextButton.addEventListener('click', e => {
			const filenameInput = document.getElementById('filename');
			if (filenameInput.value.length > 0) {
				Camera.setFilename(filenameInput.value);
			} else {
				Camera.clearFilename();
			}
			exportNFT();
		});

		Moralis.enableWeb3();
		Modal.display(`NFT Name: <input type="text" name="filename" id="filename" value="${Camera.getFilename()}" />`, nextButton);
		gtag('event', 'nft-filename');
	};

const exportNFT = async () => {
	console.log('Exporting NFT');

	const data = Camera.toFile();

	const imageFile = new Moralis.File(data.name, data);
    await imageFile.saveIPFS();
    let imageHash = imageFile.hash();

	const ipfsUrl = imageFile.ipfs();
	Modal.display(`Successfully uploaded image to <a href="${ipfsUrl}">${ipfsUrl}</a>`);
	gtag('event', 'nft-ipfs');

    let metadata = {
        name: data.name,
        description: `${data.name} was created with https://NFTPaint.app`,
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

	user = Moralis.User.current();

	const config = {
        chain: 'eth',
        userAddress: user.get('ethAddress'),
        tokenType: 'ERC721',
        tokenUri: 'ipfs://' + metadataHash,
        royaltiesAmount: 10,
        list: true,
        listTokenAmount: 1,
        listTokenValue: 10 ** 18,
        listAssetClass: 'ETH'
    };

	try {
		console.log('config', config);
	    let res = await Moralis.Plugins.rarible.lazyMint(config),
			nftUrl = `https://rarible.com/token/`;

	    console.log('res', res);

		if (typeof res.data === 'undefined') {

			Modal.display(`An error occured while minting NFT.`);

		} else {
			if (typeof res.data.result !== 'undefined' && typeof res.data.result.tokenAddress !== 'undefined') {
				nftUrl = nftUrl + `${res.data.result.tokenAddress}:${res.data.result.tokenId}`;
			} else if (typeof res.triggers !== 'undefined') {
				res.triggers.forEach(trigger => {
					if (trigger.endpoint == 'createSellOrder') {
						nftUrl = nftUrl + `${trigger.params.makeTokenAddress}:${trigger.params.makeTokenId}`;
					}
				});
			}

			Modal.display(`NFT minted. <a href="${nftUrl}" target="_rarible">View on Rarible</a>`);
			gtag('event', 'nft-minted');
		}

	} catch (err) {
		Modal.display(err);
		gtag('event', 'nft-error');
	}
};

const serverUrl = "https://1g7kkxivghof.usemoralis.com:2053/server";
const appId = "jU999BVgaiapYNxVNgi3yTzPmqaNS8oMpEOmBi4T";

Moralis.start({ serverUrl, appId });

let user = Moralis.User.current();

initUser();

buttons.addEventListener('click', e => {
	if (e.target.id === 'logout') {
		Moralis.User.logOut();
		user = false;
		initUser();
		gtag('event', 'logout');
	} else if (e.target.id === 'export') {
		if (!user) {
			const loginButton = document.createElement('button');
			loginButton.innerText = 'Log-in';
			loginButton.addEventListener('click', login);
			Modal.display(`To export as an NFT, you must first log in.`, loginButton);
			gtag('event', 'login-display');
		} else {
			chooseFilename();
		}
	}
});

Camera.init();
