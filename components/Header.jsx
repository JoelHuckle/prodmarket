import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import SearchGlass from './ui/SearchGlass'
import SearchBar from './SearchBar';
import Hamburger from './Hamburger';




const navLinks = [
    {
        id: 1,
        title: "upload"
    },
    {
      id: 2,
      title: "upload"
  },
]


const Header = ({ style }) => {
  return (
    <nav className="relative flex flex-col">
      <section className='flex items-center justify-between py-2 border-b border-secondary-200 w-screen bg-dark-200/30 backdrop-blur-sm padding-container z-50'>
      <div className='flex items-center gap-6'>

      <Hamburger />

      <Link href='/'>
        <img src="/default-monochrome.svg" alt="logo" className='w-[50px]' />
      </Link>

      <div className='hidden md:flex'>
        <form action="/search">
          <SearchBar style="md:w-[40vw] lg:w-[35vw]"/>
        </form>
      </div>
      </div>
      <div className="hidden md:flex">links</div>

        <div className="">
          <Button className="text-primary bg-transparent hover:bg-dark-200 border border-primary">
            Login
          </Button>
        </div>


      </section>
      <section className='md:hidden sm:relative bg-dark-200/30 flex flex-center py-3'>
      <form action="/search">
          <SearchBar style="r w-[95vw]"/>
        </form>
      </section>

    </nav>
  )
}

export default Header
