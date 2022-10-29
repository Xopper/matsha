import React from 'react'
import Navbar2 from '../components/Navbar2'
import Footer from '../components/Footer'
import LastVisit from '../components/LastVisit'

const Notifacation = () => {
  return (
    <div className="relative flex flex-col h-auto md:h-screen  justify-between bg-zinc-100">
      <Navbar2 />
      <LastVisit type={false}/>
      <Footer />
    </div>
  )
}

export default Notifacation