import React from 'react'
import { useEffect } from 'react'
import getInstance, { socket } from './instances/help2'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { getUserData } from './redux/reducers/userSlice'


const Messages = () => {
    const token = localStorage.getItem('authToken');
	const [users, setUsers] = useState([]);
	const [trans, setTrans] = useState(false);
	const [chat, setChat] = useState({})
	const [show, setShow] = useState(false);
	const [message, setMessage] = useState("");
	const [allMessages, setAllMessages] = useState([]);
	const {userId} = useSelector(getUserData);


	const toChat = async (element) => {
		setTrans(!trans)
		setChat(element);
		const res = await getInstance(token).post("/conversations/messages", {
			receiver: element.id,
		});
		if (res.data.message?.emptyCnv)
			setAllMessages([]);
		else
			setAllMessages(res.data?.conversation?.messages);
			
		setTimeout(() => {
			setShow(!show)
		}, 500)
		
	}

	const toBefore = () => {
		setShow(!show)
		setTrans(!trans)
	}

	const changeValue = (e) => {
		setMessage(e.target.value);
	}	

	const sendMessage = async () => {
		setAllMessages(prev => prev.concat({
			receiver_id : chat.id,
			sender_id : userId,
			messages : message.trim()
		}) )
		await getInstance(token).post("/storeConversations/storeMessage", {
			receiver: chat.id,
			message: message.trim()
		})
		
		const value = {
			receiver_id: chat.id.toString(),
			messages: message.trim(),
			sender_id: userId.toString(),
			reciverUsername: chat.user_name
		}
		socket.emit('newMsg', value);
		setMessage("");
	}
	useEffect(() => {
		socket.on("msgRec", (data) => {
			if(data && Number(data.sender_id) === chat.id)
			{
				setAllMessages(prev => prev.concat({
					receiver_id : data.receiver_id,
					sender_id : data.sender_id,
					messages : data.messages.trim()
				}))
			}
		})
		
	}, [chat])

    useEffect(() => {
        const getMessage = async () => {
            const res = await getInstance(token).get("/getConnectedUsers");
			if(res.data.connectedUsers !== "No matched Users")
            	setUsers(res.data.connectedUsers);
			else
				setUsers([]);
        }
        getMessage();
		// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

	const map = 
	<div className={`w-full flex flex-col items-center justify-between space-y-4  + ${trans ? 'Tran' : ''}`} key="map">
		{users.map((element, id) => {
			return(
				<div className='min-w-[250px] xs:min-w-[350px] p-2 xs:p-4 flex bg-white rounded-xl items-center  cursor-pointer hover:bg-indigo-600 hover:text-white transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300' onClick={() => toChat(element)} key={id}>
					<img alt="img" src={element.profile_img} className="border rounded-full mr-5 w-9 h-9 xs:w-12 xs:h-12"></img>
					<h1 className='text-[0.8rem] xs:text-sm  font-bold'>{element.user_name}</h1>
				</div>
		)})}
	</div>

	const mapMsg = 
	<div className='h-[85%] w-full  gap-3 flex  overflow-y-scroll flex-col-reverse'>
		{allMessages.map((item, id) => {
			return(
				<div className={chat.id !== parseInt(allMessages[allMessages.length - (id + 1)].sender_id) ? 'w-full flex justify-end' : "w-full flex justify-start"} key={id}>
					<div className={chat.id !== parseInt(allMessages[allMessages.length - (id + 1)].sender_id) ? 'max-w-[85%] bg-indigo-400 rounded-xl flex  p-2 text-white' : "max-w-[85%] bg-gray-400 rounded-xl flex p-2 text-white"} >
						<h1 className='text-sm '>{allMessages[allMessages.length - (id + 1)].messages}</h1>
					</div>
				</div>
			)})}
	</div>
  return (
    <div className='w-full pt-52 px-[5%] md:px-[15%] flex flex-col items-center space-y-10'>
        <h1 className='text-4xl font-bold'>Chat.</h1>
			{!show ?  [map] :
			<div className={trans ? 'flex flex-col space-y-4' : "hidden"}>
				<div className='min-w-[250px] xs:min-w-[350px] p-2 xs:p-4 flex bg-white rounded-xl items-center'>
					<FontAwesomeIcon icon={faChevronLeft} size="2x" className='py-1 px-2 text-gray-600 xs:mr-3 cursor-pointer' onClick={toBefore}/>
					<img alt="img" src={chat.profile_img} className="border rounded-full mr-5 w-12 h-12"></img>
					<h1 className='text-sm text-black font-bold'>{chat.user_name}</h1>
				</div>
				<div className='w-[250px] xs:w-[350px] rounded-xl  h-[500px] bg-white p-3 flex flex-col justify-between space-y-3'> 
					{mapMsg}
					<div className='h-[15%]  bg-gray-50 rounded-3xl p-3 flex justify-between items-center'>
						<input name="message" type="text" placeholder='Type something ...' className='w-[85%] h-full bg-transparent outline-none  placeholder:text-[1rem] placeholder:font-serif text-gray-500' value={message} onChange={e => changeValue(e)}/>
						<FontAwesomeIcon icon={faPaperPlane} style={{fontSize : '1.5em'}} className='p-2 bg-white rounded-full text-indigo-600 cursor-pointer' onClick={sendMessage} />
					</div>
				</div>
			</div>}
		
    </div>
  )
}

export default Messages