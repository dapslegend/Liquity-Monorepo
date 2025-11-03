// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

contract CTFMonitor {
    address public owner;
    bytes32 public flagHash; // keccak256(flag string)
    string private flagClear; // emitted on success

    address[] public targets;
    mapping(address => uint256) public initialEth;

    // Constraints
    uint256 public minLossWei; // minimum total ETH loss across targets
    uint256 public minGainWei; // minimum participant gain in ETH
    bool public drainAll;      // require every target balance to be fully drained (<= 1 wei)

    // Participant
    address public participant;
    uint256 public participantInitialEth;

    bool public revealed;

    event FlagArmed(uint256 minLossWei, uint256 minGainWei, bool drainAll, uint256 numTargets);
    event Enrolled(address indexed participant, uint256 initialEth);
    event CTF_FLAG(address indexed participant, string flag, uint256 totalLossWei, uint256 participantGainWei);

    modifier onlyOwner() { require(msg.sender == owner, "OWN"); _; }

    constructor(address[] memory _targets, uint256 _minLossWei, uint256 _minGainWei, bool _drainAll, string memory _flag) {
        owner = msg.sender;
        targets = _targets;
        minLossWei = _minLossWei;
        minGainWei = _minGainWei;
        drainAll = _drainAll;
        flagClear = _flag;
        flagHash = keccak256(bytes(_flag));

        for (uint256 i = 0; i < _targets.length; i++) {
            initialEth[_targets[i]] = _targets[i].balance;
        }
        emit FlagArmed(minLossWei, minGainWei, drainAll, _targets.length);
    }

    function targetCount() external view returns (uint256) { return targets.length; }

    function currentLossWei() public view returns (uint256 loss, uint256[] memory perTargetLoss, bool allDrained) {
        perTargetLoss = new uint256[](targets.length);
        allDrained = true;
        for (uint256 i = 0; i < targets.length; i++) {
            address t = targets[i];
            uint256 init = initialEth[t];
            uint256 nowBal = t.balance;
            if (nowBal < init) {
                uint256 d = init - nowBal;
                perTargetLoss[i] = d;
                loss += d;
            }
            if (nowBal > 1) { // allow 1 wei dust tolerance
                allDrained = false;
            }
        }
    }

    // Participant self-enrollment to snapshot their starting balance
    function enroll() external {
        require(participant == address(0), "ENROLLED");
        participant = msg.sender;
        participantInitialEth = msg.sender.balance;
        emit Enrolled(msg.sender, participantInitialEth);
    }

    function checkAndReveal() external {
        require(!revealed, "REVEALED");
        require(participant != address(0), "NO_PARTICIPANT");
        (uint256 loss, , bool allDrained) = currentLossWei();
        if (drainAll) {
            require(allDrained, "NOT_FULLY_DRAINED");
        } else {
            require(loss >= minLossWei, "INSUFFICIENT_LOSS");
        }
        uint256 pNow = participant.balance;
        require(pNow >= participantInitialEth, "PARTICIPANT_NOT_GAINED");
        uint256 gain = pNow - participantInitialEth;
        require(gain >= minGainWei, "INSUFFICIENT_GAIN");
        revealed = true;
        emit CTF_FLAG(participant, flagClear, loss, gain);
    }

    function setMinLoss(uint256 _minLossWei) external onlyOwner { minLossWei = _minLossWei; }
    function setMinGain(uint256 _minGainWei) external onlyOwner { minGainWei = _minGainWei; }
    function setDrainAll(bool _drainAll) external onlyOwner { drainAll = _drainAll; }
}
