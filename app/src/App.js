import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import deploy from './deploy';
import Escrow from './Escrow';
import getContract from './getContract';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    async function getEscrows() {
      const response = await fetch(`${process.env.REACT_APP_REST_API_URL}/escrows`);
      let escrows = await response.json();
      escrows = await Promise.all(escrows.map(async escrow => {
        const escrowContract = await getContract(escrow.address);
        return {
          ...escrow,
          handleApprove: async () => {
            escrowContract.on('Approved', () => {
              document.getElementById(escrowContract.address).className =
                'complete';
              document.getElementById(escrowContract.address).innerText =
                "✓ It's been approved!";
            });
    
            await approve(escrowContract, signer);
          }
        };
      }));
      setEscrows(escrows);
    }

    getEscrows();
  }, [signer]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value;
    const arbiter = document.getElementById('arbiter').value;
    const weiValue = ethers.utils.parseEther(document.getElementById('ether').value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, weiValue);

    let escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: weiValue.toString(),

    };

    await fetch(`${process.env.REACT_APP_REST_API_URL}/escrows`, {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(escrow),
    });

    escrow = {
      ...escrow, handleApprove: async () => {
        escrowContract.on('Approved', () => {
          document.getElementById(escrowContract.address).className =
            'complete';
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Ether)
          <input type="text" id="ether" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} signer={signer} {...escrow} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
