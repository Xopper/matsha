import axios from "axios";
import { io } from "socket.io-client";
 

	const getInstance= (tok) =>  axios.create({
			baseURL: 'http://localhost:5000',
			headers: {  Authorization: `Bearer ${tok}` }
		});

export default getInstance;

const socket = io("http://localhost:5000");

export {socket}