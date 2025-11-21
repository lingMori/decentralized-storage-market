// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package PoD

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// PoDMetaData contains all meta data concerning the PoD contract.
var PoDMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"name\":\"dataMap\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"hashOfHash\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"addr\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"identifier\",\"type\":\"string\"},{\"internalType\":\"bytes32\",\"name\":\"hash\",\"type\":\"bytes32\"},{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"getAddr\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"identifier\",\"type\":\"string\"},{\"internalType\":\"bytes32\",\"name\":\"hashOfHash\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"addr\",\"type\":\"address\"}],\"name\":\"setData\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"string\",\"name\":\"identifier\",\"type\":\"string\"},{\"internalType\":\"bytes32\",\"name\":\"hash\",\"type\":\"bytes32\"},{\"internalType\":\"uint8\",\"name\":\"v\",\"type\":\"uint8\"},{\"internalType\":\"bytes32\",\"name\":\"r\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"verifySignature\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
	Bin: "0x608060405234801561001057600080fd5b506104ff806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806361576f0d146100515780636160dd7a1461007957806372f627291461008e578063cd2310c5146100e6575b600080fd5b61006461005f366004610385565b610111565b60405190151581526020015b60405180910390f35b61008c6100873660046103f6565b610203565b005b6100c961009c36600461045d565b8051602081830181018051600082529282019190930120915280546001909101546001600160a01b031682565b604080519283526001600160a01b03909116602083015201610070565b6100f96100f4366004610385565b61026f565b6040516001600160a01b039091168152602001610070565b600080856040805160008082526020820180845284905260ff89169282019290925260608101879052608081018690529192509060019060a0016020604051602081039080840390855afa15801561016d573d6000803e3d6000fd5b5050506020604051035190506000808960405161018a919061049a565b9081526040805160209281900383018120818301835280548083526001909101546001600160a01b0390811685840181905284519586018e905292955086169091149260009201604051602081830303815290604052805190602001201490508180156101f45750805b9b9a5050505050505050505050565b6040518060400160405280838152602001826001600160a01b0316815250600084604051610231919061049a565b9081526040516020918190038201902082518155910151600190910180546001600160a01b0319166001600160a01b03909216919091179055505050565b600080856040805160008082526020820180845284905260ff89169282019290925260608101879052608081018690529192509060019060a0016020604051602081039080840390855afa1580156102cb573d6000803e3d6000fd5b5050604051601f1901519998505050505050505050565b634e487b7160e01b600052604160045260246000fd5b600082601f83011261030957600080fd5b813567ffffffffffffffff80821115610324576103246102e2565b604051601f8301601f19908116603f0116810190828211818310171561034c5761034c6102e2565b8160405283815286602085880101111561036557600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600080600060a0868803121561039d57600080fd5b853567ffffffffffffffff8111156103b457600080fd5b6103c0888289016102f8565b95505060208601359350604086013560ff811681146103de57600080fd5b94979396509394606081013594506080013592915050565b60008060006060848603121561040b57600080fd5b833567ffffffffffffffff81111561042257600080fd5b61042e868287016102f8565b9350506020840135915060408401356001600160a01b038116811461045257600080fd5b809150509250925092565b60006020828403121561046f57600080fd5b813567ffffffffffffffff81111561048657600080fd5b610492848285016102f8565b949350505050565b6000825160005b818110156104bb57602081860181015185830152016104a1565b50600092019182525091905056fea2646970667358221220f6ffc0fe12c0eca8a01d8c5c896172a8a019c91d0390cce908438e61dad2525a64736f6c63430008110033",
}

// PoDABI is the input ABI used to generate the binding from.
// Deprecated: Use PoDMetaData.ABI instead.
var PoDABI = PoDMetaData.ABI

// PoDBin is the compiled bytecode used for deploying new contracts.
// Deprecated: Use PoDMetaData.Bin instead.
var PoDBin = PoDMetaData.Bin

// DeployPoD deploys a new Ethereum contract, binding an instance of PoD to it.
func DeployPoD(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *PoD, error) {
	parsed, err := PoDMetaData.GetAbi()
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	if parsed == nil {
		return common.Address{}, nil, nil, errors.New("GetABI returned nil")
	}

	address, tx, contract, err := bind.DeployContract(auth, *parsed, common.FromHex(PoDBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &PoD{PoDCaller: PoDCaller{contract: contract}, PoDTransactor: PoDTransactor{contract: contract}, PoDFilterer: PoDFilterer{contract: contract}}, nil
}

// PoD is an auto generated Go binding around an Ethereum contract.
type PoD struct {
	PoDCaller     // Read-only binding to the contract
	PoDTransactor // Write-only binding to the contract
	PoDFilterer   // Log filterer for contract events
}

// PoDCaller is an auto generated read-only Go binding around an Ethereum contract.
type PoDCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// PoDTransactor is an auto generated write-only Go binding around an Ethereum contract.
type PoDTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// PoDFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type PoDFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// PoDSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type PoDSession struct {
	Contract     *PoD              // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// PoDCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type PoDCallerSession struct {
	Contract *PoDCaller    // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// PoDTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type PoDTransactorSession struct {
	Contract     *PoDTransactor    // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// PoDRaw is an auto generated low-level Go binding around an Ethereum contract.
type PoDRaw struct {
	Contract *PoD // Generic contract binding to access the raw methods on
}

// PoDCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type PoDCallerRaw struct {
	Contract *PoDCaller // Generic read-only contract binding to access the raw methods on
}

// PoDTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type PoDTransactorRaw struct {
	Contract *PoDTransactor // Generic write-only contract binding to access the raw methods on
}

// NewPoD creates a new instance of PoD, bound to a specific deployed contract.
func NewPoD(address common.Address, backend bind.ContractBackend) (*PoD, error) {
	contract, err := bindPoD(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &PoD{PoDCaller: PoDCaller{contract: contract}, PoDTransactor: PoDTransactor{contract: contract}, PoDFilterer: PoDFilterer{contract: contract}}, nil
}

// NewPoDCaller creates a new read-only instance of PoD, bound to a specific deployed contract.
func NewPoDCaller(address common.Address, caller bind.ContractCaller) (*PoDCaller, error) {
	contract, err := bindPoD(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &PoDCaller{contract: contract}, nil
}

// NewPoDTransactor creates a new write-only instance of PoD, bound to a specific deployed contract.
func NewPoDTransactor(address common.Address, transactor bind.ContractTransactor) (*PoDTransactor, error) {
	contract, err := bindPoD(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &PoDTransactor{contract: contract}, nil
}

// NewPoDFilterer creates a new log filterer instance of PoD, bound to a specific deployed contract.
func NewPoDFilterer(address common.Address, filterer bind.ContractFilterer) (*PoDFilterer, error) {
	contract, err := bindPoD(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &PoDFilterer{contract: contract}, nil
}

// bindPoD binds a generic wrapper to an already deployed contract.
func bindPoD(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(PoDABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_PoD *PoDRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _PoD.Contract.PoDCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_PoD *PoDRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _PoD.Contract.PoDTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_PoD *PoDRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _PoD.Contract.PoDTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_PoD *PoDCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _PoD.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_PoD *PoDTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _PoD.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_PoD *PoDTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _PoD.Contract.contract.Transact(opts, method, params...)
}

// DataMap is a free data retrieval call binding the contract method 0x72f62729.
//
// Solidity: function dataMap(string ) view returns(bytes32 hashOfHash, address addr)
func (_PoD *PoDCaller) DataMap(opts *bind.CallOpts, arg0 string) (struct {
	HashOfHash [32]byte
	Addr       common.Address
}, error) {
	var out []interface{}
	err := _PoD.contract.Call(opts, &out, "dataMap", arg0)

	outstruct := new(struct {
		HashOfHash [32]byte
		Addr       common.Address
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.HashOfHash = *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)
	outstruct.Addr = *abi.ConvertType(out[1], new(common.Address)).(*common.Address)

	return *outstruct, err

}

// DataMap is a free data retrieval call binding the contract method 0x72f62729.
//
// Solidity: function dataMap(string ) view returns(bytes32 hashOfHash, address addr)
func (_PoD *PoDSession) DataMap(arg0 string) (struct {
	HashOfHash [32]byte
	Addr       common.Address
}, error) {
	return _PoD.Contract.DataMap(&_PoD.CallOpts, arg0)
}

// DataMap is a free data retrieval call binding the contract method 0x72f62729.
//
// Solidity: function dataMap(string ) view returns(bytes32 hashOfHash, address addr)
func (_PoD *PoDCallerSession) DataMap(arg0 string) (struct {
	HashOfHash [32]byte
	Addr       common.Address
}, error) {
	return _PoD.Contract.DataMap(&_PoD.CallOpts, arg0)
}

// GetAddr is a free data retrieval call binding the contract method 0xcd2310c5.
//
// Solidity: function getAddr(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(address)
func (_PoD *PoDCaller) GetAddr(opts *bind.CallOpts, identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (common.Address, error) {
	var out []interface{}
	err := _PoD.contract.Call(opts, &out, "getAddr", identifier, hash, v, r, s)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetAddr is a free data retrieval call binding the contract method 0xcd2310c5.
//
// Solidity: function getAddr(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(address)
func (_PoD *PoDSession) GetAddr(identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (common.Address, error) {
	return _PoD.Contract.GetAddr(&_PoD.CallOpts, identifier, hash, v, r, s)
}

// GetAddr is a free data retrieval call binding the contract method 0xcd2310c5.
//
// Solidity: function getAddr(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(address)
func (_PoD *PoDCallerSession) GetAddr(identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (common.Address, error) {
	return _PoD.Contract.GetAddr(&_PoD.CallOpts, identifier, hash, v, r, s)
}

// VerifySignature is a free data retrieval call binding the contract method 0x61576f0d.
//
// Solidity: function verifySignature(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(bool)
func (_PoD *PoDCaller) VerifySignature(opts *bind.CallOpts, identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (bool, error) {
	var out []interface{}
	err := _PoD.contract.Call(opts, &out, "verifySignature", identifier, hash, v, r, s)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// VerifySignature is a free data retrieval call binding the contract method 0x61576f0d.
//
// Solidity: function verifySignature(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(bool)
func (_PoD *PoDSession) VerifySignature(identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (bool, error) {
	return _PoD.Contract.VerifySignature(&_PoD.CallOpts, identifier, hash, v, r, s)
}

// VerifySignature is a free data retrieval call binding the contract method 0x61576f0d.
//
// Solidity: function verifySignature(string identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) view returns(bool)
func (_PoD *PoDCallerSession) VerifySignature(identifier string, hash [32]byte, v uint8, r [32]byte, s [32]byte) (bool, error) {
	return _PoD.Contract.VerifySignature(&_PoD.CallOpts, identifier, hash, v, r, s)
}

// SetData is a paid mutator transaction binding the contract method 0x6160dd7a.
//
// Solidity: function setData(string identifier, bytes32 hashOfHash, address addr) returns()
func (_PoD *PoDTransactor) SetData(opts *bind.TransactOpts, identifier string, hashOfHash [32]byte, addr common.Address) (*types.Transaction, error) {
	return _PoD.contract.Transact(opts, "setData", identifier, hashOfHash, addr)
}

// SetData is a paid mutator transaction binding the contract method 0x6160dd7a.
//
// Solidity: function setData(string identifier, bytes32 hashOfHash, address addr) returns()
func (_PoD *PoDSession) SetData(identifier string, hashOfHash [32]byte, addr common.Address) (*types.Transaction, error) {
	return _PoD.Contract.SetData(&_PoD.TransactOpts, identifier, hashOfHash, addr)
}

// SetData is a paid mutator transaction binding the contract method 0x6160dd7a.
//
// Solidity: function setData(string identifier, bytes32 hashOfHash, address addr) returns()
func (_PoD *PoDTransactorSession) SetData(identifier string, hashOfHash [32]byte, addr common.Address) (*types.Transaction, error) {
	return _PoD.Contract.SetData(&_PoD.TransactOpts, identifier, hashOfHash, addr)
}
