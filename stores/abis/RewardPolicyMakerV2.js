export const REWARD_POLICY_MAKER_V2_ABI = [
  {
    name: 'SetAdmin',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    stateMutability: 'nonpayable',
    type: 'constructor',
    inputs: [
      {
        name: '_epoch_length',
        type: 'uint256',
      },
      {
        name: '_admin',
        type: 'address',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'epoch_at',
    inputs: [
      {
        name: '_timestamp',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 7475,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'epoch_start_time',
    inputs: [
      {
        name: '_epoch',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 4918,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'rate_at',
    inputs: [
      {
        name: '_timestamp',
        type: 'uint256',
      },
      {
        name: '_token',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 14285,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'current_epoch',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 14997,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_epoch_time',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 36854,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_epoch_rate',
    inputs: [
      {
        name: '_token',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 19774,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_admin',
    inputs: [
      {
        name: '_admin',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 39075,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_rewards_at',
    inputs: [
      {
        name: '_epoch',
        type: 'uint256',
      },
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_reward',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 52631,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_rewards_starting_at',
    inputs: [
      {
        name: '_epoch',
        type: 'uint256',
      },
      {
        name: '_token',
        type: 'address',
      },
      {
        name: '_rewards',
        type: 'uint256[10]',
      },
    ],
    outputs: [],
    gas: 372222,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'admin',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 2658,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'first_epoch_time',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2688,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'epoch_length',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2718,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'rewards',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
      {
        name: 'arg1',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3008,
  },
];
