import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Down from '../components/Down'
import Signup from '../components/Signup'

const Register = () => {
  return (
    <>
		<Navbar />
		<Signup />
		  <Down  name="Sing Up" />
		<Footer />
    </>
  )
}

export default Register