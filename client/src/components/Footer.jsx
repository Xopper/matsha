import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faHeart} from '@fortawesome/free-solid-svg-icons'

const Footer = () => {
  return (
    <div className='h-[40px] flex justify-center items-center bg-zinc-100 mt-10'>
        <h1 className='text-sm text-zinc-400'>Made with <span className='text-red-600'><FontAwesomeIcon icon={faHeart} size='1x'/></span> by <span className='text-zinc-500 font-bold'>HIANTRIN</span> & <span className='text-zinc-500 font-bold'>AHALOUA</span></h1>
    </div>
  )
}

export default Footer