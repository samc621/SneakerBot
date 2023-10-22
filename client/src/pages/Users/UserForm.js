import React from 'react'
import{ useState} from "react";
import  axios from 'axios';

const UserForm = () => {

    const url = 'http://localhost:8080/v1/users'
    const [data, setData] = useState({
        name: '',
        email_address:'',
        password: '',
        username: ''
    })

  
    function submit(e){
      // e.preventDefault();
      axios.post(url,{
        name: data.name,
        email_address:data.email_address,
        username: data.username,
        password:data.password,
      }).then(res=>{
        console.log(res.data);
      })
    }

      function handle(e){
        const newdata = {...data}
        newdata[e.target.id] = e.target.value
        setData(newdata)
        console.log(newdata)
      }
    
  return (
    <div className='section'>
      <h2 className='section_title'>Create a new User here</h2>
        <section className='form_section'>
        <form  onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
          <p className='label'>Name</p>
          <input onChange={(e)=>handle(e)} value ={data.name} id="name" placeholder="Name"type="text" ></input>
          <p className='label'>Username</p>
          <input onChange={(e)=>handle(e)} id="username" value ={data.username}placeholder="username"type="text" ></input>
          <p className='label'>Email</p>
          <input onChange={(e)=>handle(e)} id="email_address" value ={data.email_address} placeholder="Email: ex. john@gmail.com" type="text" ></input>
          <p className='label'>Password</p>
          <input onChange={(e)=>handle(e)} id="password" value ={data.password} placeholder="Password"type="password" ></input>
          <button  type='submit'>Create new User <i class="ri-arrow-right-line"></i></button>
      </form> 
      </section>
    </div>
  )
}

export default UserForm