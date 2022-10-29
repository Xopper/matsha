import React, { useEffect } from 'react'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { faFlag } from '@fortawesome/free-solid-svg-icons'
import ReactStars from 'react-stars'
import getInstance, { socket } from './instances/help2';
import { useNavigate } from 'react-router-dom';
import { faUserLargeSlash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch } from 'react-redux';
import { addWarn } from './redux/reducers/WarnSlice';
import swal from 'sweetalert';

const Pro = ({user, imgs, userData, type}) => {
    const token = localStorage.getItem('authToken');
    const [photos, setPhotos] = useState([]);
    const [online, setOnline] = useState("Offline");
    const [age, setAge] = useState(0);
    const [prefs, setPrefs] = useState([])
    const [city, setCity] = useState("");
    const [tags, setTags] = useState([]);
    const [position, setPosition] = useState([5,5]);
    const [heart, setHeart] = useState(user.liked);
    const navigate = useNavigate();
    const [test, setTest ] = useState(null);
    const dispatch = useDispatch();
    const [reported, setReported] = useState(user.reported === 0 ? false : true);

    useEffect(() => {
        if (user.blocked === 1)
        {
            setTest(user.username);
            dispatch(addWarn({warn : "already blocked", username : user.username}))
            navigate("/Search");
        }

        const visitpro = async () => {
            if (!type) {
                const status = await getInstance(token).post("/setNotifications/messages", {
                    to: user.username,
					type: 5
                })
                if (status) {

                }
            }
        }
        visitpro();
        const getCountry = async () => {
            const latitude = user.lat;
            const longitude = user.lng;
        
            const geoapiurl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage-en`
            
    
            await fetch(geoapiurl).then(res => res.json()).then(data => {
                const con = data.city;
                setCity(con);
            })
        }

        const getimgs = async () => {
            if (user.username)
            {
                var bday = user.birthDay;
                bday = bday.split("-");
                var bday_in_milliseconds = new Date(parseInt(bday[0], 10), parseInt(bday[1], 10) - 1 , parseInt(bday[2]), 10).getTime();
                var now = new Date().getTime();
                var date = (now - bday_in_milliseconds) / 31556952000;
                const dat = date.toString();
                setAge(dat.substr(0, 2));
                setPhotos((Object.values(imgs)));
                setPrefs(userData.userPrefs);
                setTags(userData.userTags);
                setPosition([user.lat, user.lng])
            }
            await getCountry();
        
        }
        getimgs();
        		// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user,test])

	useEffect(() => {
        socket.on("usersIsOnline", (isOnline) => {
          if (isOnline)
            setOnline("Online")
        })
        socket.on('usersIsOffline', (isOfline) => {
                if (isOfline === user.username)
                    setOnline("Offline")
        });
        		// eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])
    const iconMarkup = renderToStaticMarkup(
    	<FontAwesomeIcon icon={faLocationDot} size="2x" className='text-red-600'/>
	);
	const customMarkerIcon = divIcon({
		className: 'Leaflet',
		html: iconMarkup
	});

    const handleSocket = async () => {
        setHeart(!heart);
        await getInstance(token).post("/likeEndPoint/like", {
            userName: user.username,
        })
        socket.emit('like', user.username);
        
    }

    const blockAccount = async () => {
        await getInstance(token).post("/blockEndPoint/block", {
            userName: user.username,
        })
        dispatch(addWarn({warn : "just blocked", username : user.username}))
        navigate("/Search");
    }

    const reportIt = async () => {
       
        const res = await getInstance(token).post("/reportEndPoint/report",{
            userName: user.username
        })
		console.log(res);
		if(res.data.status === 0)
		{
			setReported(!reported);
			swal({
				title: "Cooool",
				text: `You have reported ${user.username} successfully`,
				icon: "success",
				buttons: "close"
			})
		} else {
			if (res.data.errors === "User already reported.")
			{
				swal({
					title: "OOOOOPs!!!",
					text: "User already reported.",
					icon: "error",
					buttons: "close"
				})
			} else {
				swal({
					title: "Nooooop!!!!",
					text: "something goes wrong Please try again",
					icon: "error",
					buttons: "close"
				})
			}
    	}
	}

    const maptag = 
    <div className='flex flex-col space-y-4 '>
        {tags.map((tg, i) => {
            return (
                <div className='p-2 bg-indigo-400 rounded-2xl shadow-xl ' key={i}>
                    <h1 className='text-black text-lg '>{tg}</h1>
                </div>

        )})}
    </div>
    const mapPhotos = 
        <div className=' flex flex-wrap gap-2  justify-center items-center w-full'>
            {photos.map((photo, i) => {return(
                <div key={i} className={Object.values(photo).length > 0 ? '  xs:w-[200px] xs:h-[200px] h-[150px] w-[150px] border rounded-xl' : 'hidden'}>
                    <img src={photo} className="w-full h-full" alt="img"></img>
                </div>
                
            )})}
        </div>

  return (
    <div className='py-32 px-[3%] xs:px-[15%] flex flex-col xl:flex-row space-y-5 xl:space-y-0 xl:space-x-2'>
        <div className='w-full xl:w-[33%] flex flex-col px-[5%]  xl:px-[3%]  justify-center items-center bg-indigo-200 h-auto pt-10 pb-10 rounded-2xl'>
            <div className=' rounded-full '>
                <img src={photos[0]} className="w-[150px] h-[150px]  xs:h-[200px] xs:w-[200px]  rounded-full" alt="Avatar"></img>
            </div>
            <div className={!type ? 'flex mt-3  justify-center items-center mb-5' : "hidden"}>
                <div className={online === "Offline" ? 'w-3 h-3 rounded-full bg-gray-500 mr-1 ' : 'w-3 h-3 rounded-full bg-green-500 mr-1 '}></div>
                <h1 className='text-md text-black' >{online}</h1>
            </div>
            <ReactStars  count={5} value={user.fameRating} size={25} color2={'#FFA500'} edit={false} className="mb-5"/>
            <div className={!type ? 'flex gap-10 xs:gap-20 mb-5' : "hidden"}>
                <FontAwesomeIcon icon={faHeart} size="2x" className={!heart ? 'like' : 'like text-red-600'} onClick={handleSocket}/>
                <FontAwesomeIcon icon={faUserLargeSlash} size="2x" className='like' onClick={blockAccount}/>
                <FontAwesomeIcon icon={faFlag} size="2x" className={!reported ? 'like' : 'like text-red-600'} onClick={reportIt}/>
            </div>
            <h1 className='text-3xl text-black italic mb-32 '>{user.username}</h1>
            <div className='w-full  rounded-2xl bg-indigo-300 pt-10 pb-16 space-y-5 pl-6 ' >
                <h1 className='text-2xl italic font-bold underline'> Information : </h1>
                <h1 className='text-md font-bold font-mono'>Age: <span className='text-gray-500'>{age}</span></h1>
                <h1 className='text-md font-bold font-mono'>Firstname : <span className='text-gray-500'>{user.firstName}</span></h1>
                <h1 className='text-md font-bold font-mono'>Lastname : <span className='text-gray-500'>{user.lastName}</span></h1>
                <h1 className='text-md font-bold font-mono'>Gender : <span className='text-gray-500'>{prefs.gender}</span></h1>
                <h1 className='text-md font-bold font-mono'>Looking for : <span className='text-gray-500'>{prefs.sexual_preference}</span></h1>
                <h1 className='text-md font-bold font-mono'>city : <span className='text-gray-500'>{city}</span></h1>
            </div>
        </div>
        <div className='flex flex-col space-y-5 w-full xl:w-[33%] '>
            <div className='w-full flex flex-col px-[5%] xl:px-[10%]   bg-indigo-200 h-full pt-10 pb-10 rounded-xl space-y-5'>
                <h1 className='text-2xl italic font-bold underline '>Biography :</h1>
                <h1 className='text-black font-sans'>{user.biography}</h1>
                <h1 className='text-2xl italic font-bold underline '>Tags :</h1>
                {maptag}
            </div>
            <div className='w-full  flex flex-col px-[5%]  xl:px-[10%]  bg-indigo-200 h-auto pt-10 pb-10 rounded-xl space-y-5'>
                <h1 className='text-2xl italic font-bold underline '>Localisation :</h1>
                <div className='w-full h-[350px] '>
                    <MapContainer center={user.username ? [user.lat, user.lng] : [5,5] } zoom={13} scrollWheelZoom={true} >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position} icon={customMarkerIcon} className="leaflet-marker-icon">
                        </Marker>
                    </MapContainer>
                </div>
            </div>
        </div>
        <div className='w-full xl:w-[33%] flex flex-col px-[5%] xl:px-2  space-y-10   bg-indigo-200 h-auto pt-10 pb-10 rounded-2xl'>
            <h1 className='text-2xl italic font-bold underline '> Gallery :</h1>
            {mapPhotos}
        </div>
        
    </div>
  )
}

export default Pro
