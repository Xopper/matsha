import React from 'react'
import Navbar2 from '../components/Navbar2'
import Personalinfos from '../components/Personalinfos'
import Footer from '../components/Footer'
import Down from '../components/Down'

const Account = () => {
  return (
    <>
        <div className=" h-auto md:h-screen flex flex-col justify-between bg-zinc-100">
			  <div className=' w-screen bg-zinc-100 overflow-y-auto'>
                <Navbar2 />
                <Personalinfos />
			</div>
      <Down name="Infos"/>
			<Footer />
		</div>
        
        
    </>
  )
}

export default Account