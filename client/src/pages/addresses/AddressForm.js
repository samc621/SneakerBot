import React from 'react'
import './AddressForm.css'
import{ useState} from "react";
import  axios from 'axios';



const AddressForm = () => {
    const url = 'http://localhost:8080/v1/addresses'
    const [data, setData] = useState({
      type: '',
      first_name:'',
      last_name:  '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state:'',
      postal_code:'',
      country:'',
      email_address:'',
      phone_number:'',
    })


  
    function submit(e){
      // e.preventDefault();
      axios.post(url,{
        type: data.type,
        first_name:data.first_name,
        last_name:  data.last_name,
        address_line_1: data.address_line_1,
        address_line_2: data.address_line_2,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        email_address: data.email_address,
        phone_number: data.phone_number,
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
      <h2 className='section_title'>Create a new Address here</h2>
        <section className='form_section'>
        <form  onSubmit={(e)=>submit(e)} id='myForm' className='address_form'>
          
          <p className='label'>Type (Billing/Shipping)</p>
          <select name="type" onChange={(e)=>handle(e)} id="type" value ={data.type} placeholder="Type"type="text" >
            <option value="" disable selected>Select type</option>
            <option value="billing">Billing</option>
            <option value="shipping">Shipping</option>
          </select>
          <p className='label'>First Name</p>
          <input onChange={(e)=>handle(e)} value ={data.first_name} id="first_name" placeholder="First Name"type="text" ></input>
          <p className='label'>Last Name</p>
          <input onChange={(e)=>handle(e)} id="last_name" value ={data.last_name}placeholder="Last Name"type="text" ></input>
          <p className='label'>Email</p>
          <input onChange={(e)=>handle(e)} id="email_address" value ={data.email_address} placeholder="Email: ex. john@gmail.com"type="text" ></input>
          <p className='label'>Phone Number</p>
          <input onChange={(e)=>handle(e)} id="phone_number" value ={data.phone_number} placeholder="Phone Number"type="text" ></input>
          <p className='label'>Address 1</p>
          <input onChange={(e)=>handle(e)} id="address_line_1"  value ={data.address_line_1} placeholder="Address: ex. 1234 lane way"type="text" ></input>
          <p className='label'>Address 2</p>
          <input onChange={(e)=>handle(e)} id="address_line_2" value ={data.address_line_2} placeholder="(Optional) ex. unit 201"type="text" ></input>
          <p className='label'>City</p>
          <input onChange={(e)=>handle(e)} id="city" value ={data.city} placeholder="City"type="text" ></input>
          <p className='label'>State</p>
            <select onChange={(e)=>handle(e)} id="state" value ={data.state} placeholder="State"type="text">
                <option value="" disable selected>Select State</option>
	              <option value="AL">Alabama</option>
	              <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="DC">District Of Columbia</option>
                <option value="FL">Florida</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NY">New York</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="TX">Texas</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
            </select>
          <p className='label'>Country</p>
          <input onChange={(e)=>handle(e)} id="country" value ={data.country} placeholder="Country: ex. USA"type="text" ></input>
          <p className='label'>Postal Code</p>
          <input onChange={(e)=>handle(e)} id="postal_code" value ={data.postal_code} placeholder="Postal Code: ex. 11345"type="text"></input>
          <button  type='submit'>Create new address <i class="ri-arrow-right-line"></i></button>
      </form> 
      <p>{}</p>
      </section>
    </div>
  )
}

export default AddressForm