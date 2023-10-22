import React from 'react'
import{ useState} from "react";
import  axios from 'axios';

const TasksForm = () => {
    const url = 'http://localhost:8080/v1/tasks'
    const [data, setData] = useState({
      site_id: '',
      url: '',
      product_code: '',
      style_index: '',
      size: '',
      shipping_speed_index: '',
      shipping_address_id: '',
      billing_address_id: '',
      notification_email_address: ''
    })  

    function submit(e){
        // e.preventDefault();
        axios.post(url,{
            site_id: data.site_id,
            url: data.url,
            product_code: data.product_code,
            style_index: data.style_index,
            size: data.size,
            shipping_speed_index: data.shipping_speed_index,
            shipping_address_id: data.shipping_address_id,
            billing_address_id: data.billing_address_id,
            notification_email_address: data.notification_email_address
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
      <h2 className='section_title'>Create a new Task here</h2>
        <section className='form_section'>
        <form  onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
          <p>Site ID</p>
          <select name="site_id" onChange={(e)=>handle(e)} id="site_id" value ={data.site_id} placeholder="ID"type="text" >
            <option value="" disable selected>Select type</option>
            <option value="1">Nike</option>
            <option value="2">Footsites(footlocker, finishline, etc..)</option>
            <option value="3">Shopify</option>
            <option value="4">Demandware</option>
            <option value="5">Supreme New York</option>
          </select>
          <p>URL</p>
          <input onChange={(e)=>handle(e)} value ={data.url} id="url" placeholder="ex. https://nike.com"type="text" ></input>
          <p>Product Code</p>
          <input onChange={(e)=>handle(e)} id="product_code" value ={data.product_code}placeholder="ex.CQ9283-100"type="text" ></input>
          <p>Style index</p>
          <input onChange={(e)=>handle(e)} id="style_index"  value ={data.style_index} placeholder="ex. 1 or 10"type="text" ></input>
          <p>Size</p>
          <input onChange={(e)=>handle(e)} id="size" value ={data.size} placeholder="ex. 8.5"type="text" ></input>
          <p>Shipping Speed index</p>
          <input onChange={(e)=>handle(e)} id="shipping_speed_index" value ={data.shipping_speed_index} placeholder="1"type="text" ></input>
          <p>Billing Address ID</p>
          <input onChange={(e)=>handle(e)} id="billing_address_id" value ={data.billing_address_id} placeholder="ex. 25"type="text" ></input>
          <p>Shipping Address ID</p>
          <input onChange={(e)=>handle(e)} id="shipping_address_id" value ={data.shipping_address_id} placeholder="ex. 22"type="text" ></input>
          <p>Notification Email</p>
          <input onChange={(e)=>handle(e)} id="notification_email_address" value ={data.notification_email_address} placeholder="Email: ex. john@gmail.com"type="text" ></input>
          <button  type='submit'>Create new Task<i class="ri-arrow-right-line"></i></button>
      </form>
      </section>
    </div>
  )
}

export default TasksForm