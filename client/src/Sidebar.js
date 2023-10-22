import React from 'react'
import { Link } from 'react-router-dom'
import './Sidebar.css'
import logo from './images/robot-line.png';

const Sidebar = () => {
  // if(document.readyState ==='complete'){
  //   const body = document.querySelector('body'),
  //       sidebar = body.querySelector(".sidebar"),
  //       toggle = body.querySelector(".toggle"),
  //       context = body.querySelector(".context"),
  //       modeSwitch = body.querySelector(".toggle-switch"),
  //       modeText = body.querySelector(".mode-text")
  //         modeSwitch.addEventListener("click", () => {
  //         body.classList.toggle("dark");
  //       })
  //       toggle.addEventListener("click", () => {
  //         sidebar.classList.toggle("close")
  //         context.classList.toggle("center");
  //       })
  // }



  const ModeButtonClicked =() =>{
    const body = document.querySelector('body')
    body.classList.toggle("dark");
    const modeText = body.querySelector(".mode-text");
    
    if(body.classList.contains("dark")){
      modeText.innerText ="Dark Mode"
    }else{
      modeText.innerText ="Light Mode"
    }
  }

  const toggleButtonClicked = () =>{
    const body = document.querySelector('body'),
    sidebar = body.querySelector(".sidebar")
    sidebar.classList.toggle("close");

  }
  



  return (
    <div className='sidebar close'>
      <header>
        <section className='image-text'>
          <span className='image'>
            <img src={logo} alt="Logo" />
          </span>
          <section className='text header-text'>
            <span className='name'>SneakerBot</span>
            {/* Change class name */}
            <span className='profession'>User Interace</span>
          </section>
        </section>
        <i class="ri-arrow-right-s-line toggle" id='toggle' onClick={toggleButtonClicked}></i>
      </header>

      <section className='menu-bar'>
        <section className='menu'>
          <ul className='menu-links'>
            <li className='nav-link'>
              <Link to="/" className='a'>
                <i class="ri-home-line icon"></i> 
                <span className='text nav-text'>Dashboard</span>
              </Link>
            </li>
            <li className='nav-link'>
            <Link to="/addresses" className='a'>
                <i class="ri-map-pin-line icon"></i>
                <span className='text nav-text'>Addresses</span>
              </Link>
            </li>
            <li className='nav-link'>
            <Link to="/proxies" className='a'>
            <i class="ri-router-line icon"></i>
                <span className='text nav-text'>Proxies</span>
              </Link>
            </li>
            <li className='nav-link'>
              <Link to="/tasks" className='a'>
              <i class="ri-task-line icon"></i>
                <span className='text nav-text'>Tasks</span>
              </Link>
            </li>
          
          </ul>
        </section>
        <section className='bottom-content'>
          {/* <li className=''>
            <Link to="/tasks" className='a'>
                <i class="ri-logout-box-line icon"></i>
                <span className='text nav-text'>Logout</span>
              </Link>
          </li> */}

          <li className='mode'>
            <section className='moon-sun '>
              <i class="ri-moon-line icon moon"></i>
              <i class="ri-sun-line icon sun"></i>
            </section>
            <span className='mode-text text'>Dark Mode</span>

            <div className="toggle-switch" onClick={ModeButtonClicked} >
              <span className="switch"></span>
            </div>
          </li>
        </section>
      </section>
    </div>
  )
}

export default Sidebar