import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectBtn")
const fundButton = document.getElementById("fundBtn")
const balanceButton = document.getElementById("balanceBtn")
const withdrawButton = document.getElementById("withdrawBtn")
const message = document.getElementById("message")
const ethAmountInput = document.getElementById("ethAmount")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum != "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (e) {
            message.innerHTML = e
        }
        connectButton.innerHTML = "Connected!"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        message.innerHTML = `Address: ${accounts}`
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function fund() {
    const ethAmount = ethAmountInput.value ? ethAmountInput.value : "0.1"
    message.innerHTML = `funding with ${ethAmount}...`
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            message.innerHTML = "Done!"
        } catch (e) {
            console.log(e)
        }
    } else {
        fundButton.innerHTML = "Please Install Metamask"
    }
}

async function withdraw() {
    message.innerHTML = "Withdrawing funds..."
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            message.innerHTML = "Done!"
        } catch (e) {
            console.log(e)
        }
    } else {
        message.innerHTML = "Please Install Metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            message.innerHTML = `Balance: ${ethers.utils.formatEther(
                balance
            )} ETH`
        } catch (e) {
            console.log(e)
        }
    } else {
        message.innerHTML = "Please Install Metamask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // we wrap provider.once in a promise to wait for the confirmations and then calling resolve() we can continue
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations`
                )
                resolve()
            })
        } catch (e) {
            reject(e)
        }
    })
}
