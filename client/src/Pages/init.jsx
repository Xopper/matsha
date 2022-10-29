import React from 'react'
import Registration from '../components/Registration'
import Navbar2 from '../components/Navbar2'
import Footer from '../components/Footer'

const init = () => {
	
  return (
    <>
      <div className=" h-auto md:h-screen flex flex-col justify-between bg-zinc-100">
			<div className=' w-screen bg-zinc-100 overflow-y-auto'>
				<Navbar2 />
				<Registration/>
			</div>
			<Footer />
		</div>
    </>
  )
}

export default init