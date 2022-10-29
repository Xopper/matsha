import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ResetPassword from '../components/ResetPassword'


const Password = () => {
  return (
    <div className=" h-auto md:h-screen  justify-between bg-zinc-100">
        <div className='w-screen bg-zinc-100 overflow-y-auto'>
        	<Navbar />
			<ResetPassword />
		</div>
		<Footer />
    </div>
  )
}

export default Password