import React from 'react';
import { Edit2, Trash2, Calendar, User } from 'lucide-react';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, currentUser }) => {
  const isOwner = task.createdBy?._id === currentUser.id || task.createdBy === currentUser.id || task.createdBy?._id === currentUser._id;
  const isAdmin = currentUser.role === 'admin';
  const canModify = isOwner || isAdmin;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  return (
    <div className="glass-card task-card">
      <div className="task-header">
        <div>
          <h3 className="task-title">{task.title}</h3>
        </div>
        
        {canModify ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className={`badge badge-${task.status}`}
            style={{
              border: '1px solid transparent',
              cursor: 'pointer',
              outline: 'none',
              padding: '0.2rem 0.5rem',
              fontWeight: 600
            }}
          >
            <option value="pending" style={{ background: '#111319', color: '#ffb020' }}>Pending</option>
            <option value="in-progress" style={{ background: '#111319', color: '#00b0ff' }}>In Progress</option>
            <option value="completed" style={{ background: '#111319', color: '#10b981' }}>Completed</option>
          </select>
        ) : (
          <span className={`badge badge-${task.status}`}>
            {getStatusText(task.status)}
          </span>
        )}
      </div>

      <p className="task-desc">{task.description || 'No description provided.'}</p>

      <div className="task-meta">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} /> {formatDate(task.createdAt)}
          </span>
          {/* Show task owner profile for Admin */}
          {isAdmin && task.createdBy && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'hsl(var(--secondary))', fontWeight: 500 }}>
              <User size={12} /> Owner: {task.createdBy.name || task.createdBy.email || 'Unknown'}
            </span>
          )}
          {!isAdmin && isOwner && (
            <span className="owner-indicator" style={{ width: 'fit-content', marginTop: '2px' }}>
              Your Task
            </span>
          )}
        </div>

        {canModify && (
          <div className="task-actions">
            <button
              onClick={() => onEdit(task)}
              className="btn-icon"
              title="Edit Task"
              style={{ color: 'hsl(var(--secondary))' }}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="btn-icon"
              title="Delete Task"
              style={{ color: '#ff4444' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
