import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import instance from '../components/instances/helpaxios'
import { useState } from 'react'
import swal from 'sweetalert'
import ResitIt from '../components/ResitIt'

const Reset = () => {
	const { slug } = useParams();
	const [username, setUsername] = useState("");
	const navigate = useNavigate();

	const sendVer = async () => {
		const { data } = await instance.get(`/passwordverification/passwordtokenverification/${slug}`)
		return data;
	}

	useEffect(() => {

		console.log("355as4d5as")
		const checkuser = async () => {
			const data = await sendVer();
			console.log("this is data comming from backend ", data)
			if (data.status === 0){
				setUsername(data.userName);
			} else {
				swal({
					title: "Noooop!!!",
					text: "Something went wrong!",
					icon: "error",
					buttons: "close"
				})
				// navigate("/auth");
			}
		}
		checkuser();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
  	return (
    	<div className=" h-auto md:h-screen  justify-between bg-zinc-100">
        	<div className='w-screen bg-zinc-100 overflow-y-auto'>
				<Navbar />
				<ResitIt username={username} />
			</div>
			<Footer />
    	</div>

  )
}

export default Reset