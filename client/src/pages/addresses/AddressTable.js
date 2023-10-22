import React from 'react'
import { useState, useEffect } from "react";
import './AddressTable.css'

const AddressTable = () => {

  const [list, setList] = useState([])
  
  useEffect(()=>{
    fetchData()
  },[])

  async function fetchData(){
    fetch('http://localhost:8080/v1/addresses')
    .then((response) => response.json())
    .then((json) => {
        setList(json.data)
    });
  }

  const [message, setMessage] = useState("");
    useEffect(() => {
    fetch("http://localhost:8080/v1/addresses")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);
  return (
    <div className='section'>
        <section className='current_address_section'>
        <h2 className='section_title'>
          Current Addresses
        </h2>
        <section className='address_list'>
        <table className='styled-table'>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Name</th>
            <th>Email</th>
            <th>Street Name</th>
            <th>City</th>
            <th>State</th>
            <th>Phone Number</th>
          </tr>
          <tbody>
          {
            list.map(item => (
            <tr key={item.id} className="active-row">
                <td>{item.id}</td>
                <td>{item.type}</td>
                <td>{item.last_name},{item.first_name}</td>
                <td>{item.email_address}</td>
                <td>{item.address_line_1}</td>
                <td>{item.city}</td>
                <td>{item.state}</td>
                <td>{item.phone_number}</td>
            </tr>
            ))
          }
          </tbody>
        </table>
        <p>{message}</p>
        </section>
      </section>
    </div>
  )
}

export default AddressTable