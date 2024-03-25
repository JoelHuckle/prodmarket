import React from 'react'
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import SearchBar from './SearchBar';
import Hamburger from './Hamburger';

const navigation = [
  {
      id:1,
      title:'Profile',
      url:"/profile/:id"
  },
  {
      id:2,
      title:'Feed',
      url:"/feed"
  },
  {
      id:3,
      title:'Create',
      url:"/create"
  },
]

const Header = ({ style }) => {
  return (
    <nav className="relative flex flex-col">
      <section className='flex items-center justify-between py-4 border-b border-secondary-200 w-screen bg-dark-200/30 backdrop-blur-sm padding-container z-50'>
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
      <div className="hidden md:flex gap-[5vw] lg:gap-[7vw] font-medium">
        {navigation.map((item) => (
          <Link key={item.id} href={item.url} className='hover:text-accent-100 transition-all'>{item.title}</Link>
        ))}
      </div>

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
