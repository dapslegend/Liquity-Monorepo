// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

contract CTFMonitor {
    address public owner;
    bytes32 public flagHash; // keccak256(flag string) for on-chain small storage
    string private flagClear; // retrievable via event only, but stored for validation

    address[] public targets;
    mapping(address => uint256) public initialEth;

    uint256 public minLossWei;
    bool public revealed;

    event FlagArmed(uint256 minLossWei, uint256 numTargets);
    event CTF_FLAG(address indexed claimant, string flag, uint256 totalLossWei);

    modifier onlyOwner() { require(msg.sender == owner, "OWN"); _; }

    constructor(address[] memory _targets, uint256 _minLossWei, string memory _flag) {
        owner = msg.sender;
        targets = _targets;
        minLossWei = _minLossWei;
        flagClear = _flag;
        flagHash = keccak256(bytes(_flag));

        for (uint256 i = 0; i < _targets.length; i++) {
            initialEth[_targets[i]] = _targets[i].balance;
        }
        emit FlagArmed(minLossWei, _targets.length);
    }

    function targetCount() external view returns (uint256) { return targets.length; }

    function currentLossWei() public view returns (uint256 loss, uint256[] memory perTargetLoss) {
        perTargetLoss = new uint256[](targets.length);
        for (uint256 i = 0; i < targets.length; i++) {
            address t = targets[i];
            uint256 init = initialEth[t];
            uint256 nowBal = t.balance;
            if (nowBal < init) {
                uint256 d = init - nowBal;
                perTargetLoss[i] = d;
                loss += d;
            }
        }
    }

    // Anyone can trigger reveal if sufficient loss observed; claimant recorded in event
    function checkAndReveal(address claimant) external {
        require(!revealed, "REVEALED");
        (uint256 loss, ) = currentLossWei();
        require(loss >= minLossWei, "INSUFFICIENT_LOSS");
        revealed = true;
        emit CTF_FLAG(claimant, flagClear, loss);
    }

    // Owner can update the minimum loss threshold if needed
    function setMinLoss(uint256 _minLossWei) external onlyOwner { minLossWei = _minLossWei; }
}
