import React from 'react'
import './ProxiesTable.css'
import { useState, useEffect } from "react";

const ProxiesTable = () => {

  const [list, setList] = useState([])
  
  useEffect(()=>{
    fetchData()
  },[])

  async function fetchData(){
    fetch('http://localhost:8080/v1/proxies')
    .then((response) => response.json())
    .then((json) => {
        setList(json.data)
    });
  }

  const [message, setMessage] = useState("");
  useEffect(() => {
  fetch("http://localhost:8080/v1/proxies")
    .then((res) => res.json())
    .then((data) => setMessage(data.message));
}, []);
  return (
    <div className='section'>
        <section className='current_address_section'>
        <h2 className='section_title'>
          Current Proxies
        </h2>
        <section className='address_list'>
        <table className='styled-table'>
          <tr>
            <th>ID</th>
            <th>IP address</th>
            <th>Port</th>
            <th>Protocol</th>
            <th>Username</th>

          </tr>
          <tbody>
          {
            list.map(item => (
            <tr key={item.id} className="active-row">
                <td>{item.id}</td>
                <td>{item.ip_address}</td>
                <td>{item.port}</td>
                <td>{item.protocol}</td>
                <td>{item.username}</td>
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

export default ProxiesTable