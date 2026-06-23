import React, { useState } from 'react';
import Card from '../components/Card';
import { Check, Trash2, Plus } from 'lucide-react';

export default function ToDoList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Grade Physics midterms', completed: false },
    { id: 2, text: 'Prepare presentation for Math 10-A', completed: true },
    { id: 3, text: 'Upload assignment 4', completed: false },
    { id: 4, text: 'Meeting with Principal', completed: false }
  ]);
  const [newTask, setNewTask] = useState('');

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  return (
    <div className="view-container animate-fade-in">
      <div className="view-header">
        <h1>To Do List</h1>
        <p>Manage your daily tasks and priorities.</p>
      </div>

      <Card style={{ maxWidth: '600px' }}>
        <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..." 
            style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}
          />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Add</button>
        </form>

        <ul style={{ listStyle: 'none', padding: 0 }}>
          {tasks.map(task => (
            <li key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid var(--panel-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => toggleTask(task.id)}>
                <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${task.completed ? 'var(--accent-cyan)' : 'var(--text-secondary)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: task.completed ? 'var(--accent-cyan)' : 'transparent' }}>
                  {task.completed && <Check size={14} color="#000" />}
                </div>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{task.text}</span>
              </div>
              <button className="btn btn-ghost" style={{ padding: '5px' }} onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}><Trash2 size={16} color="var(--text-secondary)"/></button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
