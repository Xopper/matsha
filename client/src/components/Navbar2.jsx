import React from 'react'
// import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTrashArrowUp} from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faEarthEurope } from '@fortawesome/free-solid-svg-icons';
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {MenuIcon, XIcon, ChevronLeftIcon} from '@heroicons/react/outline'
import { useEffect } from 'react';
import { socket } from './instances/help2';

const Navbar2 = () => {
    const [icon, setIcon] = useState(false)
    const [menu, setMenu] = useState(0)
    const [notif, setNotif] = useState(0)
	const handleClick = () => {            
        if (menu === 2 || menu === 0)
            setMenu(1)
        else setMenu(0)
    }
    
	const showdrop = (e) =>{
        if (e.icon === faGear) setIcon(!icon)
        else if(e.icon === faRightFromBracket) {
            localStorage.removeItem('authToken');
            navigate("/auth")
        }
        else navigate(e.path)
    }
    const navigate = useNavigate();
    const redirectpath = (e) => {
        navigate(e.path)
    }
    const redirectMini = (e) => {
        if (e.icon === faGear) {
            setMenu(2)
        }
        else if(e.icon === faRightFromBracket) {
            localStorage.removeItem('authToken');
            navigate("/auth")
        }
        else navigate(e.path) 
    }

    useEffect(() => {
        socket.on("viewd_profile", (data) => {
            if (data === true)
            setNotif(pre => pre + 1)
        })
    }, [])

    const links = [
        {name : "Trash", icon : faTrashArrowUp  , path : "/blockedAccounts"},
        {name : "Profile", icon : faUser  , path : "/Profile"},
        {name : "Search", icon : faEarthEurope  , path : "/Search"},
        {name : "Last Visited", icon : faClockRotateLeft  , path : "/LastViseted"},
        {name : "Messages", icon : faCommentDots  , path : "/chat"},
        {name : "Notifications", icon : faBell  , path : "/Notifications"},
        {name : "Settings", icon : faGear  , path : ""},
        {name : "Loug out", icon : faRightFromBracket  , path : ""},
    ]
    const params = [
        {name: "Edit Infos", path : "/account"},
        {name: "Edit Preferences", path : "/account/preferences"},
        {name: "Edit Password", path : "/account/password"},
        {name: "Edit Photos", path : "/account/gallery"},
    ]

 

    const map = 
        <div className='hidden xs:flex justif-center items-center space-x-2'>
            {links.map((tg, id) => {
                return (
                    <div className='text-indigo-600 relative py-1 px-2 rounded-full bg-white cursor-pointer hover:bg-gray-200'   key={id} onClick={() => showdrop(tg)}>
                        <FontAwesomeIcon icon={tg.icon} size="1x" />
                       { tg.name === "Notifications" && notif !== 0 && <div className="inline-flex absolute -top-2 -right-2 justify-center items-center w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900">{notif}</div>}
                    </div>
                )
            })}
            
        </div>
    const map2 = 
        <div className={!icon ? 'hidden' : 'absolute px-4 py-4 hidden xs:flex flex-col bg-white  drop-shadow-lg right-0 w-60 mr-[15%] rounded-md'}>
            {params.map((tg, id) => {
                 return(
                     <div className='w-full hover:bg-gray-100 py-2 cursor-pointer hover:text-indigo-600  rounded-md' key={id}  onClick={() => redirectpath(tg)}>
                         <h1 className='ml-2 text-xs text-gray200 '>{tg.name}</h1>
                     </div>
            )})}
        </div>
    const minimap =
        <div className={menu === 1 ? 'space-y-3 absolute w-full px-8 flex flex-col xs:hidden bg-zinc-100 py-8 drop-shadow-lg' : 'hidden'}>
            {links.map((element, id) => {
                return(
                    <button key={id} className='border bg-zinc-100  text-black py-3 px-8 flex justify-center items-center hover:bg-zinc-200 font-bold' onClick={() => redirectMini(element)}>{element.name}</button>
                )})}
        </div>
    const minimap2 = 
    <div className={menu === 2 ? 'space-y-3 absolute w-full px-8 flex flex-col xs:hidden bg-zinc-100 py-8 drop-shadow-lg' : 'hidden'}>
        {params.map((element, id) => {
            return (
                <button key={id} className='border bg-zinc-100  text-black py-3 px-8 flex justify-center items-center hover:bg-zinc-200 font-bold' onClick={() => redirectpath(element)}>{element.name}</button>
            )
        })}
    </div>
  return (
        <div className='w-screen h-[80px] z-20 fixed '>
            <div className='w-full h-full bg-zinc-100 drop-shadow-lg flex justify-between items-center px-[5%] md:px-[15%]'>
                <h1 className='text-black font-bold text-2xl sm:text-3xl xs:text-3xl'><Link to="/">Matcha.</Link></h1>
                {map}
                <div className='flex xs:hidden' onClick={handleClick}>
                    {menu === 0 ?  <MenuIcon className='w-5' /> : ''}
                    {menu === 1 ?  <XIcon className='w-5'/> : ''}
                    {menu === 2 ?  <ChevronLeftIcon className='w-5'/> : ''}
                </div>
            </div>
            {minimap}
            {minimap2}
            {map2}
        </div>
  )
}

export default Navbar2