import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContract, useSigner } from 'wagmi'
import AddCandidate from "./Components/AddCandidate";
import Voting from "./Components/Voting";
import {CONTRACT_ADDRESS, CONTRACT_ABI} from "./CONTRACT";

const [screen, setScreen] = useState('home')
const [candidates, setCandidates] = useState([])
function App() {

	const [screen, setScreen] = useState('home')
	const [candidates, setCandidates] = useState([])
	const [totalVotes, setTotalVotes]= useState(0)
	const { address } = useAccount()
	const { data: signer } = useSigner()

	const contract = useContract({
		address: CONTRACT_ADDRESS,
		abi: CONTRACT_ABI,
		signerOrProvider: signer
	})

	const addCandidate = async(name, party, imageUri) => {
		try {
			const tx = await contract.addCandidate(name, party, imageUri)
			await tx.wait()
			console.log(tx)
			console.log("Candidate Added")
		} catch(err) {
			console.log(err)
		}
	}
	
	const vote = async(candidateId) => {
		try {
			const tx = await contract.vote(candidateId)
			await tx.wait()
			console.log(tx)
			console.log("Voted")
		} catch(err) {
			console.log(err)
		}
	}
	const getCandidates = async() => {
		try {
			const count = await contract.candidateCount()
			console.log("Candidate Count ", count.toString())
			let candidatesArr = []
			for(let i = 1; i <= count; i++) {
				const candidate = await contract.candidates(i)
				console.log(candidate)
				let candidate_obj = {
					name: candidate[0],
					party: candidate[1],
					imageUri: candidate[2],
				}
				candidatesArr.push(candidate_obj)
			}
			setCandidates(candidatesArr)
		} catch(err) {
			console.log(err)
		}
	}
	const getTotalVotes = async() => {
		try {
			const count = await contract.totalVotes()
			console.log("Total Votes ", count.toString())
			setTotalVotes(count.toString())
		} catch(err) {
			console.log(err)
		}
	}
	
	useEffect(() => {
		if(contract) {
			getCandidates()
			getTotalVotes()
		}
	}, [contract])

	const RenderScreen = () => {
		return (
			<div className="flex flex-col gap-4 items-center justify-center min-h-screen">
				{
					screen === 'addCandidate' ? (
						<AddCandidate setScreen={setScreen} addCandidate={addCandidate} />
					) : (
						<Voting setScreen={setScreen} vote={vote} candidates={candidates} />
					)
				}
			</div>
		)
	}
	
	return (
		<div className="bg-black text-white">
			<div className="flex items-center justify-between flex-row px-4 py-2">
				{/* Logo */}
				<h1 className="text-2xl font-bold">Election</h1>
				<ConnectButton />
			
		</div>
		{
			screen==='home' ? (
				<div className="flex flex-col gap-4 items-center justify-center min-h-screen">
			<h1 className="text-4xl font-extrabold">Vote</h1>
			{
				address ? (
					<div className="flex flex-row gap-4 items-center justify-center">
						<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Add Candidate</button>
						<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Vote</button>
					</div>
				) : (
					<ConnectButton />
				)
			}
		</div>
			)
		: (
		<RenderScreen/>
		)
		}
		</div>
	);
}

export default App;	