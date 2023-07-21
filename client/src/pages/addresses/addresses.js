import React from 'react';
import './addresses.css'
import AddressForm from './AddressForm';
import AddressTable from './AddressTable';
import AddressesDelete from './AddressesDelete';
import Sidebar from '../../Sidebar';




const Addresses = () => {

  

  return (
    <div >
      <Sidebar/>
      <section className="content" id="body">
      <h1 className='title'>Addresses</h1>
      <AddressTable/>
      <AddressForm/>
      <AddressesDelete/>
      </section>
      

    </div>
    
  );
};
  
export default Addresses;