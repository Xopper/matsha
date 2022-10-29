import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import getInstance from './instances/help2'
import swal from 'sweetalert'
import ModalImage from './ModalImage'


const Gallery = () => {
	
	const token = localStorage.getItem('authToken');
	const [gal, setGal] = useState("");
	const [visible, setVisible] = useState(false)
	const [photos, setPhotos] = useState({ imgs : [] });
	const [array, setArray] = useState([
		false,
		false,
		false,
		false,
		false,
	])

	useEffect(() => {
		const data = async () => {
			const res = await getInstance(token).get("/getPictures/pics");
			return res.data.userPics[0];
		}
		const getData = async() => {
			const img = await data();
			const image = Object.values(img)
			setPhotos({...photos, imgs : image});
			for (let i = 0; i < 5; i++) {
				if (Object.values(image[i]).length !== 0){
					array[i] = true;
				}
				else {
					array[i] = false;
				}
			}
		}
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const getPhotos = (index) => {
		const cnt = document.getElementById(index);
		cnt.click();
	}


	const convertBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const filereader = new FileReader();
			filereader.readAsDataURL(file);
			filereader.onload = () => {
				resolve(filereader.result);
			}
			filereader.onerror = (error) => {
				reject(error);
			}
		})
	}

	const handlechangefile = async (e, index) => {
		const File = e.target.files[0];
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
		const base = await convertBase64(File);
		const photo = photos.imgs;
		photo[index] = base;
		setPhotos({...photos, imgs : photo});
		const ar = array;
		ar[index] = true;
		setArray({...ar, ar});
	}

	const send_to_back = async () => {
		
		await getInstance(token).post("/editPics/editPicsValidator", {
			avatarSrc: photos.imgs[0],
			profilePic1: photos.imgs[1],
			profilePic2: photos.imgs[2],
			profilePic3: photos.imgs[3],
			profilePic4: photos.imgs[4]
		})
		
		swal({
			title: "Coooool",
			text : "Your images have been changed successfully",
			icon : "success",
			button : "close"
		})
	}

	const saveChanges = async () => {
		if (Object.values(photos.imgs[0]).length === 0) {
			swal({
				title: "Oooooops!!",
				text: "Please Add Your Primary Image",
				icon : "error",
				buttons: "close"
			})
		}
		else await send_to_back();
	}

	const deleteimg = (index) => {
		const img = photos.imgs;
		img[index] = "";
		array[index] = false;
		setPhotos({...photos, imgs : img});
	}

	const showimage = (image) => {
		setGal(image);
		setVisible(true);
		setGal(image);
	}

	const map =

		<div className='w-full xs:pr-[20px] flex flex-col xs:grid xs:grid-cols-2 justify-between items-center '>
		{photos.imgs.map((photo, i) => {
			return (
				<div className='mb-10 flex flex-col self-center' key={i}>
					<div className='w-[140px] h-[140px] border-dashed border-2 rounded border-indigo-600 shadow-xl bg-white flex justify-center items-center cursor-pointer transition 
					ease-in-out delay-150 hover:-translate-y-1 hover:scale-110  duration-300 mb-5 p-1'  >
						{array[i] === true ? <img src={photo} className="w-full h-full" alt="al" onClick={() => showimage(photo)}></img> :
						<div className={Object.values(photo).length === 0 ? 'w-[50%] h-[50%] rounded-full bg-indigo-600 flex justify-center items-center text-white' : 'hidden'}>
									<FontAwesomeIcon icon={faPlus} size="2x" onClick={() => getPhotos(i)}/>
						</div>
						}
					</div>
					<input type="file" className='justify-between text-xs font-bold cursor-pointer hidden' name="Photo5" id={i} onChange={e => handlechangefile(e, i)}></input>
					<button className={array[i] === true ? 'w-[140px] h-[30px] ' : 'hidden'} onClick={() => deleteimg(i)}> delete</button> 
				</div>
			)})}
		</div>

	return (
    	<>
			<div className='h-auto lg:h-screen w-screen bg-zinc-100 px-[15%] py-[140px] overflow-y-auto'>
        		<div className="h-full w-full flex flex-col lg:flex-row">
					<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first '>
                        <h1 className="text-2xl font-bold mb-10">Your Gallery.</h1>
						{map}
						<ModalImage visible={visible} setVisible={setVisible} imag={gal}/>
						<button className='w-[60%] h-[40px]' onClick={saveChanges}>Save changes</button>
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

export default Gallery