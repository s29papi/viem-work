import { createPublicClient, createWalletClient, http, parseUnits, toHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { ethers, BytesLike } from 'ethers';
import versusABI from './versus-abi';
import erc20ABI from './erc20-abi';
import Referee from './tools/Referee';

const account = privateKeyToAccount(`0x${process.env.PRIV_KEY}`);
const rpcUrl = 'https://mainnet.base.org';
const walletClient = createWalletClient({
  account,
  chain: base,
  transport: http(rpcUrl),
});

const publicClient = createPublicClient({
    chain: base,
    transport: http(rpcUrl),
});

const ref = new Referee(
    `${process.env.REF_PRIV_KEY}`
)

const contractAddress = '0xeF81ae6af0Fc3F7692815d8b7706edf19e66858F';




/**
 * gameId
 * 
 * amountStaked
 * 
 * token
 * 
 * fid
 * 
 * nonce
 * 
 * signature
 * 
*/


// Args 
const gameId = 0
const amountStaked = 1
const tokenAddr = '0xAC1Bd2486aAf3B5C0fc3Fd868558b082a531B2B4'
const fid = 0


// nonce 
const buffer = new ArrayBuffer(32);
const view = new DataView(buffer);
view.setInt32(0, gameId, true);
const nonce = new Uint8Array(buffer);

const types = [
    "uint", //game id
    "uint", //stake amount
    "address", //token address, if 0 address ETH, else token.
    "uint", //fid
    "bytes32" //nonce
  ]

const args = [
    gameId,                 
    amountStaked,           
    tokenAddr,           
    fid,                  
    nonce,
];

// const approveVersus = async () => {
//     const abi = erc20ABI
//     const hash = await walletClient.writeContract({
//         abi,
//         functionName: 'approve',
//         address: tokenAddr,
//         args: [contractAddress, parseUnits('2', 18)],
//       });

//     await publicClient.waitForTransactionReceipt({
//     hash,
//     });
    
//     console.log(`Tx successful with hash: ${hash}`);
// }

// approveVersus()



const versusStake = async () => { 
    const abi = versusABI;

    const sigBytes = await ref.sign(base.id, types, args) as BytesLike
    const sigHexString = sigBytes.toString().slice(2)
    const nonceHexString = toHex(nonce).slice(2)
   
    const hash = await walletClient.writeContract({
        abi,
        functionName: 'versusStake',
        address: contractAddress,
        args: [parseUnits(gameId.toString(), 0), parseUnits(amountStaked.toString(), 18) , tokenAddr, parseUnits(fid.toString(), 0), `0x${nonceHexString}`, `0x${sigHexString}`],
      });

      await publicClient.waitForTransactionReceipt({
        hash,
      });
    
      console.log(`Tx successful with hash: ${hash}`);
}


versusStake()