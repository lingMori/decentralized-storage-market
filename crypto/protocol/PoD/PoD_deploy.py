from web3 import Web3, HTTPProvider
import json

# 连接到 Ethereum 节点
w3 = Web3(HTTPProvider('http://localhost:8545'))

# 读取智能合约的 ABI 和字节码
with open('./build/Verify.abi', 'r') as abi_definition:
    abi = json.load(abi_definition)
with open('./build/Verify.bin', 'r') as bytecode_file:
    bytecode = bytecode_file.read()

# 部署智能合约
YourContract = w3.eth.contract(abi=abi, bytecode=bytecode)
tx_hash = YourContract.constructor().transact({'from': "0x9C463f5781C2940a5Dc8ECB3A021dd60a3C01095"})

# 等待交易被挖矿
tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

# 获取新部署的智能合约的地址
contract_address = tx_receipt['contractAddress']
print(contract_address)
