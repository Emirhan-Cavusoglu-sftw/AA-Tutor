-include .env

deploy:
	forge script script/Deployer.s.sol:Deployer --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --etherscan-api-key $(API_KEY) --verify

deployUni:
	forge script script/DeployUni.s.sol:DeployUni --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast --etherscan-api-key $(API_KEY) --verify --gas-price 1000000000 --priority-gas-price 1000000000
deployTkn:
	forge script script/DeployTkn.s.sol:DeployTkn --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast
deployAcc:
	forge create --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --etherscan-api-key $(API_KEY) --verify src/SmartAccount.sol:SmartAccount	
