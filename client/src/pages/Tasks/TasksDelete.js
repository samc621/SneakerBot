import React from 'react'
import{ useState} from "react";
import  axios from 'axios';
import './TasksDelete.css'

const TasksDelete = () => {
  const [data, setData] = useState({
        id:''
      })
  const url = 'http://localhost:8080/v1/tasks/'+ data.id

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
  return (
    <div className='section'>
       <h2 className='section_title'>Delete Task by ID</h2>
      <section className='form_section'>
     
        <form onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
            <p className='section_title'> Enter Id</p>
          <input onChange={(e)=>handle(e)} id="id" value ={data.type} placeholder="ex. 22"type="text" ></input>
          <button >Submit<i class="ri-arrow-right-line"></i></button>
        </form>

      </section>
        
    </div>
  )
}

export default TasksDelete