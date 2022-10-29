import {React, useState} from 'react'
import swal from 'sweetalert';
import instance from './instances/helpaxios.jsx'
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const initialvalues = {firstname: "", lastname: "", username: "", email: "", password: ""};
    const [formValues, setFormValues] = useState(initialvalues);
    const [formErrors, setFormErrors] = useState({});
	const navigate = useNavigate()

    const handlechange = (e) => {
        const { name, value } = e.target;
        setFormValues({...formValues, [name]: value });
    }

    const handleclick = (e) => {
		const err = validate(formValues)
		if (err) {
			setFormErrors(err)
		}
		else {
			send_to_back(formValues)
		}
		
    }

	const send_to_back = async (values) => {
		const errors = {}
		const res =  await instance.post("/auth/validate/register", {
			email : values.email,
			username : values.username,
			lastName : values.lastname,
			firstName : values.firstname,
			password: values.password,

		})
		if (res.data.status !== 0)
		{
			if (res.data.errors.username) {
				errors.username = res.data.errors.username;
			}
			if (res.data.errors.email) {
				errors.email = res.data.errors.email;
			}
			if (res.data.errors.lastName) {
				errors.lastname = res.data.errors.lastName;
			}
			if (res.data.errors.password) {
				errors.password = res.data.errors.password;
			}
			if (res.data.errors.firstName) {
				errors.firstname = res.data.errors.firstName;
			}
			setFormErrors(errors);
		}
		else
		{
			setFormErrors({});
			swal({
				title : "Cool", 
				text : "Please check your e-mail to verify your account",
				icon: "success",
				button : "close",
			});
			setTimeout(() => {
				navigate("/auth")
			}, 2000)
			
		}
	}

    const validate =  (values) => {
        const errors= {};
        const regex = /^([a-zA-Z._0-9-]+)@([a-zA-Z0-9]+[.]?)*([a-zA-Z0-9])(\.[a-zA-Z]{2,4})$/i;
        if (!values.firstname) {
            errors.firstname = "First name is required !"
        } else if (Object.keys(values.firstname).length < 3 ) {
            errors.firstname = "your first name must contain at least 3 characters"
        }
        if (!values.lastname) {
            errors.lastname = "last name is required!"
        } else if (Object.keys(values.lastname).length < 3 ) {
            errors.lastname = "your last name must contain at least 3 characters"
        }
        if (!values.username) {
            errors.username = "Username is required!";
        } else if (Object.keys(values.username).length < 3 ) {
            errors.username = "your username must contain at least 3 characters"
        }
        if (!values.email) {
            errors.email = "email name is required!"
        } else if (!regex.test(values.email) ) {
            errors.email = "This is not a valid email format!"
        }
        if (!values.password) {
            errors.password = "password  is required!"
        }else if (Object.keys(values.password).length < 5 ) {
            errors.password = "password must be more than 4 characters"
        }
        else if (Object.keys(values.password).length > 15 ) {
            errors.password = "password cannot exceed more than 15 characters"
        }
        if (Object.keys(errors).length === 0) {
            return false;
        }
        return errors;
    }
  return (
    <div className='h-auto lg:h-screen w-screen bg-zinc-100  px-[15%] py-[140px] overflow-y-auto ' >
			<div className='w-full h-full flex flex-col justify-center items-center lg:flex-row'>
				<div className='sm:w-[80%] h-full lg:w-[50%] flex flex-col justify-center items-center lg:items-start order-last lg:order-first '>
					<h1 className=' text-2xl font-bold mb-3'>Sign Up.</h1>
					<div className='max-w-[250px] sm:max-w-[350px] mb-6'>
						<h1 className='text-xs '>There Are No Limits To What We Can Accomplish, Except The Limits You Place On Your Own Thinking.</h1>
					</div>
					<h1 className='text-xs font-bold mb-1'>First name.</h1>
					<div className={Object.keys(formErrors).lenght === 0 ? 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 mb-6 left-shadow' : 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 left-shadow mb-0'}>
						<input type="text" name="firstname" placeholder='enter your first name' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.firstname} onChange={handlechange}></input>
					</div>
                    <p className='text-red-600 text-xs mb-4 ml-3 '>{formErrors.firstname}</p>
					<h1 className='text-xs font-bold mb-1'>Last name.</h1>
					<div className={Object.keys(formErrors).lenght === 0 ? 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 mb-6 left-shadow' : 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 left-shadow mb-0'}>
						<input type="text" name="lastname" placeholder='please enter your last name' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.lastname} onChange={handlechange}></input>
					</div>
                    <p className='text-red-600 text-xs mb-4 ml-3 '>{formErrors.lastname}</p>
                    <h1 className='text-xs font-bold mb-1'>Username.</h1>
					<div className={Object.keys(formErrors).lenght === 0 ? 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 mb-6 left-shadow' : 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 left-shadow mb-0'}>
						<input type="text" name="username" placeholder='username to connect' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.username} onChange={handlechange}></input>
					</div>
                    <p className='text-red-600 text-xs mb-4 ml-3 '>{formErrors.username}</p>
                    <h1 className='text-xs font-bold mb-1'>Your e-mail.</h1>
					<div className={Object.keys(formErrors).lenght === 0 ? 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 mb-6 left-shadow' : 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 left-shadow mb-0'}>
						<input type="text" name="email" placeholder='name@e-mail.com' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.email} onChange={handlechange}></input>
					</div>
                    <p className='text-red-600 text-xs mb-4 ml-3 '>{formErrors.email}</p>
                    <h1 className='text-xs font-bold mb-1'>Password.</h1>
					<div className={Object.keys(formErrors).lenght === 0 ? 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 mb-6 left-shadow' : 'max-w-[350px] h-[30px] rounded-xl bg-gray-200 flex justify-center pl-3 left-shadow mb-0'}>
						<input type="password" name="password" placeholder='at least 8 characters' className='w-[250px] sm:w-[350px] bg-transparent outline-none  placeholder:text-[0.7rem] font-bold' value={formValues.password} onChange={handlechange}></input>
					</div>
                    <p className='text-red-600 text-xs mb-4 ml-3 '>{formErrors.password}</p>
					<button className='w-[250px] sm:w-[350px] h-[30px] text-xs font-bold' onClick={handleclick}>Create Account</button>
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

export default Signup