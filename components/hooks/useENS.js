import { getDefaultProvider } from '@ethersproject/providers';
import { utils } from 'ethers';
import { useEffect, useState } from 'react';

const useENS = (address) => {
  const [ensName, setENSName] = useState(null);
  const [ensAvatar, setENSAvatar] = useState(null);

  useEffect(() => {
    const resolveENS = async () => {
      if (address && utils.isAddress(address)) {
        const provider = await getDefaultProvider();
        const ensName = await provider.lookupAddress(address);
        const resolver = await provider.getResolver(ensName ?? '');
        const ensAvatar = await resolver?.getAvatar();
        setENSAvatar(ensAvatar?.url);
        setENSName(ensName);
      }
    };
    resolveENS();
  }, [address]);

  return { ensName, ensAvatar };
};

export default useENS;
