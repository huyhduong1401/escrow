import { ethers } from "ethers";
import { useEffect, useState } from "react";
import getContract from "./getContract";

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  handleApprove,
  signer
}) {
  const ethValue = ethers.utils.formatEther(ethers.BigNumber.from(value));

  const [isApproved, setIsApproved] = useState(false);

  useEffect(() => {
    async function getIsApproved() {
      const escrowContract = await getContract(address);
      const isApproved = await escrowContract.connect(signer).isApproved();
      console.log(isApproved)
      setIsApproved(isApproved);
    }
    getIsApproved();
  }, [address, signer])

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {ethValue} ETH </div>
        </li>
        {!isApproved ? <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        > Approve </div> :
          <div className="complete"
            id={address}>
            "✓ It's been approved!";
          </div>
        }

      </ul>
    </div>
  );
}
