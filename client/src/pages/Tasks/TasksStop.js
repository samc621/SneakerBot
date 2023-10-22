import React from 'react'
import  axios from 'axios';
import{ useState} from "react";

const TasksStop = () => {
  
    const [data, setData] = useState({
        id:''
      })
  const url = 'http://localhost:8080/v1/tasks/'+ data.id + '/stop'

  function submit(e){
    // e.preventDefault();
    axios.post(url,{
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
        <h2 className='section_title'>Stop Task by ID</h2>
        <section className='form_section'>
        <form onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
            <p className='stop_title'> Enter Id</p>
          <input onChange={(e)=>handle(e)} id="id" value ={data.type} placeholder="ex. 22"type="text" ></input>
          <button >Stop<i class="ri-arrow-right-line"></i></button>
        </form>
        </section>
        
    </div>
  )
}

export default TasksStop