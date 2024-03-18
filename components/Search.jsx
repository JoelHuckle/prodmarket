import React from 'react'
import SearchBar from './SearchBar'

const Search = () => {
  return (
    <div className='from-dark-200 from-1% to-dark-100 h-[40vh] py-20 border-b border-secondary-200 padding-container bg-[url("/home-mixer.jpg")] backdrop-blur-lg'>
      <div className='mb-5'>
        <h1 className='text-4xl font-bold'>Search For Producers</h1>
        <h3 className='text-secondary-100'>Find your next collaboration.</h3>
      </div>
        <SearchBar style="w-[70%] max-w-[500px]"/>
    </div>
  )
}

export default Search
