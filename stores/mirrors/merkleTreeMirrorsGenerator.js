import keccak256 from 'keccak256';
import MerkleTree from 'merkletreejs';
import { getAddress, solidityKeccak256 } from 'ethers/lib/utils';

export default class MerkleTreeMirrorsGenerator {
  recipients = [];
  tree = new MerkleTree([]);

  constructor(mirrors) {
    for (const mirror of mirrors) {
      this.recipients.push({
        address: getAddress(mirror[0]),
        values: mirror.slice(1),
      });
    }
  }

  generateLeaf(address, values) {
    return Buffer.from(
      solidityKeccak256(['address', 'uint256', 'uint256', 'uint256', 'uint256'], [address, values[0], values[1], values[2], values[3]]).slice(2),
      'hex',
    );
  }

  process() {
    this.tree = new MerkleTree(
      this.recipients.map(({ address, values }) => this.generateLeaf(address, values)),
      keccak256,
      { sortPairs: true },
    );

    return this.tree.getHexRoot();
  }

  generateProof(address, values) {
    return this.tree.getHexProof(this.generateLeaf(address, values));
  }
}
