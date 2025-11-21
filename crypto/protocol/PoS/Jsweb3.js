const Web3 = require('web3').default;

// 使用你的以太坊节点的URL创建一个新的web3实例
const web3 = new Web3('https://goerli.infura.io/v3/cbfaca3f8e2f476f8329d48c4ffc302a');

// 合约ABI和地址
const contractABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "value",
                "type": "address"
            }
        ],
        "name": "Log_address",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bytes",
                "name": "value",
                "type": "bytes"
            }
        ],
        "name": "Log_bytes",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "value",
                "type": "bytes32"
            }
        ],
        "name": "Log_bytes32",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "bytes[]",
                "name": "value",
                "type": "bytes[]"
            }
        ],
        "name": "Log_bytess",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Log_uint256",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "string",
                "name": "message",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "value",
                "type": "uint256[]"
            }
        ],
        "name": "Log_uint256s",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "begin",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "node",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "butterflyParents",
        "outputs": [
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
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "computeBasic",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
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
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "sources",
                "type": "uint256"
            }
        ],
        "name": "computeButterfly",
        "outputs": [
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
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "firstXi",
                "type": "uint256"
            }
        ],
        "name": "computeSink",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
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
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "node",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getGraph",
        "outputs": [
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
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "node",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "getParents",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "market",
        "outputs": [
            {
                "internalType": "contract IDataMarketplace",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            }
        ],
        "name": "numButterfly",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "posData",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "pk",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "beta",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "root",
                "type": "bytes32"
            },
            {
                "components": [
                    {
                        "internalType": "bytes",
                        "name": "pk",
                        "type": "bytes"
                    },
                    {
                        "internalType": "uint256",
                        "name": "index",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "log2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "pow2",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "size",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct Verifier.Graph",
                "name": "graph",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "size",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pow2",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "log2",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "availableSpace",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pricePerGBPerMonth",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            }
        ],
        "name": "putUvarint",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "x",
                "type": "uint256"
            }
        ],
        "name": "putVarint",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "seed",
                "type": "bytes32"
            }
        ],
        "name": "selectChallenges",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_add",
                "type": "address"
            }
        ],
        "name": "setAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_pk",
                "type": "bytes"
            },
            {
                "internalType": "uint256",
                "name": "_index",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_beta",
                "type": "uint256"
            },
            {
                "internalType": "bytes32",
                "name": "_root",
                "type": "bytes32"
            },
            {
                "internalType": "uint256",
                "name": "_availableSpace",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_pricePerGBPerMonth",
                "type": "uint256"
            }
        ],
        "name": "setProof",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "node",
                "type": "uint256"
            },
            {
                "internalType": "bytes",
                "name": "hash",
                "type": "bytes"
            },
            {
                "internalType": "bytes[]",
                "name": "proof",
                "type": "bytes[]"
            },
            {
                "internalType": "bool",
                "name": "flag",
                "type": "bool"
            }
        ],
        "name": "verify",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256[]",
                "name": "challenges",
                "type": "uint256[]"
            },
            {
                "internalType": "bytes[]",
                "name": "hashes",
                "type": "bytes[]"
            },
            {
                "internalType": "bytes[][]",
                "name": "parents",
                "type": "bytes[][]"
            },
            {
                "internalType": "bytes[][]",
                "name": "proofs",
                "type": "bytes[][]"
            },
            {
                "internalType": "bytes[][][]",
                "name": "pProofs",
                "type": "bytes[][][]"
            }
        ],
        "name": "verifySpace",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const contractAddress = "0x077376b29ae9EC065Db86362F4510f1fE754aBFb";

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

// 需要调用函数的账户地址和私钥（注意在实际环境中保护私钥）
const accountAddress = '0xe61537B2B02ba6443E2C2A568cA69d461D5e2eBf';
const privateKey = '7acbdaf9fc1c2c9592602364d111c0a4d593b6e67b1a2fa31129de90bf26c150';

// 你希望在调用registerStorageProvider时使用的参数
const pk = '0x01'; // 示例值
const index = 1; // 示例值
const beta = 30; // 示例值
const root = '0xb5a19ebe2a85b54ae5e0b9d045b7e9062af6ebae64c0138e7ecd157097d5fc34'; // 示例值
const availableSpace = 1; // 示例值
const pricePerGBPerMonth = 100; // 示例值

// async function setProof(_pk, _index, _beta, _root, _availableSpace, _pricePerGBPerMonth) {
//     const gasPrice = await web3.eth.getGasPrice();
//     const gasEstimate = await contract.methods.setProof(_pk, _index, _beta, _root, _availableSpace, _pricePerGBPerMonth).estimateGas({ from: accountAddress });
//
//     const tx = {
//         from: accountAddress,
//         to: contractAddress,
//         gas: gasEstimate,
//         gasPrice: gasPrice,
//         data: contract.methods.setProof(_pk, _index, _beta, _root, _availableSpace, _pricePerGBPerMonth).encodeABI()
//     };
//
//     const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
//
//     web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//         .on('receipt', console.log)
//         .on('error', console.error);
// }
//
// // 调用函数，参数值需要替换为实际的值
// setProof(pk, index, beta, root, availableSpace, pricePerGBPerMonth).catch(console.error);



// // 你希望在调用verifySpace时使用的参数
// const challenges = [2,1,3,4,2,4]
// const hashes = ['0x2dae5d9fdc8e84a59fc994d3ee2dae5973555f3aacfa4ca3393703a1060fb0a0'];
// const parents = [['0xd97280638822588dabfb967892c3ecc06e544d35defe98742aa9ca594b1c4c9a']];
// const proofs = [['0xfb4772ce5ea2369a0d3922d1cbbb31bd7b8e18e4c86f915490579376bf916554']];
// const pProofs = [[['0xf353ad8c21041053c49a5d105431b58a83bba34304be2de5656ffc9cc4d97496']]];


// 你希望在调用verifySpace时使用的参数
const challenges = [1, 2, 3]; // 示例值，需要替换为实际值
const hashes = ['0x1234', '0xabcd']; // 示例值，需要替换为实际的哈希值
// 示例值，需要替换为实际值，parents，proofs和pProofs是二维和三维数组，需要注意格式和内容
const parents = [['0x1234', '0xabcd'], ['0x1234', '0xabcd']];
const proofs = [['0x1234', '0xabcd'], ['0x1234', '0xabcd']];
const pProofs = [[['0x1234', '0xabcd'], ['0x1234', '0xabcd']], [['0x1234', '0xabcd'], ['0x1234', '0xabcd']]];

async function verifySpace() {
    const gasPrice = await web3.eth.getGasPrice();
    const gasEstimate = await contract.methods.verifySpace(challenges, hashes, parents, proofs, pProofs).estimateGas({ from: accountAddress });

    const tx = {
        from: accountAddress,
        to: contractAddress,
        gas: gasEstimate,
        gasPrice: gasPrice,
        data: contract.methods.verifySpace(challenges, hashes, parents, proofs, pProofs).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);

    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        .on('receipt', console.log)
        .on('error', console.error);
}

// 调用函数
verifySpace().catch(console.error);
