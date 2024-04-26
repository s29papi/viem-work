import { utils } from "ethers";
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
const { defaultAbiCoder: abiCoder } = utils;

import { createPublicClient, createWalletClient, http } from 'viem';

import { base } from 'viem/chains';


const rpcUrl = 'https://mainnet.base.org';

export default class Referee {
    account: PrivateKeyAccount;
    walletClient: any;

    constructor(privateKey: string) {
        let account = privateKeyToAccount(`0x${privateKey}`);
        let walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(rpcUrl),
        });
        this.account = account;
        this.walletClient = walletClient;
    }

    pack = (chainId: number, types: string[], args: any[]): string => {
        return utils.keccak256(
          abiCoder.encode(
            ["uint256", "bytes32"],
            [chainId, utils.keccak256(abiCoder.encode(types, args))]
          )
        );
      };
    



    sign = async (chainId: number, types: string[], args: any[]): Promise<string | null> => {
        try {
            let msg = this.pack(chainId, types, args)
            const sig = await this.walletClient.signMessage({message: msg})
            return sig;
        } catch (err: any) {
          console.warn(err.message);
          return null;
        }
      };
}