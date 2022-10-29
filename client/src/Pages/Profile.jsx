import React, { useState } from 'react'
import Navbar2 from '../components/Navbar2'
import Pro from '../components/Pro'
import Footer from '../components/Footer'
import { useSelector } from 'react-redux'
import { getUserData } from '../components/redux/reducers/userSlice'
import getInstance from '../components/instances/help2'
import { useEffect } from 'react'


const Profile = () => {
	const user = useSelector(getUserData)
	const token = localStorage.getItem('authToken');
	const [img, setImg] = useState([]);
	const [data, setData] = useState({});
	const [isActive, setIsActive] = useState(false)

	useEffect(() => {
		const dataimage = async () => {
			const res = await getInstance(token).get("/getPictures/pics");
			return res.data.userPics[0];
		}
		const getpref = async () => {
            const res = await getInstance(token).get("/getPreferences/prefs");
            return (res.data);
        }
		const getalldata = async() => {
			const imgs = await dataimage();
			setImg(imgs);
			const userData = await getpref();
			setData(userData);
			setIsActive(true)
		}
		getalldata();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return (
    	<div className=" h-auto md:h-screen  justify-between bg-zinc-100">
        	<div className='w-screen bg-zinc-100 overflow-y-auto'>
            	<Navbar2 />
			{isActive && <Pro user={user} imgs={img} userData={data} type={true}/>}
			</div>
    		<Footer />
		</div>
  )
}

export default Profile