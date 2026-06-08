import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import { PlusCircle, ListTodo, Filter, CheckCircle, Info, X } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, in-progress, completed

  // Create Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('pending');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Task State
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState('pending');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch tasks from server.', 'error');
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      addToast('Task title is required.', 'error');
      return;
    }

    setSubmittingCreate(true);
    try {
      const res = await api.post('/tasks', {
        title: newTitle,
        description: newDescription,
        status: newStatus
      });
      
      const createdTask = res.data.data;
      
      // Seed local user attributes to card if admin
      if (user.role === 'admin') {
        createdTask.createdBy = {
          _id: user._id,
          name: user.name,
          email: user.email
        };
      } else {
        createdTask.createdBy = user._id;
      }

      setTasks((prev) => [createdTask, ...prev]);
      
      setNewTitle('');
      setNewDescription('');
      setNewStatus('pending');
      
      addToast('Task created successfully!');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to create task.', 'error');
    } finally {
      setSubmittingCreate(false);
    }
  };

  const handleStatusChange = async (taskId, nextStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: nextStatus });
      const updatedTask = res.data.data;
      
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: updatedTask.status } : t))
      );
      
      addToast(`Status updated to ${nextStatus === 'in-progress' ? 'In Progress' : nextStatus === 'completed' ? 'Completed' : 'Pending'}.`);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update task status.', 'error');
    }
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditStatus(task.status);
  };

  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      addToast('Task title is required.', 'error');
      return;
    }

    setSubmittingEdit(true);
    try {
      const res = await api.put(`/tasks/${editingTask._id}`, {
        title: editTitle,
        description: editDescription,
        status: editStatus
      });
      const updatedTask = res.data.data;

      setTasks((prev) =>
        prev.map((t) =>
          t._id === editingTask._id
            ? { ...t, title: updatedTask.title, description: updatedTask.description, status: updatedTask.status }
            : t
        )
      );

      handleCloseEditModal();
      addToast('Task updated successfully!');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to update task.', 'error');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      addToast('Task deleted successfully.');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to delete task.', 'error');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  return (
    <div className="page-container">
      <div className="main-content">
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800, marginBottom: '0.25rem' }}>
            Hello, {user?.name.split(' ')[0]}
          </h2>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.95rem' }}>
            {user?.role === 'admin' 
              ? 'Administrator Mode — You can see and manage all tasks in the system.' 
              : 'Workspace — Monitor and manage your personal tasks.'}
          </p>
        </div>

        <div className="dashboard-grid">
          <div>
            <div className="glass-card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
              <h3 className="dashboard-section-title">
                <PlusCircle size={20} style={{ color: 'hsl(var(--secondary))' }} /> Create Task
              </h3>
              
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label" htmlFor="task-title">Title</label>
                  <input
                    id="task-title"
                    type="text"
                    className="glass-input"
                    placeholder="Enter task title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    disabled={submittingCreate}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="task-desc">Description</label>
                  <textarea
                    id="task-desc"
                    className="glass-input"
                    rows="4"
                    placeholder="What needs to be done?"
                    style={{ resize: 'none' }}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    disabled={submittingCreate}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" htmlFor="task-status">Initial Status</label>
                  <select
                    id="task-status"
                    className="glass-input glass-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={submittingCreate}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  disabled={submittingCreate}
                >
                  {submittingCreate ? 'Creating Task...' : 'Add Task'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="filters-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'hsl(var(--text-muted))' }}>
                <Filter size={16} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filter:</span>
              </div>
              <div className="filter-tabs">
                <button
                  onClick={() => setFilter('all')}
                  className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                >
                  Pending ({tasks.filter(t => t.status === 'pending').length})
                </button>
                <button
                  onClick={() => setFilter('in-progress')}
                  className={`filter-tab ${filter === 'in-progress' ? 'active' : ''}`}
                >
                  In Progress ({tasks.filter(t => t.status === 'in-progress').length})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
                >
                  Completed ({tasks.filter(t => t.status === 'completed').length})
                </button>
              </div>
            </div>

            <h3 className="dashboard-section-title">
              <ListTodo size={20} style={{ color: 'hsl(var(--primary))' }} /> Task Records
            </h3>

            {loadingTasks ? (
              <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Loading tasks from database...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="glass-card empty-state">
                <CheckCircle size={40} style={{ color: 'hsl(var(--text-muted))' }} />
                <p style={{ fontSize: '1.05rem', fontWeight: 500, marginBottom: '0.5rem' }}>No Tasks Found</p>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
                  {filter === 'all' 
                    ? "Get started by typing a new task in the sidebar!" 
                    : `You have no tasks matching the "${filter.replace('-', ' ')}" filter.`}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    currentUser={user}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {editingTask && (
        <div className="modal-overlay">
          <div className="glass-card modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'Outfit, sans-serif' }}>Edit Task Profile</h3>
              <button onClick={handleCloseEditModal} className="btn-icon" style={{ padding: '0.25rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-title">Title</label>
                <input
                  id="edit-title"
                  type="text"
                  className="glass-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={submittingEdit}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-desc">Description</label>
                <textarea
                  id="edit-desc"
                  className="glass-input"
                  rows="4"
                  style={{ resize: 'none' }}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={submittingEdit}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  className="glass-input glass-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={submittingEdit}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn btn-secondary"
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <Info size={18} />
            <span style={{ flex: 1, fontSize: '0.9rem' }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', display: 'flex' }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
