// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PublicShareSimple {
    // 定义一个映射，将字符串映射到字符串
    mapping(string => string) public data;
    event BatchSet(string[] _keys, string[] _values);

    //批量设置映射关系
    function setBatch(string[] memory _keys, string[] memory _values) public {
        // 确保 _keys 和 _values 数组长度相同
        require(_keys.length == _values.length, "Keys and values arrays must have the same length");

        for (uint256 i = 0; i < _keys.length; i++) {
            data[_keys[i]] = _values[i];
        }
        
        emit BatchSet(_keys, _values);
    }

    // 获取指定键对应的值
    function get(string memory _key) public view returns (string memory) {
        return data[_key];
    }

    //通过key获取value，如果不存在返回空字符串
    function tryGet(string memory _key) public view returns (string memory) {
       if(bytes(data[_key]).length > 0) {
           return data[_key];
       }else {
           return "";
       }
    }
}
