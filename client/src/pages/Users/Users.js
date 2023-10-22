import{ useState, useEffect} from "react";
import  axios from 'axios';
import React from 'react'
import Sidebar from "../../Sidebar";
import UserForm from "./UserForm";


const Users = () => {
  return (
    <div>
      <Sidebar/>
      <section className="content" id="body">
      <h1 className='title'>Users</h1>
      <UserForm/>

      </section>
    </div>
  )
}

export default Users