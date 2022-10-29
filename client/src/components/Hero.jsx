import React from 'react'
import ss from '../assets/ss.svg'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faPerson} from '@fortawesome/free-solid-svg-icons'
import {faUsers} from '@fortawesome/free-solid-svg-icons'
import {faPersonDress} from '@fortawesome/free-solid-svg-icons'


const Hero = () => {
  return (
    <div className=' h-auto bg-zinc-100 flex flex-col px-[15%] pt-[140px] pb-20 '>
        <div className='flex flex-col md:flex-row  w-full mb-[100px]'>
            <div className='mb-[70px] md:mb-[0px] md:w-[50%] md:max-w-1/2 flex flex-col items-center md:items-start'>
                <div className='mb-[30px] '>
                    <h1 className='text-5xl md:text-3xl lg:text-5xl font-bold mb-[20px] '>Connecting with </h1>
                    <h1 className='text-5xl md:text-3xl lg:text-5xl font-bold'>your customers</h1>
                </div>
                <div className='text-zinc-300 max-w-[370px] md:max-w-[280px] lg:max-w-[370px] mb-[40px] '>
                    <h1 className='text-[0.9rem] lg:text-sm '>Deliver great experiences, no matter what. We can help with scale messaging for sales, marketing, and support</h1>
                </div>
                <div className='w-full max-w-[370px] md:max-w-[280px] lg:max-w-[370px] bg-white border border-white rounded-xl h-[50px] flex justify-between py-2 px-2'>
                    <input type="text" placeholder='Enter email' className='w-[65%] outline-none'/>
                    <button className='text-sm w-[30%] rounded-xl'>submit</button>
                </div>
            </div>
            <div className='md:w-[50%] flex justify-center items-center '>
                <div className='max-w-[350px] md:max-w-[250px] lg:max-w-[350px]'>
                    <img src={ss} alt="ss"/>
                </div>
            </div>
        </div>
        <div className='w-full flex flex-col md:flex-row justify-between items-center'>
            <div className='px-8 md:px-0 mb-10 md:mb-0 md:w-[23%] rounded-2xl  bg-white flex flex-col justify-center items-center py-7'>
				<h1 className='text-indigo-600 mb-2'><FontAwesomeIcon icon={faUsers}  size='2x'/></h1>
                <h1 className='font-bold mb-3'>584</h1>
                <h1 className='font-bold '>Total Member</h1>
            </div>
            <div className='px-16 md:px-0 mb-10 md:mb-0 md:w-[23%] rounded-2xl  bg-white flex flex-col justify-center items-center py-7'>
				<h1 className='text-indigo-600 mb-2'><FontAwesomeIcon icon={faPerson}  size='2x'/></h1>
                <h1 className='font-bold mb-3'>291</h1>
                <h1 className='font-bold '>Men</h1>
            </div>
            <div className='px-14 md:px-0  md:w-[23%] rounded-2xl  bg-white flex flex-col justify-center items-center py-7'>
				<h1 className='text-indigo-600 mb-2'><FontAwesomeIcon icon={faPersonDress}  size='2x'/></h1>
                <h1 className='font-bold mb-3'>293</h1>
                <h1 className='font-bold '>Women</h1>
            </div>
        </div>
        
    </div>
  )
}

export default Hero