import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react'
import getInstance from './instances/help2'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';

const BlockedAccounts = () => {
    const token = localStorage.getItem('authToken');
	const [data, setData] = useState([]);

    useEffect(() => {
		const getBlocked = async () => {
			const res = await getInstance(token).get("/getBlockedProfiles/Bockedprofiles");
			setData(res.data.profileBlocked);
		}
		getBlocked();
		 // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

	const waitUnblock = async (username) => {
		const res = await getInstance(token).post("/unblock/unblockUser", {
			userName: username
		})
		return (res.data.status);
	}

	const unblock = async (username) => {
		const status = await waitUnblock(username);
		if (status === 0) {
			const d = data.filter((item) => item.username !== username);
			setData(d);
		}
		else {
			swal ({
				title: 'NOOOPE!',
				text: 'Something went wrong. Try Again!',
				icon: 'error',
				buttons : 'close'
			})
		}
	}

	const map =
	<div className='w-full flex flex-col items-center justify-between space-y-4 '>
		{data.map((element, id) => {
			return(
				<div className='min-w-[250px] xs:min-w-[350px] p-1 xs:p-4 flex bg-white rounded-xl items-center justify-between transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' key={id}>
					<div className='flex items-center justify-center'>
						<img alt="img" src={element.avatar} className="border rounded-full mr-5 w-12 h-12"></img>
						<h1 className='text-black font-bold text-xs  xs:text-sm'>{element.username}</h1>
					</div>
					<FontAwesomeIcon icon={faDeleteLeft} style={{fontSize : '1.4em'}} className="cursor-pointer text-red-600" onClick={() => unblock(element.username) } />
				</div>
		)})}
	</div>


	return (
		<div className='w-full pt-32 px-[5%] md:px-[15%] '>
			{map}
		</div>
  )
}

export default BlockedAccounts