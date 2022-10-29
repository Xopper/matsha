import React from 'react'
import Navbar2 from '../components/Navbar2'
import Footer from '../components/Footer'
import Filter from '../components/Filter'
import { useEffect } from 'react'
import swal from 'sweetalert'
import { getWarn } from '../components/redux/reducers/WarnSlice'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { addWarn } from '../components/redux/reducers/WarnSlice'

const Search = () => {
	const warn = useSelector(getWarn);
	const dispatch = useDispatch();
	const blocked = () => { 
		swal({
			title: "YAAAAAP",
			text: `You have blocked ${warn.username} `,
			icon: "success",
			button: "close"
		})
	}
	const alr = () => {
		swal({
			title: "NOOOOP",
			text: `${warn.username} is Blocked`,
			icon: "warning",
			button: "close"
		})
	}
	useEffect(() => {
		if (warn.warn !== "nothing") {
			if (warn.warn === "just blocked") {
				blocked()
			}
			if (warn.warn === "already blocked") {
				alr()
			}
			dispatch(addWarn({warn : "nothing", username : "no one"}))
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
  return (
    <>
        <div className=" h-auto md:h-screen flex flex-col justify-between bg-zinc-100">
				<div className=' w-screen bg-zinc-100 overflow-y-auto'>
                	<Navbar2 />
					<Filter />
				</div>
				<Footer />
			</div>
    </>
  )
}

export default Search