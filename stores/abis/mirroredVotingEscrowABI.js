export const mirroredVotingEscrowABI = [
  {
    name: 'MirrorLock',
    inputs: [
      {
        name: 'provider',
        type: 'address',
        indexed: true,
      },
      {
        name: 'chain_id',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'escrow_id',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'locktime',
        type: 'uint256',
        indexed: true,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'CommitOwnership',
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
    name: 'ApplyOwnership',
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
    name: 'SetMirrorWhitelist',
    inputs: [
      {
        name: 'addr',
        type: 'address',
        indexed: false,
      },
      {
        name: 'is_whitelisted',
        type: 'bool',
        indexed: false,
      },
    ],
    anonymous: false,
    type: 'event',
  },
  {
    name: 'AddVotingEscrow',
    inputs: [
      {
        name: 'addr',
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
        name: '_admin',
        type: 'address',
      },
      {
        name: '_voting_escrow',
        type: 'address',
      },
      {
        name: '_name',
        type: 'string',
      },
      {
        name: '_symbol',
        type: 'string',
      },
      {
        name: '_version',
        type: 'string',
      },
    ],
    outputs: [],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'mirror_lock',
    inputs: [
      {
        name: '_user',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
      {
        name: '_escrow_id',
        type: 'uint256',
      },
      {
        name: '_value',
        type: 'uint256',
      },
      {
        name: '_unlock_time',
        type: 'uint256',
      },
    ],
    outputs: [],
    gas: 41811079,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'checkpoint',
    inputs: [],
    outputs: [],
    gas: 37425044,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_epoch',
    inputs: [
      {
        name: '_user',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_epoch',
    inputs: [
      {
        name: '_user',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_epoch',
    inputs: [
      {
        name: '_user',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
      {
        name: '_escrow_id',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_history__ts',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_idx',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_history__ts',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_idx',
        type: 'uint256',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_point_history__ts',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_idx',
        type: 'uint256',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
      {
        name: '_escrow_id',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'user_last_checkpoint_ts',
    inputs: [
      {
        name: '_user',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 261346662,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'total_mirrored_supply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'total_mirrored_supply',
    inputs: [
      {
        name: 't',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'totalSupply',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'totalSupply',
    inputs: [
      {
        name: '_t',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'balanceOf',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'balanceOf',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_t',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_balance_of',
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
      {
        name: '_t',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 628686267,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'locked__end',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'locked__end',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'locked__end',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
      {
        name: '_escrow_id',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'nearest_locked__end',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 138077599,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_last_user_slope',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'int128',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_last_user_slope',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'int128',
      },
    ],
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'get_last_user_slope',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_chain',
        type: 'uint256',
      },
      {
        name: '_escrow_id',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'int128',
      },
    ],
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'commit_transfer_ownership',
    inputs: [
      {
        name: 'addr',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 39255,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'apply_transfer_ownership',
    inputs: [],
    outputs: [],
    gas: 41394,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'set_mirror_whitelist',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
      {
        name: '_is_whitelisted',
        type: 'bool',
      },
    ],
    outputs: [],
    gas: 40121,
  },
  {
    stateMutability: 'nonpayable',
    type: 'function',
    name: 'add_voting_escrow',
    inputs: [
      {
        name: '_addr',
        type: 'address',
      },
    ],
    outputs: [],
    gas: 78781,
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
    gas: 2868,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'future_admin',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 2898,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'whitelisted_mirrors',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    gas: 3143,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'voting_escrow_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 2958,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'voting_escrows',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
      },
    ],
    gas: 3033,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_chains_count',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3018,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_chains',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'chain_id',
        type: 'uint256',
      },
      {
        name: 'escrow_count',
        type: 'uint256',
      },
    ],
    gas: 5483,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_locks',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
      {
        name: 'arg1',
        type: 'uint256',
      },
      {
        name: 'arg2',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'int128',
      },
      {
        name: 'end',
        type: 'uint256',
      },
    ],
    gas: 5913,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_user_point_history',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
      {
        name: 'arg1',
        type: 'uint256',
      },
      {
        name: 'arg2',
        type: 'uint256',
      },
      {
        name: 'arg3',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'bias',
        type: 'int128',
      },
      {
        name: 'slope',
        type: 'int128',
      },
      {
        name: 'ts',
        type: 'uint256',
      },
      {
        name: 'blk',
        type: 'uint256',
      },
    ],
    gas: 10408,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_user_point_epoch',
    inputs: [
      {
        name: 'arg0',
        type: 'address',
      },
      {
        name: 'arg1',
        type: 'uint256',
      },
      {
        name: 'arg2',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3583,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_epoch',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3168,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_point_history',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'bias',
        type: 'int128',
      },
      {
        name: 'slope',
        type: 'int128',
      },
      {
        name: 'ts',
        type: 'uint256',
      },
      {
        name: 'blk',
        type: 'uint256',
      },
    ],
    gas: 10053,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'mirrored_slope_changes',
    inputs: [
      {
        name: 'arg0',
        type: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'int128',
      },
    ],
    gas: 3343,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'name',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    gas: 13488,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'symbol',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    gas: 11241,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'version',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    gas: 11271,
  },
  {
    stateMutability: 'view',
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    gas: 3348,
  },
];
