import React from 'react'
import './AddressesDelete.css'
import{ useState, useEffect} from "react";
import  axios from 'axios';

const AddressesDelete = () => {
    const [data, setData] = useState({
        id:''
      })
    const url = 'http://localhost:8080/v1/addresses/'+ data.id
    
  
    function submit(e){
      // e.preventDefault();
      axios.delete(url,{
        id: data.id
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
    const [message, setMessage] = useState("");
    useEffect(() => {
    fetch("http://localhost:8080/v1/addresses")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);
  return (
    <div className='section'>
        <h2 className='section_title'>Delete Addreses by ID</h2>
        <section className='form_section'>
        <form onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
            <p className='start_title'> Enter Id</p>
          <input onChange={(e)=>handle(e)} id="id" value ={data.type} placeholder="ex. 22"type="text" ></input>
          <p>{message.id}</p>
          <button >Submit<i class="ri-arrow-right-line"></i></button>
        </form>
        </section>
        
    </div>
  )
}

export default AddressesDelete