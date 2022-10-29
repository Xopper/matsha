import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from './instances/helpaxios';
import swal from 'sweetalert';
import { useEffect } from 'react';

const ResitIt = ({username}) => {
	const initialvalue = {
		userName: username,
		newPassword: "",
		confNewPassword: "",
	}
	const [infos, setInfos] = useState(initialvalue);
	const navigate = useNavigate();
	const [errors, setErrors] = useState({})

	const handleChange = (e, num) => {
		if (num === 1)
			setInfos({...infos, newPassword: e.target.value});
		if (num === 2)
			setInfos({...infos, confNewPassword: e.target.value});
	}

	const changePassword = async () => {
		if (username === "")
		{
			console.log("idek fih ");
			swal({
				title: "OOOps!!",
				text: "Something went wrong please try again",
				icon: "error",
				buttons: "close"
			})
			navigate("/auth");
		}
		const error = {};
		const res = await instance.post("resetPassword/resetPasswordValidation", {
			...infos,
		})
		if (res.data.status !== 0) {
			if (res.data.errors.newPassword) error.newPassword =  res.data.errors.newPassword;
			if (res.data.errors.confPwdErr)	error.confPwdErr = res.data.errors.confPwdErr;
			setErrors(error);
		}
		else {
			setErrors(error);
			swal({
				title: "Cool",
				text: "Your Password has been Updated Successfully",
				icon: "success",
				buttons: "close"
			})
			navigate("/auth");
		}
	}

	useEffect(() => {
		setInfos({...infos, userName: username});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [username])

  return (
    <div className='h-auto lg:h-screen w-screen bg-zinc-100  px-[15%] py-[140px] overflow-y-auto ' >
			<div className='w-full h-full flex flex-col justify-center items-center lg:flex-row'>
				<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first'>
					<h1 className='text-xl font-bold mb-3'>Reset Password !</h1>
					<h1 className='text-xs mb-6'>Please Enter Your New Password.</h1>
					<div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center px-3  left-shadow '>
						<input type="password" name="password" placeholder='New Password' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={infos.newPassword} onChange={(e) => handleChange(e, 1)}></input>
					</div>
					<p   className='text-red-600 text-xs mb-6 ml-3 '>{errors.newPassword}</p>
					<div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center px-3  left-shadow'>
						<input type="password" name="confirmPassword" placeholder='New Password' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={infos.confNewPassword} onChange={(e) => handleChange(e, 2)}></input>
					</div>
					<p   className='text-red-600 text-xs mb-6 ml-3 '>{errors.confPwdErr}</p>
					<div className='w-[350px] flex justify-end mb-5'>
						<button className='py-1 px-3' onClick={changePassword}>Change Password</button>
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
  )
}

export default ResitIt