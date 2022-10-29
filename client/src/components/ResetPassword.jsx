import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import swal from 'sweetalert';
import instance from './instances/helpaxios';

const ResetPassword = () => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();

	const sendemail = async () => {
		const res = await instance.post("/forgetPwdEmailChecker/emailchecker", {
			email,
		})
		if (res.data.status === 1)
		{
			swal({
				title: "Noooooop!!!",
				text: res.data.errors.email,
				icon: "error",
				buttons: "close"
			})
		}
		else {
			swal({
				title:"Coool!",
				text:"Please check your e-mail to reset your account!",
				icon: "success",
				buttons: "close",
			})
			navigate("/auth")
		}
	}

	return (
		<>
		<div className='h-auto lg:h-screen w-screen bg-zinc-100  px-[15%] py-[140px] overflow-y-auto ' >
			<div className='w-full h-full flex flex-col justify-center items-center lg:flex-row'>
				<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first'>
					<h1 className='text-xl font-bold mb-3'>Forgotten Your Password?</h1>
					<div className='max-w-[250px] sm:max-w-[350px] mb-6'>
						<h1 className='text-xs '>Enter the email address you used when you joined and we'll send you instructions to reset your password.</h1>
					</div>
					<div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center px-3  left-shadow mb-8'>
						<input type="text" name="email" placeholder='Please enter your email' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={email} onChange={(e) => setEmail(e.target.value)}></input>
					</div>
					<div className='w-[350px] flex justify-end mb-5'>
						<button className='py-1 px-3' onClick={sendemail}>send Reset Instructions</button>
					</div>
					<h1 className='text-xs font-bold'>Just remembered? <span className='text-indigo-600 cursor-pointer' onClick={() => navigate("/auth")}>log in</span></h1>
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

		</>
	)
}

export default ResetPassword