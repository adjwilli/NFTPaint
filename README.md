# NFTPaint

Draw a picture or snap a photobooth filter image and export it as an NFT using Moralis (http://moralis.io).

See this project in action at https://nftpaint.app.

I started this project as an experiment to learn more about Web3 and NFTs. Since I don't have plans to work on it much more, I open-sourced it hoping it can provide good examples of some less common JavaScript features. Below are a list of where these can be found in the code:

• a basic canvas paint app with selctable colors and brush sizes, and undo-redo (https://github.com/adjwilli/NFTPaint/blob/main/src/components/drawing-board.js)

• directly accessing a webcam and applying standard filters (https://github.com/adjwilli/NFTPaint/blob/main/src/components/camera.js)

• lazy-minting NTFs using Moralis (https://github.com/adjwilli/NFTPaint/blob/main/src/pages/index.js#L84-L130)

• Exporting HTML canvas as a file and uploading to IPFS (https://github.com/adjwilli/NFTPaint/blob/main/src/components/file-utils.js and (https://github.com/adjwilli/NFTPaint/blob/b428c9d63827d4da9f5ed32b7789c5c6d7f8e054/src/pages/index.js#L62-L85)

• Building an app using NodeJS, Express, Webpack, Babel, and SASS (https://github.com/adjwilli/NFTPaint/blob/main/package.json#L14-L38) and hosting it on Google App Engine (https://github.com/adjwilli/NFTPaint/blob/main/app.yaml)
