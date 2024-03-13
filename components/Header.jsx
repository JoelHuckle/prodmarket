import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import SearchGlass from './ui/SearchGlass'




const navLinks = [
    {
        id: 1,

    }
]


const Header = ({ style }) => {
  return (
    <nav className="sticky flex-between py-5 border-b border-secondary-200 w-screen bg-dark-200/30 backdrop-blur-sm padding-container z-50">
      <Link href='/'>
        <img src="/default-monochrome.svg" alt="logo" className='w-[50px]' />
      </Link>

      <div className="hidden md:flex">links</div>

      <form action="/search">
        <input type="text" className='outline-none bg-transparent border border-secondary-200 rounded-full py-2 px-5 pl-12' />
      </form>

      <div className="">
        <Button className="text-primary bg-transparent hover:bg-dark-200 border border-primary">
          Login
        </Button>
      </div>
    </nav>
  )
}

export default Header
