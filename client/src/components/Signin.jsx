import {React, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import instance from './instances/helpaxios';
import swal from 'sweetalert';
// import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css"


const Signin = () => {
	const initialvalues = {username: "", password: ""};
	const [formValues, setFormValues] = useState(initialvalues);
	const [formErrors, setFormErrors] = useState({});
	const navigate = useNavigate();

	const handlechange = (e) => {
		const {name, value} = e.target;
		setFormValues({...formValues, [name] : value})
	}

	const handleclick = async () => {
		const er = validate(formValues);
		if (er) {
			setFormErrors(er);
		}
		else {
			send_to_back(formValues);
		}
	}

	const send_to_back = async (values) => {
		const errors = {};
		const res = await instance.post("/authLogin/validate/login", {
			...values,
		})
		if (res.data.status !== 0)
		{
			if (res.data.errors.userNameOrPasswordError && res.data.errors.userNameOrPasswordError.substr(0,6) !== "Verify")
			{
				errors.username = res.data.errors.userNameOrPasswordError;
				errors.password = res.data.errors.userNameOrPasswordError;
			}
			else if (res.data.errors.userNameOrPasswordError) {
				swal({
					title : "Error",
					text : "Verify your account via the link sent to your registration email",
					icon : "error",
					button : "close",
				})
			}
			if (res.data.errors.username) {
				errors.username = res.data.errors.username;
			}
			if (res.data.errors.password) {
				errors.password = res.data.errors.password;
			}
			setFormErrors(errors);
		}
		else {
			// toast.success('signed in successfully!', {
			// 	position: "top-right",
			// 	autoClose: 2000,
			// 	hideProgressBar: false,
			// 	closeOnClick: true,
			// 	pauseOnHover: true,
			// 	draggable: true,

			// 	});
			
			localStorage.setItem('authToken', res.data.authToken);
			if (res.data.dataProfileIsComplited === 0) {
				navigate("/init");
			}
			else {
				navigate("/account");
			}
		}
	}

	const validate =  (value) => {
		const errors = {};
		if (!value.username) {
			errors.username = "username is required!";
		}
		if (!value.password) {
			errors.password = "password is required!";
		}

		if (value.username && value.password) {
			return false;
		}
		return errors;
	}


	return (
		<>
		<div className='h-auto lg:h-screen w-screen bg-zinc-100  px-[15%] py-[140px] overflow-y-auto ' >
			<div className='w-full h-full flex flex-col justify-center items-center lg:flex-row'>
				<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first '>
					<h1 className=' text-2xl font-bold mb-3'>Sign in.</h1>
					<div className='max-w-[250px] sm:max-w-[350px] mb-6'>
						<h1 className='text-xs '>There Are No Limits To What We Can Accomplish, Except The Limits You Place On Your Own Thinking.</h1>
					</div>
					<h1 className='text-sm font-bold mb-1'>Username.</h1>
					<div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3  left-shadow'>
						<input type="text" name="username" placeholder='username to connect' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.username} onChange={handlechange}></input>
					</div>
					<p className='text-red-600 ml-3 text-[0.7rem] font-bold '>{formErrors.username}</p>
					<h1 className='text-sm font-bold mb-1 mt-6'>Password.</h1>
					<div className='max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3  left-shadow'>
						<input type="password" name="password" placeholder='at least 8 characters' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.password} onChange={handlechange}></input>
					</div>
					<p className='text-red-600 ml-3 text-[0.7rem] font-bold'>{formErrors.password}</p>
					<div className='w-[250px] sm:w-[350px]  grid justify-items-end mt-6'>
						<h1 className='text-xs font-bold italic mb-2 cursor-pointer' onClick={() => navigate("/resetPassword/confirmEmail")}>forget password?</h1>
					</div>
					<button className='w-[250px] sm:w-[350px] h-[30px] text-xs font-bold' onClick={handleclick}>Login in</button>
					
				</div>
				<div className='w-[250px] h-[400px] sm:w-[500px] sm:h-[700px] lg:w-[50%] lg:h-full flex justify-center items-center Box relative mb-[100px] lg:mb-0'>
					<div className='w-full h-full bg-indigo-600 opacity-50 absolute '></div>
					<div className='z-10 max-w-[200px] sm:max-w-[250px] text-center'>
						<h1 className=' text-white font-bold mb-8'> Shop With Confidence </h1>
						<h1 className='text-xs text-white '> Browse a catalog of ecommerce services by our vetted experts or submit custom request</h1>
					</div>
				</div>
			</div>
			{/* <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover /> */}
		</div>
		</>
	)
}

export default Signin