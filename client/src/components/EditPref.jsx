import React from 'react'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import getInstance from './instances/help2'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import swal from 'sweetalert'

const EditPref = () => {
	const [infos, setInfos] = useState({});
	const array = [ "male", "female" ]
	const array2 = [ "male" , "female" , "bi"];
	const [visible, setVisible] = useState(false);
	const [visible2, setVisible2] = useState(false);
	const [tags, setTags] = useState("");
	const [errors, setErrors] = useState({})
	const [allTags, setAllTags] = useState([])


	const getit = async () => {
		const token = localStorage.getItem('authToken');
		const res = await getInstance(token).get("/getPreferences/prefs");
		return (res.data);
	}
	
	useEffect(() => {
		const getprefs = async () => {
			const res = await getit();
			const data = res.userPrefs;
			setAllTags(res.userTags);
			setInfos(() => { return {
				...data,
		 }});
		}
		getprefs();
	}, [])

	const handleit = (e) => {
		setInfos({...infos, gender: e.target.name});
		setVisible(false);
	}
	const handleit2 = (e) => {
		setInfos({...infos, sexual_preference: e.target.name});
		setVisible2(false);

	}

	const Compare = (tag) => {
        const number = allTags.length;
        for (let i = 0; i < number; i++) {
            if (allTags[i] === tag) {
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
        const number = allTags.length;
		const error = {};
        if (e.key === 'Enter' && tags && number < 5 && Compare(tags)) {
			allTags.push(tags)
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
		setAllTags(allTags.filter(item => item !== e));
        setTags("");
    }

	const redirect = async () => {
		const error = {};
		if (allTags.length === 0) {
			error.tags = "please add between 1 and 5 tags";
			setErrors(error);
		}
		else {
			const token = localStorage.getItem('authToken');
			const res = await getInstance(token).post("/editPrefs/prefsValidator", {
				gender: infos.gender,
				interests: infos.sexual_preference,
				tags: allTags,
			});
			if (res.data.status === 0)
			{
				swal({
					title: "Coooool!!",
					text: "Your Preferences has been changed successfully",
					icon: "success",
					buttons: "close"
				})
			}
			else
			{
				swal({
					title: "Ooooops!!",
					text: "Somethings go wrong Please Refresh and try again",
					icon: "warning",
					buttons: "close"
				})
			}
		}
	}

	const map = 
		<div className='w-[350px] h-auto flex flex-wrap max-w-[350px] absolute' >
			{array.map((ar, id) => {
				return (
					<input type="button" name={ar} className='w-full bg-zinc-100  h-[30px] drop-shadow-lg text-xs font-bold flex justify-center items-center hover:bg-zinc-200 cursor-pointer' 
                 	value={ar}  onClick={handleit} key={id}></input>
				)})}
		</div>
		const map2 =
			<div className='w-[350px] h-auto flex flex-wrap max-w-[350px] absolute'>
				{array2.map((ar, id) => {
					return (
						<input type="button" name={ar} className='w-full bg-zinc-100  h-[30px] drop-shadow-lg text-xs font-bold flex justify-center items-center hover:bg-zinc-200 cursor-pointer' 
                 		value={ar}  onClick={handleit2} key={id}></input>
					)})}
			</div>
		const maptag =
		<div className='w-full  h-auto flex flex-wrap max-w-[350px]' >
			{allTags.map((tg, i) => {
				return (
					<div className='w-auto py-2 px-2 bg-indigo-600 text-xs font-bold mr-2 mb-2 rounded-xl flex  justify-center items-center' key={i} >
						<h1 className='mr-1'>{tg}</h1>
						<FontAwesomeIcon icon={faCircleXmark}  size='1x' className='cursor-pointer' name={tg} onClick={() => deleteitem(tg)}/>
					</div>
			)})}
		</div>

	return (
    	<>
			<div className='h-auto lg:h-screen w-screen bg-zinc-100 px-[15%] py-[140px] overflow-y-auto'>
        		<div className="h-full w-full flex flex-col lg:flex-row">
					<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first '>
						<p className='text-sm font-bold'>Your Gender.</p>
						<div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-between items-center pl-3  left-shadow pr-3 ' onClick={() => { setVisible(!visible); setVisible2(false) }}>
							<h1 className='text-xs font-bold'>{infos.gender}</h1>
							<h1 className='text-black mb-2 text-xl '><FontAwesomeIcon icon={faChevronDown}  size='1x' className='mt-3 mr-4'/></h1>
						</div>
						<div className={visible ? 'flex z-10 w-full  max-w-[350px] h-auto  relative' : 'hidden z-10'}>
                    		{map}
                		</div>
						<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.Gender}</p>
						<p className='text-sm font-bold'>Your Interest.</p>
						<div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-between items-center pl-3  left-shadow pr-3 ' onClick={() => { setVisible2(!visible2); setVisible(false)}}>
							<h1 className='text-xs font-bold'>{infos.sexual_preference}</h1>
							<h1 className='text-black mb-2 text-xl '><FontAwesomeIcon icon={faChevronDown}  size='1x' className='mt-3 mr-4'/></h1>
						</div>
						<div className={visible2 ? 'flex z-10 w-full  max-w-[350px] h-auto  relative' : 'hidden z-10'}>
                    		{map2}
                		</div>
						<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.Interests}</p>
						<p className='text-sm font-bold'>Your Tags.</p>
                		<div className='w-full max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex  pl-3 pr-4 left-shadow '>
                    		<input type="text" name="tags" placeholder='Press Enter to Add tags' className='w-[250px] sm:w-[350px] bg-transparent outline-none placeholder:text-[0.7rem] text-sm pr-4 font-bold ' value={tags} onChange={handletags} onKeyDown={Pressenter}></input>
                		</div>
						<p className='text-xs font-bold text-red-600 mb-3 ml-3'>{errors.tags}</p>
                		<div className='w-full h-auto max-w-[350px]'>
                    		{maptag}
                		</div>
						<button className='w-[80%] xs:w-[350px] h-[35px] text-sm font-bold mt-6' onClick={redirect}>Save Changes</button>
					</div>
					<div className='w-[250px] h-[400px] sm:w-[500px] sm:h-[700px] lg:w-[50%] lg:h-full flex justify-center items-center Box2 relative mb-[100px] lg:mb-0 self-center'>
						<div className='w-full h-full bg-indigo-600 opacity-50 absolute '></div>
						<div className='z-10 max-w-[200px] sm:max-w-[250px] text-center'>
							<h1 className=' text-white font-bold mb-8'> Shop With Confidence </h1>
							<h1 className='text-xs text-white '> Browse a catalog of ecommerce services by our vetted experts or submit custom request</h1>
						</div>	
					</div>
				</div>
    		</div>

    	</>
  )
}

export default EditPref