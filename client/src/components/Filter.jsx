import React, { useState } from 'react'
import { useEffect } from 'react'
import getInstance from './instances/help2'
import ReactStars from 'react-stars'
import { useSelector } from 'react-redux'
import { getUserData } from './redux/reducers/userSlice'
import getDistance from 'geolib/es/getDistance';
import { useNavigate } from 'react-router-dom'

const Filter = () => {
	const token = localStorage.getItem('authToken');
	const pro = useSelector(getUserData);
	const navigate = useNavigate();

	const [location, setLocation] = useState({
		min : 0,
		max : 10000,
		minValue : 500,
		maxValue : 9000,
		step : 100,
	})
	const [Age, setAge] = useState({
		min : 18,
		max : 60,
		minValue : 20,
		maxValue : 55,
		step : 1,
	})
	const [tags, setTags] = useState({
		min : 0,
		max : 5,
		minValue : 0,
		maxValue : 4,
		step : 1,
	})
	const [four, setFour] = useState({
		set : [false, false, false, false],
		name : ["Fame Rating.", "Age.", "Location.", "Common Tags."],
		sort : ["public_famerating", "birthdate", "location", "tags"]
	})
	const [allProfiles, setAllProfiles] = useState([]);
	const [star, setStar] = useState(2.6);
	const [sort, setSort] = useState("")
	const [profiles, setProfiles] = useState([]);

	
	const handlerange = (e) => {
		const priceGap = 1;
		let Price = parseInt(e.target.value);

		const s = document.getElementById("sliderProgress");
        if(e.target.classList[0] === "range-min"){
			if(parseInt(Age.maxValue - Price) < priceGap)
				Price = Age.maxValue - priceGap
			setAge({...Age, minValue : Price})
            s.style.left = ((Price - 18) * 2.38) + "%";	
        } else {
			if (Price - Age.minValue < priceGap)
				Price = Age.minValue + priceGap;
			setAge({...Age, maxValue : Price})
            s.style.right = (100 - ((Price - 18)) * 2.38) + "%";
		}
	}
	const handleLocation = (e) => {
		const kmGap = 100;
		let km = parseInt(e.target.value);

		const s = document.getElementById("sliderProgresskm");
        if(e.target.classList[0] === "location-min"){
			if(parseInt(location.maxValue - km) < kmGap)
				km = location.maxValue - kmGap
			setLocation({...location, minValue : km})
            s.style.left = (km / 100)  + "%";	
        } else {
			if (km - location.minValue < kmGap)
				km = location.minValue + kmGap;
			setLocation({...location, maxValue : km})
            s.style.right = (100 - (km / 100)) + "%";
		}
	}
	const handletags = (e) => {
		const tagGap = 1;
		let tag = parseInt(e.target.value);

		const s = document.getElementById("sliderProgresstags");
        if(e.target.classList[0] === "tag-max"){
			if (tag - tags.minValue < tagGap)
				tag = tags.minValue + tagGap;
			setTags({...tags, maxValue : tag})
            s.style.right = (100 - ((tag * 20))) + "%";
		}
	}

	const changebox = (index) => {
		const box = [false, false, false, false];

		box[index] = true;
		setFour({...four, set : box})
		setSort(four.sort[index])
	}
	const filterit = () => {
		const items = allProfiles.filter((item) => (item.birthdate >= Age.minValue && item.birthdate <= Age.maxValue) && (item.public_famerating >= star) && (parseInt(item.location) >= location.minValue && parseInt(item.location) <= location.maxValue))
		setProfiles(items);
	}
	const calculAge = (birthDay) => {
		if(birthDay)
		{
			var bday = birthDay.substr(0, 10);
			bday = bday.split("-");
			var bday_in_milliseconds = new Date(parseInt(bday[0], 10), parseInt(bday[1], 10) - 1 , parseInt(bday[2]), 10).getTime();
			var now = new Date().getTime();
			var date = (now - bday_in_milliseconds) / 31556952000;
			return  Number(date.toFixed(0))
		}
	}

	const changeStar = (value) => {
		setStar(value);
	}

	const getdis = (user) => {
		if (pro.lng)
		{
			let dis = getDistance(
				{ latitude: pro.lat, longitude: pro.lng },
				{ latitude: user.latitude, longitude: user.longitude }
			)
			return dis / 1000;
		}
	}
	
	useEffect(() => {
		const getProfiles = async () => {
			const response = await getInstance(token).get('/filter/sex_prefs');
			const FilterData = response.data.filtredUsers?.map(item => {
				item.birthdate = calculAge(item?.birthdate)
				item.location = getdis(item)
				return item
			})
			setAllProfiles(FilterData);
			setProfiles(FilterData);
		}
		getProfiles();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	 	}, [token])

	const mapfour = 
	<div className='space-y-10 xs:space-y-0 xs:grid xs:grid-cols-2 lg:flex gap-12 lg:space-x-10 mt-20'>
		{four.set.map((some, index) => {
			return(
				<div className='flex space-x-2 lg:justify-between items-center' key={index}>
					<div className={some === true ? 'h-[20px] w-[20px] border rounded-lg  bg-indigo-600' : 'h-[20px] w-[20px] border rounded-lg bg-gray-100 '} onClick={() => changebox(index)}></div>
					<h1 className='text-xs font-bold'>{four.name[index]}</h1>
				</div>
		)})}
	</div>
	
	const mapUsers = 
		<div className='flex flex-wrap  gap-5 justify-center'>
			{profiles?.sort((a,b) => a[sort] - b[sort]).map((user, index) => (
					<div className='w-[200px] h-[300px] border  rounded-3xl flex flex-col items-center gap-3 cursor-pointer' key={index} onClick={() => navigate(`/user/${user.user_name}`)}>
						<img className='w-full h-[60%] rounded-t-3xl' src={user?.profile_img} alt='al'></img>
						<h1 className='text-xs font-mono font-bold mt-4'>{user?.first_name} {user?.last_name}, {user?.birthdate}</h1>
						<div className='flex'>
							<ReactStars  count={5} value={user.public_famerating} size={18} color2={'#FFA500'} edit={false}/>
							<h1 className='text-[0.5rem] font-bold ml-1'>({user.public_famerating.toFixed(1)})</h1>
						</div>
						<h1 className='text-xs font-bold'>{user.location} (km)</h1>
					</div>
			))}
		</div>
  return (
    <div  className='mt-[150px] px-[15%] flex flex-col space-y-10 justify-center items-center'>
        <div className='w-full bg-white rounded-2xl flex flex-col justify-between items-center py-[20px] px-[40px]'>
            <div className='space-y-10 xs:space-y-0 xs:grid xs:grid-cols-2 xs:gap-10 xl:flex  justify-between items-center w-full'>
				<div className='flex justify-center items-center'>
					<div className='flex flex-col spacey-4 w-40'>
						<h1 className="text-sm font-bold font-mono">Frame Rating.</h1>
						<ReactStars  
						count={5}
						value={star}
						size={25}
						color2={'#ffd700'}
						onChange={changeStar}
						/>
					</div>
				</div>
				<div className='flex justify-center items-center'>
					<div className='flex-col space-y-4  w-40'>
						<h1 className="text-sm font-bold font-mono">Age.</h1>
						<div >
							<div className="slider">
								<div className="progress" id="sliderProgress"></div>
							</div>
							<div className="range-input ">
								<input type="range" className="range-min" min={Age.min} max={Age.max} value={Age.minValue} step={Age.step} onChange={(e) => handlerange(e)} />
								<input type="range" className="range-max" min={Age.min} max={Age.max} value={Age.maxValue} step={Age.step} onChange={(e) => handlerange(e)} />
							</div>
						</div>
					</div>
				</div>
				<div className='flex justify-center items-center'>
					<div className='flex-col space-y-4  w-40'>
						<h1 className="text-sm font-bold font-mono">Location.</h1>
						<div>
							<div className="sliderkm">
								<div className="progress" id="sliderProgresskm"></div>
							</div>
							<div className="range-inputkm ">
								<input type="range" className="location-min" min={location.min} max={location.max} value={location.minValue} step={location.step} onChange={(e) => handleLocation(e)} />
								<input type="range" className="location-max" min={location.min} max={location.max} value={location.maxValue} step={location.step} onChange={(e) => handleLocation(e)} />
							</div>
						</div>
					</div>
				</div>
				<div className='flex justify-center items-center'>
					<div className='flex-col space-y-4  w-40'>
						<h1 className="text-sm font-bold font-mono">Common Tags.</h1>
						<div>
							<div className="slidertags">
								<div className="progress" id="sliderProgresstags"></div>
							</div>
							<div className="range-inputtags ">
								<input type="range" className="tag-max" min={tags.min} max={tags.max} value={tags.maxValue} step={tags.step} onChange={(e) => handletags(e)} />
							</div>
						</div>
					</div>
				</div>
            </div>
			{mapfour}
        </div>
		<button className='w-[150px] h-[25px]' onClick={filterit}>filter</button>
		{mapUsers}
    </div>  
  )
}

export default Filter