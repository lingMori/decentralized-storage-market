const IPFS = require('ipfs-http-client');
const Web3 = require('web3');
const { exec } = require('child_process');


// 配置IPFS节点和以太坊网络的相关信息
const ipfs = new IPFS({ host: 'localhost', port: 5001, protocol: 'https' });
const web3 = new Web3('https://goerli.infura.io/v3/cbfaca3f8e2f476f8329d48c4ffc302a');

// 合约 ABI 和地址
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "cid",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "addData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "cid",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "DataAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "cid",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "DataQueried",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "cid",
                "type": "bytes32"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "queryData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];
const contractAddress = '0x88433331671f42AB6f96a4E9d7a0e0E2C6E75333'; // 智能合约地址

// 要上传的文件路径
const filePath = '/Users/panzhuochen/offchain-storage/core/api/data/test.txt'; // 文件路径

function uploadFileToIPFS(filePath) {
    return new Promise((resolve, reject) => {
        const command = `ipfs add "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error uploading file to IPFS:', error);
                reject(error);
                return;
            }

            const output = stdout.trim();
            const cid = output.split(' ')[1]; // 提取输出中的CID

            resolve(cid);
        });
    });
}

async function addDataToContract(cid) {
    try {
        // 实例化合约
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // 假设调用addData函数的账户已经解锁并且有足够的Gas和Ether来执行交易
        const accounts = await web3.eth.getAccounts();
        const sender = accounts[0];

        // 调用智能合约的addData函数
        const tx = await contract.methods.addData(cid, sender).send({ from: sender });
        console.log('Transaction Hash:', tx.transactionHash);
    } catch (error) {
        console.error('Error adding data to contract:', error);
        throw error;
    }
}

// 主函数：上传文件到IPFS并添加数据到智能合约
async function main() {
    try {
        const fileCID = await uploadFileToIPFS(filePath);
        console.log('File uploaded to IPFS. CID:', fileCID);

        await addDataToContract(fileCID);
        console.log('Data added to the contract.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// 执行主函数
main();
