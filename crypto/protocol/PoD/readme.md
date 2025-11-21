编译智能合约
````bash
solc --bin --abi --optimize -o ./build PoDVerify.sol
````

部署智能合约
````bash
python PoS_deploy.py
````

打通智能合约
````bash
abigen --abi=./build/Verify.abi --bin=./build/Verify.bin --pkg=PoD --out=./PoD-sol.go
````
