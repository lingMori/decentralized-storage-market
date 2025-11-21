const Web3 = require('web3').default;

// 使用你的以太坊节点的URL创建一个新的web3实例
const web3 = new Web3('https://goerli.infura.io/v3/d0a678444e0543388d9c6dcd5c7eed6e');

// 合约ABI和地址
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "numbers",
                "type": "uint256[]"
            }
        ],
        "name": "calculateSum",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes[]",
                "name": "_hashes",
                "type": "bytes[]"
            },
            {
                "internalType": "bytes[][]",
                "name": "_hhashs",
                "type": "bytes[][]"
            }
        ],
        "name": "storeHashes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "hashes",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "hhashs",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "sum",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
const contractAddress = "0x880bb3AA0d1C9257C103ab21152Fd36bE52096a7";

// 创建合约实例
const contract = new web3.eth.Contract(contractABI, contractAddress);

// // 设置发送交易的账户
// const account = web3.eth.accounts.privateKeyToAccount('7acbdaf9fc1c2c9592602364d111c0a4d593b6e67b1a2fa31129de90bf26c150'); // 这里替换为你的私钥
// web3.eth.accounts.wallet.add(account);
// web3.eth.defaultAccount = account.address;

// // 调用合约的某个方法
// contract.methods.myMethod().send({ from: account.address })
//     .then(function(receipt){
//         console.log(receipt);

// // 需要调用函数的账户地址和私钥（注意在实际环境中保护私钥）
// const accountAddress = '0xe61537B2B02ba6443E2C2A568cA69d461D5e2eBf';
// const privateKey = '7acbdaf9fc1c2c9592602364d111c0a4d593b6e67b1a2fa31129de90bf26c150';
//
// // 你希望在调用calculateSum时使用的参数
// const numbers = [1, 2, 3]; // 示例值
//
// async function calculateSum() {
//     const gasPrice = await web3.eth.getGasPrice();
//     const gasEstimate = await contract.methods.calculateSum(numbers).estimateGas({ from: accountAddress });
//
//     const tx = {
//         from: accountAddress,
//         to: contractAddress,
//         gas: gasEstimate,
//         gasPrice: gasPrice,
//         data: contract.methods.calculateSum(numbers).encodeABI()
//     };
//
//     const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
//
//     web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//         .on('receipt', console.log)
//         .on('error', console.error);
// }
//
// // 调用函数
// calculateSum().catch(console.error);

// _hashes 作为单个字节数组
const _hashes = ['0x1234', '0xabcd'].map(hexStr => {
    const buffer = Buffer.from(hexStr.slice(2), 'hex');
    return web3.eth.abi.encodeParameter('bytes', new Uint8Array(buffer));
});

// _hhashes 作为二维字节数组
const _hhashs = [['0x1234', '0xabcd'], ['0x1234', '0xabcd']].map(arr => {
    return arr.map(hexStr => {
        const buffer = Buffer.from(hexStr.slice(2), 'hex');
        return web3.eth.abi.encodeParameter('bytes', new Uint8Array(buffer));
    });
});

async function storeHashes() {
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods.storeHashes(_hashes, _hhashs).estimateGas({ from: accountAddress });

    const tx = {
        from: accountAddress,
        to: contractAddress,
        gas: gasEstimate,
        gasPrice: gasPrice,
        data: contract.methods.storeHashes(_hashes, _hhashs).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        .on('error', console.error);
}

// 调用函数
storeHashes().catch(console.error);

