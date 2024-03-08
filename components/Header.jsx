import React from 'react'
import { Button } from "@/components/ui/button"
import SearchBar from './SearchBar'
import homeMixer from "../public/home-mixer.jpg";


const navLinks = [
    {
        id: 1,

    }
]


const Header = ({ style }) => {
  return (
    <nav className="flex-between py-5 border-b border-secondary-200 w-screen bg-dark-200/30 backdrop-blur-sm padding-container">
      <div>
        <img src={homeMixer} alt="logo" className='invert w-[50px]' />
      </div>

      <div className="hidden md:flex">links</div>

      <div className="">
        <Button className="text-primary bg-transparent hover:bg-dark-200 border border-primary">
          Login
        </Button>
      </div>
    </nav>
  )
}

export default Header
