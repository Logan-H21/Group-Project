// TodoApp.js
import React, { useState, useEffect } from 'react';
import { X, LogOut, PlusIcon, MinusIcon, Trash2, Edit2, Save, XCircle, Share2, UserPlus, UserMinus, Container } from 'lucide-react';
import './TodoApp.css';

const TodoApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [todos, setTodos] = useState([]);
    const [allUsersTodos, setAllUsersTodos] = useState({});
    const [allUsers, setAllUsers] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [error, setError] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [description, setDescription] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [sharedWith, setSharedWith] = useState({});

  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';
  const ADMIN_EMAIL = 'admin@example.com';

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('users')) || [];
    const savedTodos = JSON.parse(localStorage.getItem('todos')) || {};
    const savedSharing = JSON.parse(localStorage.getItem('sharing')) || {};

    // Initialize storage if needed
    if (!localStorage.getItem('sharing')) {
        localStorage.setItem('sharing', JSON.stringify({}));
    }
    
    if (!localStorage.getItem('todos')) {
        localStorage.setItem('todos', JSON.stringify({}));
    }

    // Initialize admin if not exists
    if (!savedUsers.length) {
        const initialUsers = [{
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD,
            email: ADMIN_EMAIL,
            isAdmin: true
        }];
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }

    if (currentUser) {
        setSharedWith(savedSharing);
        setTodos(savedTodos[currentUser] || []);

        if (currentUser === ADMIN_USERNAME) {
            setAllUsers(savedUsers.filter(user => !user.isAdmin));
            setAllUsersTodos(savedTodos);
        } else {
            const sharedTodos = {};
            Object.entries(savedSharing).forEach(([owner, shared]) => {
                if (Array.isArray(shared) && shared.includes(currentUser)) {
                    sharedTodos[owner] = savedTodos[owner] || [];
                }
            });
            setAllUsersTodos(sharedTodos);
        }
    }
  }, [currentUser]);


    const handleShare = (targetUser) => {
      const updatedSharing = { ...sharedWith };
      
      if (!updatedSharing[currentUser]) {
          updatedSharing[currentUser] = [];
      }
      
      const isCurrentlyShared = updatedSharing[currentUser].includes(targetUser);
      if (isCurrentlyShared) {
          updatedSharing[currentUser] = updatedSharing[currentUser].filter(
              user => user !== targetUser
          );
      } else {
          updatedSharing[currentUser].push(targetUser);
      }
      
      localStorage.setItem('sharing', JSON.stringify(updatedSharing));
      setSharedWith(updatedSharing);
    };


    const handleInputChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(user => user.username === formData.username)) {
          setError('Username or email already exists');
          return;
        }
    
        const newUser = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          isAdmin: false
        };
    
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        const todos = JSON.parse(localStorage.getItem('todos')) || {};
        todos[formData.username] = [];
        localStorage.setItem('todos', JSON.stringify(todos));
        
        setError('');
        setIsRegistering(false);
        setFormData({ username: '', password: '', email: '' });
      };

      const handleLogin = (e) => {
        e.preventDefault();
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check for admin login
        if (
          formData.username === ADMIN_USERNAME && 
          formData.password === ADMIN_PASSWORD &&
          formData.email === ADMIN_EMAIL
        ) {
          setCurrentUser(ADMIN_USERNAME);
          setIsAdmin(true);
          setIsLoggedIn(true);
          setError('');

          setAllUsers(users.filter(user => !user.isAdmin));
          return;
        }
    
        // Regular user login
        const user = users.find(
          u => u.username === formData.username && 
               u.password === formData.password && 
               u.email === formData.email
        );
    
        if (user) {
          setCurrentUser(user.username);
          setIsLoggedIn(true);
          setError('');
          const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
          const savedSharing = JSON.parse(localStorage.getItem('sharing')) || {};
          setTodos(allTodos[user.username] || []);

          setAllUsers(users.filter(u => !u.isAdmin && u.username !== user.username));
          
          // Load shared todos
          const sharedTodos = {};
          Object.entries(savedSharing).forEach(([owner, shared]) => {
              if (Array.isArray(shared) && shared.includes(user.username)) {
                  sharedTodos[owner] = allTodos[owner] || [];
              }
          });
          setAllUsersTodos(sharedTodos);
        }
        else {
          setError('Invalid username or password');
        }
      };

      const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setCurrentUser(null);
        setTodos([]);
        setFormData({ username: '', password: '', email: '' });
      };

      const deleteUser = (username) => {
        if (!isAdmin) return;

        // Update users in localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.username !== username);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // Update todos in localStorage
        const todos = JSON.parse(localStorage.getItem('todos')) || {};
        delete todos[username];
        localStorage.setItem('todos', JSON.stringify(todos));

        // Update state
        setAllUsers(updatedUsers.filter(user => !user.isAdmin));
        setAllUsersTodos(todos);
      };

      const editTodo = (username, todoId, updatedTodo) => {
        if (!isAdmin) return;

        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        const userTodos = allTodos[username] || [];
        
        const updatedTodos = userTodos.map(todo =>
            todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        );

        // Update localStorage
        allTodos[username] = updatedTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));

        // Update state
        setAllUsersTodos({ ...allTodos });
      };

    const addTodo = (e) => {
        e.preventDefault();
        if (!newTodo.trim()) return;

            const newTodoItem = {
            id: Date.now(),
            text: newTodo,
            dueDate: dueDate,
            completed: false,
            description: description.trim()
            };

            const updatedTodos = sortTodosByDate([...todos, newTodoItem]);
            setTodos(updatedTodos);

            const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
            allTodos[currentUser] = updatedTodos;
            localStorage.setItem('todos', JSON.stringify(allTodos));

            // Reset form
            setNewTodo('');
            setDueDate('');
            setDescription('');
            setShowDescription(false);
    };

    const toggleTodo = (id) => {
        const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        setTodos(sortTodosByDate(updatedTodos));

        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        allTodos[currentUser] = updatedTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));
    };

    const deleteTodo = (id) => {
        const updatedTodos = todos.map(todo => 
        todo.id === id ? { ...todo, isFadingOut: true } : todo
        );
        setTodos(updatedTodos);
    
        setTimeout(() => {
        const filteredTodos = sortTodosByDate(updatedTodos.filter(todo => todo.id !== id));
        setTodos(filteredTodos);
    
        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        allTodos[currentUser] = filteredTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));
        }, 500);
    };

    const isDateOverdue = (date) => {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const dueDate = new Date(date);
        return dueDate < today;
    };

   // Helper function to sort todos by due date
   const sortTodosByDate = (todoList) => {
    return [...todoList].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  };

  // Admin Components
  const AdminPanel = () => (
    <div className="admin-panel">
        <h2 className="admin-title">Admin Dashboard</h2>
        <div className="user-management">
            <h3>User Management</h3>
            <div className="user-list">
                {allUsers.map(user => (
                    <div key={user.username} className="user-item">
                        <span className="user-info">
                            {user.username} ({user.email})
                        </span>
                        <button
                            onClick={() => deleteUser(user.username)}
                            className="btn btn-danger btn-sm"
                            title="Delete User"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

  const AdminTodoItem = ({ todo, username }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTodo, setEditedTodo] = useState({ ...todo });

    const handleSave = () => {
        editTodo(username, todo.id, editedTodo);
        setIsEditing(false);
    };

    const handleDelete = () => {
        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        const userTodos = allTodos[username] || [];
        const updatedTodos = userTodos.filter(t => t.id !== todo.id);
        
        allTodos[username] = updatedTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));
        setAllUsersTodos({ ...allTodos });
    };

    return (
        <div className="todo-item admin-todo-item">
            {isEditing ? (
                <>
                    <input
                        type="text"
                        value={editedTodo.text}
                        onChange={(e) => setEditedTodo({ ...editedTodo, text: e.target.value })}
                        className="todo-input"
                    />
                    <input
                        type="date"
                        value={editedTodo.dueDate || ''}
                        onChange={(e) => setEditedTodo({ ...editedTodo, dueDate: e.target.value })}
                        className="due-date-input"
                    />
                    <button onClick={handleSave} className="btn btn-primary btn-sm" title="Save">
                        <Save size={16} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="btn btn-danger btn-sm" title="Cancel">
                        <XCircle size={16} />
                    </button>
                </>
            ) : (
                <>
                    <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                        {todo.text}
                    </span>
                    {todo.dueDate && (
                        <span className={`due-date ${isDateOverdue(todo.dueDate) ? 'overdue' : ''}`}>
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-sm" title="Edit">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={handleDelete} className="btn btn-danger btn-sm" title="Delete">
                        <Trash2 size={16} />
                    </button>
                </>
            )}
        </div>
    );
  };
  

  const TodoList = ({ todos, isCurrentUser, username }) => {
    const isSharedList = !isCurrentUser && username !== currentUser;
    
    const handleSharedTodoToggle = (id) => {
        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        const userTodos = allTodos[username] || [];
        
        const updatedTodos = userTodos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        
        allTodos[username] = updatedTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));
        setAllUsersTodos(prev => ({
            ...prev,
            [username]: updatedTodos
        }));
    };

    const handleSharedTodoDelete = (id) => {
        const allTodos = JSON.parse(localStorage.getItem('todos')) || {};
        const userTodos = allTodos[username] || [];
        
        const updatedTodos = userTodos.filter(todo => todo.id !== id);
        
        allTodos[username] = updatedTodos;
        localStorage.setItem('todos', JSON.stringify(allTodos));
        setAllUsersTodos(prev => ({
            ...prev,
            [username]: updatedTodos
        }));
    };

    return (
        <div className="todo-list">
            {sortTodosByDate(todos).map(todo => (
                <div key={todo.id} className={`todo-item ${todo.isFadingOut ? 'fade-out' : ''}`}>
                    {(isCurrentUser || isSharedList) && (
                        <input 
                            type="checkbox" 
                            checked={todo.completed} 
                            onChange={() => isSharedList ? handleSharedTodoToggle(todo.id) : toggleTodo(todo.id)} 
                            className="todo-checkbox"
                        />
                    )}
                    <div>
                        <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                            {todo.text}
                        </span>
                        {todo.description && (
                            <div className="todo-description">
                                {todo.description}
                            </div>
                        )}
                    </div>
                    {todo.dueDate && (
                        <span className={`due-date ${isDateOverdue(todo.dueDate) ? 'overdue' : ''}`}>
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                    )}
                    {(isCurrentUser || isSharedList) && (
                        <button 
                            onClick={() => isSharedList ? handleSharedTodoDelete(todo.id) : deleteTodo(todo.id)} 
                            className="delete-btn"
                        >
                            <X size={18}/>
                        </button>
                    )}
                </div>
            ))}
            {todos.length === 0 && (
                <p className="empty-message">No tasks yet.</p>
            )}
        </div>
    );
  };

  const ShareModal = () => {
    const otherUsers = allUsers.filter(user => user.username !== currentUser);
    
    return (
        <div className="modal-overlay">
            <div className="share-modal">
                <h2>Share Todo List</h2>
                <div className="user-list">
                    {otherUsers.map(user => (
                        <div key={user.username} className="share-user-item">
                            <span>{user.username}</span>
                            <button
                                onClick={() => handleShare(user.username)}
                                className={`logout-btn ${
                                    sharedWith[currentUser]?.includes(user.username)
                                        ? 'btn-danger'
                                        : 'btn-primary'
                                }`}
                            >
                                {sharedWith[currentUser]?.includes(user.username) ? (
                                    <>
                                        <UserMinus size={16} />
                                        Unshare
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        Share
                                    </>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => setShowShareModal(false)}
                    className="btn btn-secondary"
                >
                    Close
                </button>
            </div>
        </div>
    );
  };





//  _______________ HTMLLLLLLLLL _______________







return (
    <div className="container">
      {!isLoggedIn ? (
        <section className="Login">
          <div>
            <img class="MLOGO" src="Group-Logo.png" alt="big-logo"></img>
          </div>
          <div className="auth-container">
            <div className="auth-box">
              <h1 className="auth-title">
                {isRegistering ? 'Register' : 'Login'}
              </h1>
              
              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}
              
              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <div className="form-group">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">
                  {isRegistering ? 'Register' : 'Login'}
                </button>
              </form>
              
              {!isRegistering && (
                <button
                  onClick={() => setIsRegistering(true)}
                  className="auth-switch"
                >
                  Need an account? Register
                </button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <div>
          <div class="dropdown">
         <span>
          <img class="LOGO" src="Group-Logo.png" alt="logo"></img>
          </span>
          <div className="dropdown-content">
            <p>Dog Menu</p>
            <button onClick={() => setShowShareModal(true)}>
                <Share2 size={18} />
                Share Todo List
            </button>
            <button onClick={handleLogout} className="logout-btn">
                <LogOut size={18} />
                Logout
            </button>
          </div>
        </div>
          {showShareModal && <ShareModal />}
          <div className="header">
            <h1 className="welcome-text">
              Welcome, {currentUser}! {isAdmin && '(Admin)'}
            </h1>
          </div>

          {isAdmin ? (
            <AdminPanel />
          ) : (
            <div className="todo-container">
              {/* Current user's todo form */}
                <div className="user-todo-column current-user-column">
                    <div className="column-header current-user-header">
                    My Tasks
                    </div>
                    <form onSubmit={addTodo} className="todo-form">
                    <div className="todo-input-group">
                        <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="todo-input"
                        />
                        <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="due-date-input"
                        />
                        <button 
                        type="button"
                        onClick={() => setShowDescription(!showDescription)}
                        className="description-toggle"
                        title={showDescription ? "Hide description" : "Add description"}
                        >
                        {showDescription ? <MinusIcon size={18} /> : <PlusIcon size={18} />}
                        </button>
                        <button type="submit" className="btn btn-primary">
                        Add
                        </button>
                    </div>
                    {showDescription && (
                        <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="description-input"
                        />
                    )}
                    </form>
                    <TodoList 
                    todos={todos} 
                    isCurrentUser={true}
                    username={currentUser}
                    />
                </div>
            </div>
          )}

          {/* Display all users' todos with admin controls if admin */}
          <div className="all-todos-container">
            {Object.entries(allUsersTodos).map(([username, userTodos]) => (
              <div key={username} className="user-todo-column">
                <div className="column-header">
                  {username}'s Tasks
                </div>
                <div className="todo-list">
                  {isAdmin ? (
                    userTodos.map(todo => (
                      <AdminTodoItem
                        key={todo.id}
                        todo={todo}
                        username={username}
                      />
                    ))
                  ) : (
                    // Regular TodoList component for non-admin users
                    <TodoList
                      todos={userTodos}
                      isCurrentUser={username === currentUser}
                      username={username}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoApp;