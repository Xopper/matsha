
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './components/redux/store';
import {
    BrowserRouter,
  } from "react-router-dom";
import React from 'react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
		<BrowserRouter>
        	<Provider store={store}>
            		<App />
    		</Provider>
    	</BrowserRouter>  
);


