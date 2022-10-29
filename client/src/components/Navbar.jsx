import {React, useState} from 'react'

import {MenuIcon, XIcon} from '@heroicons/react/outline'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
	const navigate = useNavigate();
	const [icon, setIcon] = useState(false)
	const handleClick = () => setIcon(!icon) 
  return (
	<div className='w-screen h-[80px] z-20 fixed'>
    	<div className='w-full h-full bg-zinc-100 drop-shadow-lg flex justify-between items-center px-[15%]'>
       		<h1 className='text-black font-bold text-2xl sm:text-3xl md:text-3xl' ><Link to="/">Matcha.</Link></h1>
        	<div className='hidden md:flex items-center w-auto h-full space-x-3'>
				<div className='hover:border hover:rounded-xl hover:border-indigo-600' onClick={() => navigate("/auth")}><button className='border-none bg-transparent text-black py-3 px-8' >Sign In</button></div>
				<div onClick={() => navigate("/auth/register")}><button className='px-8 py-3' >Sign Up</button></div>
       		 </div>
			<div className='flex md:hidden' onClick={handleClick}>
				{!icon ? <MenuIcon className='w-5' /> : <XIcon className='w-5' />}
			</div>
    	</div>
		<div className={!icon ? 'hidden' : 'absolute w-full px-8 flex flex-col md:hidden bg-zinc-100 py-8 drop-shadow-lg'}>
			<button className='border-none bg-transparent text-black py-3 px-8'><Link to="/auth">Sign In</Link></button>
			<button className='px-8 py-3'><Link to="/auth/register">Sign Up</Link></button>
		</div>
	</div>
  )
}

export default Navbar