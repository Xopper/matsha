 import {React} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faChevronDown} from '@fortawesome/free-solid-svg-icons';
import {faCircleXmark} from '@fortawesome/free-solid-svg-icons'
import { useState , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import getInstance from './instances/help2'
import { useCallback } from 'react';
import {publicIpv4} from 'public-ip';
import * as ipLocation from 'iplocation'; 




const Registration = () => {
    const initiatall = {
        gender: "Gender" , 
        interests: "Interests", 
        biography: "", 
        birth: "" , 
        tags:  [] ,
        Photo1 : "",
        Photo2 : "",
        Photo3 : "",
        Photo4 : "",
        Photo5 : "",
    }
    const [photos, setPhotos] = useState({Photo1: "No file choosen" , Photo2: "No file choosen", Photo3: "No file choosen", Photo4: "No file choosen", Photo5: "No file choosen"});
	const [errors, setErrors] = useState({})
    const [all, setAll] = useState(initiatall);
    const [location, setLocation] = useState({latitude: null, longitude: null});
    const [country, setCountry] = useState("Uknown");
    const array = ["male", "female"];
    const array2 = ["male", "female", "bi"];
    const [visible, setVisible] = useState(false);
    const [visible2, setVisible2] = useState(false);
    const [tags, setTags] = useState("");
    const [tg, setTg] = useState([]);

    const success = useCallback(async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLocation({latitude, longitude});
    
        const geoapiurl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage-en`
        

        await fetch(geoapiurl).then(res => res.json()).then(data => {
            const con = data.countryName;
            setCountry(con);
        })
    }, [])

    const error = useCallback(async (err) => {
        if(err.code) {
            try {
                const publicLoction = await publicIpv4();
                const {
                    longitude, latitude, country: { name: country } } = await ipLocation(publicLoction);
                setLocation({latitude, longitude});
                setCountry(country);
            } catch (err) {}
        }
    }, [])
    useEffect(() => {
     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error)
     }
     else {
        swal({
            title : 'OOPS!',
            text: 'cant get your location',
            icon : 'warning',
            buttons : 'close',
        })
     }
     		// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    

    const handleit = (e) => {
        const  name = e.target.name;
        setAll({...all, [name] : e.target.value});
        if(name === "gender") {
            setVisible(false);
        }
        if(name === "interests") {
            setVisible2(false);
        }
    }

    const map = 
        <div className='w-full h-auto  flex flex-col absolute  rounded-xl px-3'>
        {array.map((ar, i) => {
            return (
                <input type="button" name="gender" className='w-full bg-zinc-100  h-[30px] drop-shadow-lg text-xs font-bold flex justify-center items-center hover:bg-zinc-200 cursor-pointer' 
                 value={ar} onClick={handleit} key={i}></input>
        )})}
        </div>

    const mapa = 
    <div className='w-full h-auto  flex flex-col absolute  rounded-xl px-3'>
    {array2.map((ar, i) => {
        return (
            <input type="button" name="interests" className='w-full bg-zinc-100  h-[30px] drop-shadow-lg text-xs font-bold flex justify-center items-center hover:bg-zinc-200 cursor-pointer' 
            value={ar} onClick={handleit} key={i}></input>
    )})}
    </div>

    const handleUpload = (name) => {
        const Add1 = document.getElementById(name);
        Add1.click();
    }

    const handlechangefile = (e) => {
		const File = e.target.files[0];
		const name  = e.target.name;
        const Filereader = new FileReader();
        const imageMimeType = /image\/(png|jpg|jpeg)/i;

        if (!File) {
            swal({
                title: 'OUCHHHHH!',
                text: 'Please select an image',
                icon: 'error',
                buttons : 'close',
            })
            return false;
        }
        if (!File.type.match(imageMimeType)) {
            swal({
                title : 'OUCHHHHHH!',
                text : 'Please select an image',
                icon: 'error',
                buttons : 'close',
            })
            return false;
        }
        Filereader.onload = e => {
			const img = new Image();
			img.onload = () => {};
			img.onerror = () => {
				swal({
					title: 'OUUUUUUCH!',
					text: `Invalid image content.`,
					icon: 'warning',
					confirmButtonText: 'close'
				});
				return false;
			};
			img.src = e.target.result;
			setPhotos({...photos, [name] : File.name})
            setAll({...all, [name] : img.src})
		};
		Filereader.readAsDataURL(File);
	}
   

    const Compare = (tag) => {
        const number = all.tags.length;
        for (let i = 0; i < number; i++) {
            if (all.tags[i].name === tag) {
                return (false);
            }
        }
        return (true);
    } 

    const handletags = async (e) => {
        const {value} = e.target;
        await setTags(value);
    }

    const Pressenter =  (e) => {
        const namo = all.tags;
        const number = all.tags.length;
		const nama = "tags";
		const error = {};
        if (e.key === 'Enter' && tags && number < 5 && Compare(tags)) {
			namo.push({name : tags})
            tg.push(tags);
			setAll({...all, [nama] : namo})
            e.target.value = "";
            setTags("");
			setErrors({...errors, tags : error.tags})
			
        } else if (e.key === 'Enter' && !tags) {
			error.tags = "please type a tag";
		} else if (e.key === 'Enter' && number === 5 ) {
			error.tags = "you have reached max of tags";
		}
		if (error.tags){
			setErrors({...errors, tags : error.tags})
		};
    }
    const deleteitem = (e) => {
		const name = "tags";
		setAll({...all, [name]: all.tags.filter(item => item.name !== e)})
        setTags("");
    }

    const maptag =
    
    <div className='w-[350px] h-auto flex flex-wrap max-w-[350px]' id="ha">
        {all.tags.map((tg, i) => {
            return (
                <div className='w-auto py-2 px-2 bg-indigo-600 text-xs font-bold mr-2 mb-2 rounded-xl flex justify-center items-center' key={i} >
                    <h1 className='mr-1'>{tg.name}</h1>
                    <FontAwesomeIcon icon={faCircleXmark}  size='1x' className='cursor-pointer' name={tg.name} onClick={() => deleteitem(tg.name)}/>
                </div>
        )})}
    </div>

    

    let navigate = useNavigate();

    const redirect = () => {
        const er = validate(all);
        if (er) setErrors(er);
		else send_to_back(all);
    }
    
    const send_to_back = async (form) => {
        const cont = country;
        setTg(all.tags);
        console.log(all.tags);
        const token = localStorage.getItem('authToken');
        const res = await getInstance(token).post("/stepForm/stepFormValidator", {
            gender : form.gender,
            interests : form.interests,
            bio: form.biography,
            birthday : form.birth,
            profilePic1 : form.Photo1,
            profilePic2 : form.Photo2,
            profilePic3 : form.Photo3,
            profilePic4 : form.Photo4,
            profilePic5 : form.Photo5,
            tags : tg,
            latitude : location.latitude,
            longitude : location.longitude,
            country : cont,
        })
        console.log(res);
        if (res.data.status === 0)
        {
            navigate('/auth');
        }
    
    }

	const validate = (form) => {
		const error = {};
		var bday=form.birth;
		bday=bday.split("-");
		var bday_in_milliseconds = new Date(parseInt(bday[0], 10), parseInt(bday[1], 10) - 1 , parseInt(bday[2]), 10).getTime();
		var now = new Date().getTime();
		if(form.gender === "Gender") {
			error.gender = "please select a gender"
		}
		if (form.interests === "Interests") {
			error.interests = "please select your interest"
		}
		if (form.biography === "" ) {
			error.biography = "please write a biography"
		} else if (Object.keys(form.biography).length < 20){
			error.biography = "you must write at least 20 letters"
		}
		if (form.birth === "") {
			error.birth = "please enter your birth day"
		}
		else if (now - bday_in_milliseconds < 567648000000) {
			error.birth = "your age must be over than 18"
		}
		if (all.tags.length === 0) {
			error.tags = "please add between 1 and 5 tags"; 
		}
		if (photos.Photo1 === "No file choosen") {
			error.photos = "please add a profile image";
		}
		if (Object.keys(error).length === 0) {
            return false;
		}
		return (error);
	}
   

  return (
    <div className='h-auto lg:h-screen w-screen bg-zinc-100 px-[15%] py-[140px] overflow-y-auto'>
        <div className="h-full w-full flex flex-col lg:flex-row">
            <div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first '>
                <h1 className="text-2xl font-bold mb-3">Be in Match.</h1>
                <p className='text-xs mb-6 max-w-[350px]'>You Don't Have To Be Great To start, But You have To Start To Be Great</p>
                <p className='text-sm font-bold'>Choose your gender.</p>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-between items-center pl-3  left-shadow cursor-pointer ' onClick={() => { setVisible(!visible); setVisible2(false) }}>
                    <h1 className={(all.gender  === "Gender") ? 'text-xs font-bold text-gray-500' : 'text-xs font-bold '}>{all.gender}</h1>
                    <h1 className='text-black mb-2 text-xl '><FontAwesomeIcon icon={faChevronDown}  size='1x' className='mt-3 mr-4'/></h1>
                </div>
                <div className={visible ? 'flex z-10 w-full  max-w-[350px] h-auto  relative' : 'hidden z-10'}>
                    {map}
                </div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.gender}</p>
                <p className='text-sm font-bold'>Choose your intersts.</p>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-between items-center pl-3  left-shadow cursor-pointer ' onClick={() => { setVisible2(!visible2); setVisible(false)}}>
                    <h1 className={(all.interests === "Interests") ? 'text-xs font-bold text-gray-500' : 'text-xs font-bold '}>{all.interests}</h1>
                    <h1 className='text-black mb-2 text-xl '><FontAwesomeIcon icon={faChevronDown}  size='1x' className='mt-3 mr-4'/></h1>
                </div>
                <div className={visible2 ? 'flex z-10 h-auto  relative w-full  max-w-[350px]' : 'hidden z-10'}>
                    {mapa}
                </div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.interests}</p>
                <p className='text-sm font-bold'>Biography.</p>
                <div className='w-full max-w-[350px] h-[60px] rounded-xl bg-gray-200 flex  pl-3  left-shadow '>
                    <textarea  name="biography" className='w-[320px] bg-gray-200 outline-none text-sm  py-1 resize-none' onChange={handleit}/>
				</div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.biography}</p>
                <p className='text-sm font-bold'>Date of birth.</p>
                <div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex  pl-3 pr-4 left-shadow '>
                    <input type="date" name="birth"  className='w-[250px] sm:w-[350px] bg-transparent outline-none  text-sm  font-bold  '  onChange={handleit}></input>
                </div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.birth}</p>
                <p className='text-sm font-bold'>Tags.</p>
                <div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex  pl-3 pr-4 left-shadow '>
                    <input type="text" name="tags" placeholder='Press Enter to Add tags' className='w-[250px] sm:w-[350px] bg-transparent outline-none placeholder:text-[0.7rem] text-sm pr-4 font-bold ' value={tags} onChange={handletags} onKeyDown={Pressenter}></input>
                </div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.tags}</p>
                <div className='h-auto max-w-[350px]'>
                    {maptag}
                </div>
                <p className='text-sm font-bold'>Profile photos.</p>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex    pl-3  left-shadow '>
                    <input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo1" id='Add1' onChange={e => handlechangefile(e)}></input>
                    <div className='flex justify-center items-center text-xs font-bold pr-10 cursor-pointer' onClick={() => handleUpload("Add1")}>Choose file</div>
                    <div className='text-xs flex justify-center items-center ' >{photos.Photo1}</div>
                </div>
				<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.photos}</p>
                <p className='text-sm font-bold'>Other photos.</p>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex   pl-3  left-shadow mb-3 '>
                    <input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo2" id="Add2" onChange={e => handlechangefile(e)}></input>
                    <div className='flex justify-center items-center text-xs font-bold pr-10 cursor-pointer' onClick={() => handleUpload("Add2")}>Choose file</div>
                    <div className='text-xs flex justify-center items-center '  >{photos.Photo2}</div>
                </div>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex    pl-3  left-shadow mb-3 '>
                    <input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo3" id='Add3' onChange={e => handlechangefile(e)}></input>
                    <div className='flex justify-center items-center text-xs font-bold pr-10 cursor-pointer' onClick={() => handleUpload("Add3")}>Choose file</div>
                    <div className='text-xs flex justify-center items-center '  >{photos.Photo3}</div>
                </div>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex    pl-3  left-shadow mb-3 '>
                    <input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo4" id='Add4' onChange={e => handlechangefile(e)}></input>
                    <div className='flex justify-center items-center text-xs font-bold pr-10 cursor-pointer' onClick={() => handleUpload("Add4")}>Choose file</div>
                    <div className='text-xs flex justify-center items-center '  >{photos.Photo4}</div>
                </div>
                <div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex    pl-3  left-shadow mb-3 '>
                    <input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo5" id='Add5' onChange={e => handlechangefile(e)}></input>
                    <div  className='flex justify-center items-center text-xs font-bold pr-10 cursor-pointer' onClick={() => handleUpload("Add5")}>Choose file</div>
                    <div className='text-xs flex justify-center items-center '  >{photos.Photo5}</div>
                </div>
                <button className='w-[350px] h-[35px] text-sm font-bold' onClick={redirect}>Let's start</button>
            </div>
            <div className='w-[250px] h-[400px] sm:w-[500px] sm:h-[700px] lg:w-[50%] lg:h-full flex justify-center items-center Box relative mb-[100px] lg:mb-0'>
				<div className='w-full h-full bg-indigo-600 opacity-50 absolute '></div>
				<div className='z-10 max-w-[200px] sm:max-w-[250px] text-center'>
					<h1 className=' text-white font-bold mb-8'> Shop With Confidence </h1>
					<h1 className='text-xs text-white '> Browse a catalog of ecommerce services by our vetted experts or submit custom request</h1>
				</div>	
			</div>
        </div>

    </div>
  )
}

export default Registration