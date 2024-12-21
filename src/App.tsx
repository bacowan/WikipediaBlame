import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {

  return (
    <>
      <h1>Wikipedia Blame</h1>
      <div className='search-area'>
        <label>
          Article Name: <input/>
        </label>
        <button className='blame-button'>
          Blame
        </button>
      </div>
      <div className='rev-area'>
        <textarea readOnly className='main-left'/>
        <div className='main-right'/>
      </div>
    </>
  )
}

export default App
