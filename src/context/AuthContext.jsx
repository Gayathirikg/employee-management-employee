import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem('empToken') || null
  )
  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem('empData') || 'null')
  )

  const login = (tkn, empData) => {
    localStorage.setItem('empToken', tkn)
    localStorage.setItem('empData', JSON.stringify(empData))
    setToken(tkn)
    setEmployee(empData)
  }

  const logout = () => {
    localStorage.removeItem('empToken')
    localStorage.removeItem('empData')
    setToken(null)
    setEmployee(null)
  }

  const updateEmployee = (updatedData) => {
    const merged = { ...employee, ...updatedData }
    localStorage.setItem('empData', JSON.stringify(merged))
    setEmployee(merged)
  }

  return (
    <AuthContext.Provider value={{ token, employee, login, logout, updateEmployee }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)