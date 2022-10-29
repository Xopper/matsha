import React from "react";
import Home from "./Pages/Home";
import Auth from "./Pages/Auth";
import Register from "./Pages/Register";
import Init from "./Pages/init";
import Account from "./Pages/Account";
import Confirm from "./components/Confirm";
import PrivateRoutes from "./components/privateRoutes/PrivateRoutes";
import Loading from "./components/Loading/Loading";
import { useState, useEffect } from "react";
import { CheckAuth } from "./components/Auth";
import getInstance, { socket } from "./components/instances/help2";
import { addUserData } from "./components/redux/reducers/userSlice";
import { useDispatch } from 'react-redux';
import EditPreferences from "./Pages/EditPreferences";
import Visited from "./Pages/Visited";
import Password from "./Pages/Password";
import Reset from "./Pages/Reset";



import {
  Routes,
  Route,
  useLocation,
  Outlet,
  Navigate
} from "react-router-dom";
import PublicRoutes from "./components/publicRoutes/PublicRoutes";
import Error404 from "./Pages/404";
import EditPass from "./Pages/EditPass";
import EditPhotos from "./Pages/EditPhotos";
import Profile from "./Pages/Profile";
import Search from "./Pages/Search";
import UserProfile from "./Pages/UserProfile";
import Notifacation from "./Pages/Notifacation";
import Blocked from "./Pages/Blocked";
import Chat from "./Pages/Chat";


function App() {
  
  const [auth, setAuth] = useState(null);
  const [complited, setComplited] = useState(true);
  const [isloading, setIsloading] = useState(false);
  const [userName, setUserName] = useState("")
  const location = useLocation();
  

  const dispatch = useDispatch();

  const fix_date = (date) => {
    const mp = [date.substr(0, 4) , date.substr(5, 2), date.substr(8, 2)];			
    return mp.join('-');
  }

  
  useEffect(() => {
      if (userName){
        socket.emit("usersConnected", userName)
      }
  }, [userName])
  
  useEffect(() => {
    setIsloading(true);
    const getdata = async (id) => {
      const token = localStorage.getItem('authToken');
      const {data : {userInfos}} = await getInstance(token).get('/getInfos/infos');
      setUserName(userInfos[0].username)
      userInfos[0].birthDay = fix_date(userInfos[0].birthDay.substr(0, 10));
      userInfos[0].userId = id
      dispatch(addUserData(userInfos[0]));
    }

    const check = async () => {
        const res = await CheckAuth();
        setAuth(res.status ? 'success' : 'failed');
      if (res.status) setComplited(res.complited);
        if (res.status) await getdata(res.userId);
        setTimeout(() => {
            setIsloading(false);
        }, 500)
        
    }
    check();
   
  },[location, dispatch])
  if (isloading)
      return <Loading />;

  const PrivateInit = () => {
    return complited  ? <Navigate to="/account" /> : <Outlet/>
  }
  return (
    <Routes>
      <Route path='/' element={<Home />}></Route>
      <Route path="/" element={<PrivateInit/>}>
        <Route path='init' element={<Init />}/>
      </Route>
      <Route path="/" element={<PrivateRoutes auth={auth} success={complited}/>}>
        <Route path='account' element={<Account />}/>
        <Route path='auth/confirm/:slug' element={<Confirm />}/>
        <Route path='user/:slug' element={<UserProfile />}/>
        <Route path="account/password" element={<EditPass />}/>
        <Route path="/account/preferences" element={<EditPreferences /> } />
        <Route path="/account/gallery" element={<EditPhotos />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Search" element={<Search />} />
        <Route path="/LastViseted" element={<Visited />} />
        <Route path="/Notifications" element={<Notifacation />} />
        <Route path="/blockedAccounts" element={<Blocked />} />
        <Route path="/chat" element={<Chat />} />
      </Route>
      <Route path='/' element={<PublicRoutes auth={auth} />}>
        <Route path='/auth' element={<Auth />}></Route>
        <Route path='/auth/register' element={<Register />}/>
        <Route path='/resetPassword/confirmEmail' element={<Password />}/>
        <Route path='/resetPassword/reset/:slug' element={<Reset />}/>
      </Route>
      <Route path="*" element={<Error404 />}/>
		</Routes>
  );
}

// function App() {
//   return(
//     <>
//     </>
//   )

// }

export default App;
