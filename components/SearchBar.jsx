'use client'

import React from 'react'
import SearchGlass from './ui/SearchGlass'

const SearchBar = ({style}) => {
  return (
    <div className={`relative align-middle`}>
        <SearchGlass style="absolute top-[4px] left-[12px] w-[18px]"/>
        <input type="text" placeholder='Search' className={`${style} bg-dark-200 border text-primary border-secondary-200 py-[6px] px-10 text-sm rounded-full outline-none`}/>
    </div>
  )
}

export default SearchBar
