import React from 'react'
import { Provider } from 'react-redux'
import { store } from './lib/store'
import { Toaster } from './components/ui/toaster'
import MainApp from './components/MainApp'

function App() {
  return (
    <Provider store={store}>
      <MainApp />
      <Toaster />
    </Provider>
  )
}

export default App
