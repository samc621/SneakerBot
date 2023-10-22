import{ useState} from "react";
import  axios from 'axios';
import React from 'react'
import './ProxiesForm.css'





const ProxiesForm = () => {

        const url = 'http://localhost:8080/v1/proxies'
        const [data, setData] = useState({
          ip_address: "",
          port: null,
          protocol: "",
          username: null,
          password: null
    
    
        })
    
    
    function submit(e){
        // e.preventDefault();
        axios.post(url,{
          ip_address: data.ip_address,
          port: data.port,
          protocol:  data.protocol,
          username: data.username,
          password: data.password
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
      <h2 className='section_title'>Create a new proxy here</h2>
        <section className='form_section'>
        <form  onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
          <p>Ip address</p>
          <input onChange={(e)=>handle(e)} value ={data.ip_address} id="ip_address" placeholder="ex. 192.168.0.0"type="text" ></input>
          <p>Port</p>
          <input onChange={(e)=>handle(e)} id="port" value ={data.port}placeholder="ex. 3000"type="text" ></input>
          <p>Protocol</p>
          <input onChange={(e)=>handle(e)} id="protocol"  value ={data.protocol} placeholder="Protocol ex. "type="text" ></input>
          <p>Username</p>
          <input onChange={(e)=>handle(e)} id="Username" value ={data.username} placeholder="ex. johnsmith235"type="text" ></input>
          <p>Password</p>
          <input onChange={(e)=>handle(e)} id="password" value ={data.password} placeholder="Password"type="password" ></input>
          
          <button  type='submit'>Create new Proxy<i class="ri-arrow-right-line"></i></button>
      </form>
      </section>
    </div>
  )
}


export default ProxiesForm