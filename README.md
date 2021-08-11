# Push Oracle
This project implements Tellor as a push oracle, per EIP-1154 Standards (now deprecated).

By: Christopher Pondoc

## Reference

This section serves primarily as a conceptual breakdown of what I've researched...

### From EIP:
* Beyond naming differences, there is also the issue of whether or not an oracle report-resolving transaction pushes state changes by calling affected contracts, or changes the oracle state allowing dependent contracts to pull the updated value from the oracle. These differing system semantics could introduce inefficiencies when adapting between them.
* Interface of something that a Tellor Consumer, or a smart contract that uses Tellor:
``` solidity
interface OracleConsumer {
    function receiveResult(bytes32 id, bytes result) external;
}
```
* Require statements within the specific `receiveResult` function
    - receiveResult MUST revert if the msg.sender is not an oracle authorized to provide the result for that id.
    - receiveResult MUST revert if receiveResult has been called with the same id before.
    - receiveResult MAY revert if the id or result cannot be handled by the consumer.

### Structure:
* We could start off with a smart contract, called “TellorPushOracle,” which inherits “UsingTellor”
* After inheriting that smart contract, what we can do is create a function called `pushNewData`, which takes an ID and also takes an address of a smart contract
    - With that smart contract, we make sure to create cast it to a TellorUser smart contract, which is an implementation of the ITellorUser interface
    - Once you have that, we called getCurrentValue to get the current value of the oracle for that id, and then call receiveResult on the contract
* Similarly, for the TellorPushUser and ITellorPushUser…
    - The interface should ideally implement `receiveResult`, at first
    - TellorPushUser makes sure to implement `receiveResult`, making sure to add the specified `require` statements
    - The user then saves that data in a mapping or other internal variable!
* Extra Things
    - Save Historical Data/Get Data Before
