import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const withdrawButton = document.getElementById("withdrawButton");
const balanceButton = document.getElementById("balanceButton");
const ethAmountInput = document.getElementById("ethAmountInput");
// console.log(ethers);

const connect = async () => {
  if (typeof window.ethereum !== "undefined") {
    console.log("I see metamask");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected.");
    document.getElementById("connectButton").innerHTML = "Connected";

    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    console.log(accounts);
  } else {
    console.log("I can't see metamask");
    document.getElementById("connectButton").innerHTML =
      "Please install metamask";
  }
};

const setButtonText = async () => {
  console.log("onload");
  if (typeof window.ethereum !== "undefined") {
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    if (accounts.length > 0) {
      document.getElementById("connectButton").innerHTML = "Connected";
    }
  }
};

const fund = async () => {
  const ethAmount = ethAmountInput.value;
  const weiAmount = ethers.utils.parseEther(ethAmount);

  console.log(`Funding with ${ethAmount} in ${weiAmount} wei`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      await listenForTxMined(
        await contract.fund({ value: weiAmount }),
        provider
      );
      console.log("Done!");
    } catch (err) {
      console.log(err);
    }
  }
};

const withdraw = async () => {
  console.log(`Withdrawing`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      await listenForTxMined(await contract.withdraw(), provider);
      console.log("Done!");
    } catch (err) {
      console.log(err);
    }
  }
};

const balance = async () => {
  console.log(`Balance`);
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    try {
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const contractBalance = await contract.provider.getBalance(
        contract.address
      );
      console.log(`balance of contract = ${contractBalance}`);
    } catch (err) {
      console.log(err);
    }
  }
};

function listenForTxMined(transactionResponse, provider) {
  console.log(`Mining... ${transactionResponse.hash}`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Complete with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
window.onload = setButtonText;
connectButton.onclick = connect;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = balance;
