import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import Addresses from './pages/addresses/addresses.js'
import Tasks from './pages/Tasks/tasks'
import Proxies from './pages/Proxies/proxies'
import 'remixicon/fonts/remixicon.css'


import {
  createBrowserRouter,
  RouterProvider,

} from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "addresses",
    element: <Addresses/>
  },
  {
    path: "tasks",
    element: <Tasks/>
  },
  {
    path: "proxies",
    element: <Proxies/>
  },

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router} />
  
);


