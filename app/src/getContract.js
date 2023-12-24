import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

export default async function getContract(address) {
    const contract = new ethers.Contract(address, Escrow.abi)
    return contract
}