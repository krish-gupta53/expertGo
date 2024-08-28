import { useState, useEffect } from 'react'
import { TodoProvider } from './contexts'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'


const API_URL = 'https://jsonplaceholder.typicode.com/todos';

function App() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

 
  const syncWithLocalStorage = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const localTodos = JSON.parse(localStorage.getItem('todos'))

        if (localTodos && localTodos.length > 0) {
          setTodos(localTodos)
          setLoading(false)
        } else {
          const response = await fetch(API_URL)
          if (!response.ok) {
            throw new Error('Failed to fetch todos')
          }
          const data = await response.json()
          const fetchedTodos = data.slice(0, 10) 
          setTodos(fetchedTodos)
          syncWithLocalStorage(fetchedTodos) 
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTodos()
  }, [])

  const addTodo = async (todo) => {
    try {
      const newTodo = {
        ...todo,
        completed: false, 
      }
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTodo),
      })
      const savedTodo = await response.json()
      const updatedTodos = [{ ...savedTodo, completed: false }, ...todos]
      setTodos(updatedTodos)
      syncWithLocalStorage(updatedTodos) 
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  const updateTodo = async (id, updatedTodo) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTodo),
      })
      const newTodo = await response.json()
      const updatedTodos = todos.map((todo) => (todo.id === id ? newTodo : todo))
      setTodos(updatedTodos)
      syncWithLocalStorage(updatedTodos) 
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })
      const updatedTodos = todos.filter((todo) => todo.id !== id)
      setTodos(updatedTodos)
      syncWithLocalStorage(updatedTodos) 
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const toggleComplete = async (id) => {
    const todo = todos.find((todo) => todo.id === id)
    if (todo) {
      const updatedTodo = { ...todo, completed: !todo.completed }
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PATCH', 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: updatedTodo.completed }),
        })
        if (response.ok) {
          const updatedTodos = todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          )
          setTodos(updatedTodos)
          syncWithLocalStorage(updatedTodos) 
        } else {
          console.error('Failed to toggle complete status on API')
        }
      } catch (error) {
        console.error('Error toggling todo complete status:', error)
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    
    <TodoProvider value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}>
      <div className="bg-[#8c29ce] min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">Hey There</h1>
          <h3 className='font-serif mb-3'>check your todos</h3>
          <div className="mb-4">
            <TodoForm />
          </div>
          <div className="flex flex-wrap gap-y-3">
            {todos.map((todo) => (
              <div key={todo.id} className='w-full'>
                <TodoItem todo={todo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}

export default App