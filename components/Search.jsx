import React from 'react'
import SearchGlass from './ui/SearchGlass'
import SearchBar from './SearchBar'

const Search = () => {
  return (
    <div className='bg-gradient-to-b from-dark-200 from-1% to-dark-100 h-[40vh] py-20 border-b border-secondary-200 padding-container bg-[url("https://images.unsplash.com/photo-1621542866840-061224c680c4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")] backdrop-blur-lg'>
      <div className='mb-5'>
        <h1 className='text-4xl font-bold'>Search For Producers</h1>
        <h3 className='text-secondary-100'>Find your next collaboration.</h3>
      </div>
        <SearchBar />
    </div>
  )
}

export default Search
