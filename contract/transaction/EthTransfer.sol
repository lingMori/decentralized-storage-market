// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SafeETH
 * @dev Wrappers around ETH operations that throw on failure (when the transfer
 * call fails).
 */
library SafeETH {
    /**
     * @dev Transfer `amount` ETH to `to` address. Reverts on failure.
     */
    function safeTransfer(address payable to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "SafeETH: ETH transfer failed");
    }

    /**
     * @dev Transfer `amounts` ETH to `recipients` addresses. Reverts if any transfer fails.
     */
    function safeBatchTransfer(address payable[] memory recipients, uint256[] memory amounts) internal {
        require(recipients.length == amounts.length, "SafeETH: recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            safeTransfer(recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Transfer all ETH from the contract to `to` address. Reverts on failure.
     */
    function safeTransferAll(address payable to) internal {
        uint256 amount = address(this).balance;
        safeTransfer(to, amount);
    }
}
