import React from 'react';

import Sidebar from '../../Sidebar';
import './proxies.css'  
import ProxiesDelete from './ProxiesDelete';
import ProxiesForm from './ProxiesForm';
import ProxiesTable from './ProxiesTable';

const Proxies = () => {
  return (
    <div >
      <Sidebar/>
      <section className="content" id="body">
      <h1 className='title'>Proxies</h1>
      <ProxiesTable/>
      <ProxiesForm/>
      <ProxiesDelete/>
      </section>
    </div>
  );
};
  
export default Proxies;