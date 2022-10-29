import React from 'react';

import {Navigate, Outlet} from 'react-router-dom'

const  PrivateRoutes=({auth, success}) =>{

  return auth === 'failed' ? <Navigate to="/auth" /> : success ? <Outlet/> : <Navigate to="/init" />
}

export default PrivateRoutes;