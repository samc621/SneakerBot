import React from 'react';
import './tasks.css'
import TasksForm from './TasksForm';
import TasksTable from './TasksTable';
import TasksDelete from './TasksDelete';
import TasksStart from './TasksStart';
import TasksStop from './TasksStop';
import Sidebar from '../../Sidebar';
  
const Tasks = () => {
  return (
    <div >
      <Sidebar/>
      <section className="content" id="body">
        <h1 className='title'>Tasks</h1>
        <TasksTable/>
        <TasksForm/>
        <TasksDelete/>
        <section className='taskFunctions'>
        <TasksStart/>
        <TasksStop />
        </section>
      </section>
      
      

    </div>
  );
};
  
export default Tasks;