// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract InstaShare is Ownable {

    constructor(address initialOwner) Ownable(initialOwner) {}
    
    struct InstanceOwner {
        address ownerAddress;
        uint256 freeLoad;
        bool isLocked;
    }

    mapping(address => InstanceOwner) public instanceOwners;

    event InstanceOwnerRegistered(address ownerAddress, uint256 freeLoad, bool isLocked);
    event FreeLoadUpdated(address ownerAddress, uint256 freeLoad);


    function registerInstanceOwner() public {
        // check has user registered in (001 means already)
        require(instanceOwners[msg.sender].ownerAddress != msg.sender, "error code == 001");
        
        InstanceOwner memory newOwner = InstanceOwner({
            ownerAddress:msg.sender,
            freeLoad: 128 * 1000 * 1000,
            isLocked: false
        });

        instanceOwners[msg.sender] = newOwner;
        emit InstanceOwnerRegistered(newOwner.ownerAddress, newOwner.freeLoad, newOwner.isLocked);
    }

    function uploadFiles(uint256 fileSize) public {
    // Check if the sender is a registered instance owner
    require(instanceOwners[msg.sender].ownerAddress == msg.sender, "error code == 002");

    // Check if the instance owner is not locked
    require(!instanceOwners[msg.sender].isLocked, "error code == 003");

    // Check if the instance owner has enough free load
    require(instanceOwners[msg.sender].freeLoad >= fileSize, "error code == 004");

    // Deduct the file size from the free load
    instanceOwners[msg.sender].freeLoad -= fileSize;

    // Emit an event for the updated free load
    emit FreeLoadUpdated(msg.sender, instanceOwners[msg.sender].freeLoad);
}

    // update funcs
    function updateFreeLoad(uint256 newFreeload, address ownerAddress) public onlyOwner {
        require(instanceOwners[ownerAddress].ownerAddress == ownerAddress);
        instanceOwners[ownerAddress].freeLoad = newFreeload;
        emit FreeLoadUpdated(ownerAddress, newFreeload);
    }

}
