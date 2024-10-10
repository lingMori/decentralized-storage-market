// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ETH线性释放
 * @dev 这个合约会将ETH线性释放给受益人`_beneficiary`。
 * 释放的ETH遵循由起始时间`_start`和时长`_duration`定义的周期。
 * 所有转到这个合约上的ETH都会遵循同样的线性释放周期，并且需要受益人调用`release()`函数提取。
 */
contract EthRelease {
    // 事件
    event ETHReleased(uint256 amount); // 提币事件
    event createReleaseTrans(address beneficiary, uint256 duration); // 创建释放交易事件

    // 状态变量
    uint256 public ethReleased; // 已释放的ETH数量
    address public immutable beneficiary; // 受益人地址
    uint256 public immutable start; // 归属期起始时间戳
    uint256 public immutable duration; // 归属期 (秒)

    // 释放交易结构体
    struct ReleaseTrans {
        address beneficiary; // 受益人地址
        uint256 duration; // 释放周期 (秒)
    }

    // 存储每个地址的释放交易
    mapping (address => ReleaseTrans) releaseTrans;

    /**
     * @dev 初始化受益人地址，释放周期(秒), 起始时间戳(当前区块链时间戳)
     * @param beneficiaryAddress 受益人地址
     * @param durationSeconds 释放周期 (秒)
     */
    constructor(
        address beneficiaryAddress,
        uint256 durationSeconds
    ) payable {
        require(beneficiaryAddress != address(0), "VestingWallet: beneficiary is zero address"); // 检查受益人地址是否为零地址
        beneficiary = beneficiaryAddress;
        start = block.timestamp; // 设置起始时间为当前区块链时间戳
        duration = durationSeconds;

        // 创建一个新的释放交易并存储
        ReleaseTrans storage newReleaseTrans = releaseTrans[msg.sender];
        newReleaseTrans.beneficiary = beneficiaryAddress;
        newReleaseTrans.duration = duration;
        emit createReleaseTrans(beneficiary, duration); // 触发创建释放交易事件
    }

    /**
     * @dev 受益人提取已释放的ETH。
     * 调用vestedAmount()函数计算可提取的ETH数量，然后transfer给受益人。
     * 释放 {ETHReleased} 事件.
     */
    function release() public {
        // 调用vestedAmount()函数计算可提取的ETH数量
        uint256 releasable = vestedAmount_liner(uint256(block.timestamp)) - ethReleased;
        // 更新已释放ETH数量
        ethReleased += releasable;
        // 转ETH给受益人
        emit ETHReleased(releasable);
        (bool success, ) = beneficiary.call{value: releasable}("");
        require(success, "Transfer failed"); // 确保转账成功
    }

    /**
     * @dev 根据线性释放公式，计算已经释放的数量。开发者可以通过修改这个函数，自定义释放方式。
     * @param timestamp 查询的时间戳
     */
    function vestedAmount_liner(uint256 timestamp) internal view returns (uint256) {
        // 合约里总共收到了多少ETH（当前余额 + 已经提取）
        uint256 totalAllocation = address(this).balance + ethReleased;
        // 根据线性释放公式，计算已经释放的数量
        if (timestamp < start) {
            return 0; // 如果当前时间小于起始时间，返回0
        } else if (timestamp > start + duration) {
            return totalAllocation; // 如果当前时间大于结束时间，返回总分配的ETH
        } else {
            return (totalAllocation * (timestamp - start)) / duration; // 线性释放计算
        }
    }
}
