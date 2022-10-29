import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';


const Down = ( {name} ) => {
	const [down, setDown] = useState(true);

	useEffect(() => {
		window.addEventListener('scroll', () => {
			if (window.scrollY < (window.innerHeight / 2)) {
				setDown(true);
			}
			else {
				setDown(false);
			}
		})
	}, [])
    const scroll = () => {
		window.scrollTo({
			top : (window.innerHeight - 20),
			behavior: 'smooth',
		});
	} 
  return (
    <div className={!down ? 'hidden' : ' fixed bottom-0 right-0 mr-[10px] mb-[34px] py-2  px-2 bg-indigo-600 flex lg:hidden justify-center items-center rounded-md cursor-pointer '} onClick={scroll}>
        <h1 className='text-xs font-bold text-white mr-2'>{name}</h1>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white animate-bounce" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
    </div>
  )
}

export default Down