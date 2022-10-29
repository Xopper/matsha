import React from 'react'
import Navbar2 from '../components/Navbar2'
import Footer from '../components/Footer'
import Down from '../components/Down'
import EditPref from '../components/EditPref'

const EditPreferences = () => {
  return (
    <>
        <div className=" h-auto md:h-screen flex flex-col justify-between bg-zinc-100">
				<div className=' w-screen bg-zinc-100 overflow-y-auto'>
                	<Navbar2 />
                    <EditPref />
				</div>
				<Down name="Edit Password"/>
				<Footer />
			</div>
    </>
  )
}

export default EditPreferences