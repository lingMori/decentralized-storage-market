// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataContract {
    // 事件用于记录数据的添加和查询
    event DataAdded(bytes32 indexed cid, address indexed user);
    event DataQueried(bytes32 indexed cid, address indexed user);

    // 存储数据的映射
    mapping(bytes32 => mapping(address => bool)) data;

    // 添加数据的函数
    function addData(bytes32 cid, address user) external {
        data[cid][user] = true;
        emit DataAdded(cid, user);
    }

    // 查询数据的函数
    function queryData(bytes32 cid, address user) external {
        bool exists = data[cid][user];
        emit DataQueried(cid, user);
    }
}
