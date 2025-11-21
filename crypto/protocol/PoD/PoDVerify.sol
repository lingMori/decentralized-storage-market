// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Verify {
    // Mapping from identifier to hash of hash and address
    struct Data {
        bytes32 hashOfHash;
        address addr;
    }
    mapping(string => Data) public dataMap;

    // Function to set hash of hash and address for an identifier
    function setData(string memory identifier, bytes32 hashOfHash, address addr) public {
        dataMap[identifier] = Data(hashOfHash, addr);
    }

    // Function to verify signature
    function verifySignature(string memory identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
        // Recover the address from the signature
        bytes32 message = prefixed(hash);
        address recoveredAddr = ecrecover(message, v, r, s);

        // Get the data from the mapping
        Data memory data = dataMap[identifier];

        // Check if the recovered address matches the stored address
        bool addrMatch = (recoveredAddr == data.addr);

        // Check if the hash of hash matches the stored hash of hash
        bool hashMatch = (keccak256(abi.encodePacked(hash)) == data.hashOfHash);

        // Return true if both match, false otherwise
        return addrMatch && hashMatch;
    }

    // Function to verify signature
    function getAddr(string memory identifier, bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(address) {
        // Recover the address from the signature
        bytes32 message = prefixed(hash);
        address recoveredAddr = ecrecover(message, v, r, s);

        return recoveredAddr;
    }


    // Function to prefix the hash (required for ecrecover)
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
//        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        return hash;
    }
}
