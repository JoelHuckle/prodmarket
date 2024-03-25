"use client"

import Image from 'next/image'
import React, { useState } from 'react'

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

const Hamburger = () => {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => {
        setIsOpen(!isOpen)
        document.body.style.overflow = !isOpen ? 'hidden' : ''
    }

  return (
    <main className='sm:block md:hidden transition-all relative'>
        <Image src='/hamburger.svg' height={30} width={30} className='invert cursor-pointer' onClick={toggleMenu}/>
        <div className={`fixed top-0 left-0 z-50 h-screen bg-slate-950 w-64 py-1 transform transition duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className='flex gap-5 bg-dark-100 py-3 padding-container border-b border-secondary-200'>
                <Image src="/x.svg" width={35} height={35} className='relative right-[2%] top-[1%] cursor-pointer' onClick={toggleMenu}/>
                <Image src="/default-monochrome.svg" width={50} height={50}/>
            </div>
            <ul className="flex flex-col padding-container gap-6 mt-5 font-medium">
               {navigation.map(item => (
                <a href={item.url} key={item.id} className='hover:text-accent-100 transition-all'>
                    {item.title}
                </a>
               ))}
            </ul>
        </div>

        {isOpen && <div className="fixed inset-0 z-40 bg-black/50 h-screen" onClick={toggleMenu}></div>}

    </main>
  )
}

export default Hamburger
