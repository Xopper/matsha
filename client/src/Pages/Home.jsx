import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { CheckAuth } from "../components/Auth";
import Navbar2 from "../components/Navbar2";
import React, { useEffect, useState } from "react";


const Home = () =>  {
	const [auth, setAuth] = useState(null);
	useEffect(() => {
		const check = async () => {
			const res = await CheckAuth();
			setAuth(res.status);
		}
		check()
	}, [])

	return (
		<>
		<div className=" h-auto md:h-screen flex flex-col justify-between bg-zinc-100">
			<div className=' w-screen bg-zinc-100 overflow-y-auto'>
				{(!auth) ? <Navbar /> : <Navbar2 />}
				<Hero />
			</div>
			<Footer />
		</div>
		
		
		</>
	);
}

export default Home