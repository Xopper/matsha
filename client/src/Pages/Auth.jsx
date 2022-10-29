import {React} from 'react'
import Navbar from '../components/Navbar'
import Signin from '../components/Signin'
import Footer from '../components/Footer'
import Down from '../components/Down'

const Auth = () => {
  return (
	<>
		<Navbar />
		<Signin />
		<Down  name="Sign in"/>
		<Footer />
	</>
  )
}

export default Auth