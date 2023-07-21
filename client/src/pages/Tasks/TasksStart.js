import React from 'react'
import './TasksStart.css'
import  axios from 'axios';
import{ useState} from "react";

const TasksStart = () => {

    const [data, setData] = useState({
        id:'',
        card_friendly_name:''

      })
  const url = 'http://localhost:8080/v1/tasks/'+ data.id + '/start'

  function submit(e){
    // e.preventDefault();
    axios.post(url,{
      card_friendly_name: data.card_friendly_name
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
        <h2 className='section_title'>Start Task by ID</h2>
        <section className='form_section'>
        <form onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
            <p className='start_title'> Enter Id</p>
          <input onChange={(e)=>handle(e)} id="id" value ={data.type} placeholder="ex. 22"type="text" ></input>
          <p className='start_title'>Friendly Card Name</p>
          <input onChange={(e)=>handle(e)} value ={data.card_friendly_name} id="card_friendly_name" placeholder="ex. mastercard"type="text" ></input>
          <button >Start<i class="ri-arrow-right-line"></i></button>
        </form>
        </section>
       
        
    </div>
  )
}

export default TasksStart