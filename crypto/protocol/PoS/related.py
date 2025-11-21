import ast

from web3 import Web3, HTTPProvider
from eth_account import Account
import json
import sys

# 连接到 Ethereum 节点
w3 = Web3(HTTPProvider('https://goerli.infura.io/v3/cbfaca3f8e2f476f8329d48c4ffc302a'))

# 你的私钥
private_key = 'aec560014c1cceed60964da0a97882e2751acc1b391cebe02b862eaabc59ffff'
account_address = '0x8F73b5Bdb089d06B30Fc548c48D45Bb3bcd5B894'

# 读取智能合约的 ABI 和字节码
with open('/Users/panzhuochen/offchain-storage/protocol/PoS/build/Verifier.abi', 'r') as abi_definition:
    abi = json.load(abi_definition)
with open('/Users/panzhuochen/offchain-storage/protocol/PoS/build/Verifier.bin', 'r') as bytecode_file:
    bytecode = bytecode_file.read()

deployed_contract = '0x614a15C5B8962Be8F8ec99c002E97a6B550566Ac'
contract = w3.eth.contract(address=deployed_contract, abi=abi)


def deploy_contract():
    # 构建合约
    Contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # 创建一个代表交易的字典，包括合约的构造函数和交易的参数
    transaction = Contract.constructor().build_transaction({
        'from': account_address,
        'gas': 5000000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'nonce': w3.eth.get_transaction_count(account_address),
    })

    # 使用私钥签署交易
    signed_tx = Account.sign_transaction(transaction, private_key)

    # 发送已签署的交易
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    # 等待交易被矿工打包并添加到区块链中
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    # 获取新合约的地址
    contract_address = tx_receipt['contractAddress']
    print(f"The contract was deployed at: {contract_address}")

    return contract_address


def send_set_proof_transaction(pk, index, beta, root, pricePerGBPerMonth):
    # 设置函数调用
    transaction = contract.functions.setProof(pk, index, beta, root, pricePerGBPerMonth).build_transaction({
        'from': account_address,
        'gas': 5000000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'nonce': w3.eth.get_transaction_count(account_address),
    })

    # 使用私钥签署交易
    signed_tx = Account.sign_transaction(transaction, private_key)

    # 发送已签署的交易
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    # 等待交易被矿工打包并添加到区块链中
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return tx_receipt


def send_verify_space_transaction(challenges, hashes, parents, proofs, pProofs):
    # 设置函数调用
    transaction = contract.functions.verifySpace(challenges, hashes, parents, proofs, pProofs).build_transaction({
        'from': account_address,
        'gas': 5735080,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'nonce': w3.eth.get_transaction_count(account_address),
    })

    # 使用私钥签署交易
    signed_tx = Account.sign_transaction(transaction, private_key)

    # 发送已签署的交易
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    # 等待交易被矿工打包并添加到区块链中
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print("Transaction receipt: {}".format(tx_receipt))

    # 获取 gas used
    gas_used = tx_receipt['gasUsed']

    # 获取交易详情，然后使用 gas price 和 gas used 计算
    tx_detail = w3.eth.get_transaction(tx_hash)
    gas_price = tx_detail['gasPrice']

    # 计算总花费（单位是wei）
    total_cost_wei = gas_used * gas_price

    # 将单位从wei转换为ether
    total_cost_ether = w3.from_wei(total_cost_wei, 'ether')

    return total_cost_ether, tx_receipt


def set_address(address_to_set):
    # 构建交易
    transaction = contract.functions.setAddress(address_to_set).build_transaction({
        'from': account_address,
        'gas': 5000000,
        'gasPrice': w3.to_wei('20', 'gwei'),
        'nonce': w3.eth.get_transaction_count(account_address),
    })

    # 使用私钥签署交易
    signed_tx = Account.sign_transaction(transaction, private_key)

    # 发送已签署的交易
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)

    # 等待交易被矿工打包并添加到区块链中
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    print("Transaction receipt: {}".format(tx_receipt))


if __name__ == "__main__":
    function_name = sys.argv[1]

    if function_name == "deploy_contract":
        print(deploy_contract())

    if function_name == "send_set_proof_transaction":
        pk = sys.argv[2]
        index = int(sys.argv[3])
        beta = int(sys.argv[4])
        root = sys.argv[5]
        pricePerGBPerMonth = int(sys.argv[6])
        print("pk: {}, index: {}, beta: {}, root: {}, pricePerGBPerMonth: {}".format(pk, index, beta, root,
                                                                                     pricePerGBPerMonth))
        print(send_set_proof_transaction(pk, index, beta, root, pricePerGBPerMonth))

    elif function_name == "send_verify_space_transaction":
        challenges = ast.literal_eval(sys.argv[2])
        hashes = ast.literal_eval(sys.argv[3])
        parents = ast.literal_eval(sys.argv[4])
        proofs = ast.literal_eval(sys.argv[5])
        pProofs = ast.literal_eval(sys.argv[6])
        print("challenges: {}, hashes: {}, parents: {}, proofs: {}, pProofs: {}".format(challenges, hashes, parents,
                                                                                        proofs, pProofs))
        cost, receipt = send_verify_space_transaction(challenges, hashes, parents, proofs, pProofs)
        print(f"Total Cost in Ether: {cost}\nTransaction Receipt: {receipt}")

    elif function_name == "set_address":
        address_to_set = "" + sys.argv[2]
        print(f"Setting Address: {address_to_set}")
        set_address(address_to_set)

    else:
        print(f"Function name '{function_name}' is not recognized!")

