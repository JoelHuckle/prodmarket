'use client'

import React from 'react'
import SearchGlass from './ui/SearchGlass'

const SearchBar = () => {
  return (
    <div>
        <SearchGlass style=" relative top-[32px] left-[15px] w-[20px]"/>
        <input type="text" placeholder='Search' className='bg-primary text-dark-100 py-2 px-12  rounded-full outline-none w-[70%] max-w-[500px] focus:border focus:border-secondary-100 focus:py-[7px] focus:px-[47px]'/>
    </div>
  )
}

export default SearchBar
