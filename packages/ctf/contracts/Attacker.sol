// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

interface IActivePool {
    // minimal surface to interact in tests; extend as needed
    function getETH() external view returns (uint256);
}

contract Attacker {
    address public owner;

    constructor() { owner = msg.sender; }

    receive() external payable {}

    function sweep(address payable to) external {
        require(msg.sender == owner, "only owner");
        (bool ok, ) = to.call{value: address(this).balance}("");
        require(ok, "send fail");
    }

    // placeholder to demonstrate calls; extend for real interactions
    function ping(address target, bytes calldata data, uint256 value) external payable returns (bytes memory) {
        require(msg.sender == owner, "only owner");
        (bool ok, bytes memory res) = target.call{value: value}(data);
        require(ok, "call fail");
        return res;
    }
}
