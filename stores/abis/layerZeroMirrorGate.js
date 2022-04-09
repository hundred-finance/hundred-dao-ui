export const layerZeroMirrorGateAbi = [
  {
    inputs: [
      {
        internalType: 'contract ILayerZeroEndpoint',
        name: '_endpoint',
        type: 'address',
      },
      {
        internalType: 'contract IMirroredVotingEscrow',
        name: '_mirrorEscrow',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: '_enpoint',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: '_srcChainId',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'MirrorFailure',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: '_enpoint',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint16',
        name: '_srcChain',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_chain',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_escrow_id',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_unlock_time',
        type: 'uint256',
      },
    ],
    name: 'MirrorSuccess',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'endpoint',
    outputs: [
      {
        internalType: 'contract ILayerZeroEndpoint',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_srcLayerZeroChainId',
        type: 'uint16',
      },
      {
        internalType: 'bytes',
        name: '_srcAddress',
        type: 'bytes',
      },
      {
        internalType: 'uint64',
        name: '_nonce',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: '_payload',
        type: 'bytes',
      },
    ],
    name: 'lzReceive',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mirrorEscrow',
    outputs: [
      {
        internalType: 'contract IMirroredVotingEscrow',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'mirrorGates',
    outputs: [
      {
        internalType: 'bytes',
        name: '',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: '_toLayerZeroChainId',
        type: 'uint16',
      },
      {
        internalType: 'uint256',
        name: '_escrowId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_extraGas',
        type: 'uint256',
      },
    ],
    name: 'mirrorLock',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_b',
        type: 'bytes',
      },
    ],
    name: 'packedBytesToAddr',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract ILayerZeroEndpoint',
        name: '_endpoint',
        type: 'address',
      },
    ],
    name: 'setEndpoint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_toLayerZeroChainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_gate',
        type: 'bytes',
      },
    ],
    name: 'setMirrorGate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unPause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
