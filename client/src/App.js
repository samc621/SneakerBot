import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import Sidebar from "./Sidebar";



function App() {
  const [message, setMessage] = useState("");
  useEffect(() => {
    fetch("http://localhost:8080/v1/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="App ">
      <Sidebar/> 
      <section className="content" id="body">
      <h1 className="title">Welcome to the SneakerBot API</h1>  
      <section>
        <p>Please make sure you have completed all steps, including setting up db, and editing your .env.local file.</p>
        <p>Otherwise this, will not work.</p>
        <p className="section_title">
          To get started, please add an address to the queue.
        </p>
        <p>
          1. Go to address tab and create an address.
        </p>
        <p>2. Add Proxies in proxies tab</p>
        <p>
          3. Create tasks in tasks tab, then start a task when day of drop.
        </p>
        <p className="home_links">
          You can access the app inside of "<Link >http://localhost:3000</Link>" or "<Link>http://127.0.0.0:3000"</Link>
        </p>
      </section>  
      </section>
    </div>
  );
}

export default App