import React, { useEffect, useState } from 'react'
import Navbar2 from '../components/Navbar2'
import Pro from '../components/Pro'
import Footer from '../components/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getUserData } from '../components/redux/reducers/userSlice'
import getInstance, { socket } from '../components/instances/help2'

const UserProfile = () => {
	const {slug} = useParams();
	const navigate = useNavigate();
	const user = useSelector(getUserData)
	const token = localStorage.getItem('authToken');
	const [img, setImg] = useState([]);
	const [data, setData] = useState({});
	const [isActive, setIsActive] = useState(false)
	const [match, setMatch] = useState({})

	useEffect(() => {
		if (match.username)
			socket.emit('OnlineUser', match.username);
	}, [match])

	
	useEffect(() => {
		const getMymatch = async () => {
			const res = await getInstance(token).post("/profileUserInfos/userInfos", {
				userNameLokingFor: slug
			});
			return (res);
		}
		const getalldata = async() => {
			const myuser = await getMymatch();
			if(myuser.data.errors)
				navigate("/usernotfound")
			else {
				const obj = {
					biography: myuser.data.allUserInfos.biography,
					birthDay: myuser.data.allUserInfos.birthday,
					email: "",
					firstName: myuser.data.allUserInfos.firstName,
					lastName: myuser.data.allUserInfos.lastName,
					lat: myuser.data.allUserInfos.lat,
					lng: myuser.data.allUserInfos.lng,
					username: myuser.data.allUserInfos.userName,
					fameRating: myuser.data.allUserInfos.fameRating,
					liked: (myuser.data.allUserInfos.liked === 0 ? false : true),
					blocked: myuser.data.allUserInfos.blocked,
					reported: myuser.data.allUserInfos.reported,
				}
				setMatch(obj);
				const imgs = {
					avatarSrc: myuser.data.allUserInfos.profileImg,
					profilePic1: (myuser.data.allUserInfos.imgOne === null ? "" : myuser.data.allUserInfos.imgOne),
					profilePic2: (myuser.data.allUserInfos.imgOne === null ? "" : myuser.data.allUserInfos.imgTwo),
					profilePic3: (myuser.data.allUserInfos.imgOne === null ? "" : myuser.data.allUserInfos.imgThree),
					profilePic4: (myuser.data.allUserInfos.imgOne === null ? "" : myuser.data.allUserInfos.imgFour),
				}
				setImg(imgs);
				const userPrefs = {
					userPrefs : {
						gender: myuser.data.allUserInfos.gender,
						sexual_preference: myuser.data.allUserInfos.sexualPreference 
					},
					userTags : myuser.data.allUserInfos.tags
				}
				setData(userPrefs);
				setIsActive(true)
			}
		}
		if(user.username === slug) navigate("/Profile")
		else getalldata();

		 // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	
  return (
    <div className=" h-auto md:h-screen  justify-between bg-zinc-100">
        <div className='w-screen bg-zinc-100 overflow-y-auto'>
            <Navbar2 />
            {isActive && <Pro user={match} imgs={img} userData={data} type={false} />}
        </div>
        <Footer />
    </div>
  )
}

export default UserProfile

