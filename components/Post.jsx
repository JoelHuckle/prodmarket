import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
// import { HeartSolid, Download } from 'iconoir-react';

const Post = ({title, date, caption, url, likes=0, downloads=0, price=0, icon}) => {
  return (
    <article className='relative mx-2 md:w-[70vw] lg:w-[45vw] flex-1 px-10 lg:px-15 py-5 bg-gradient-to-br from-slate-900 to-dark-100 rounded-lg'>
      <div className='mb-4'>
      {/* preview */}

      </div>
      <div className='flex sm:flex-col mb-2 gap-4'>
        <div className=''>
            <h1 className='text-lg font-semibold'>LOOPS 10/03/24</h1>
            <p className='text-sm text-secondary-100 mb-2'>3 days ago</p>
            <p className='text-sm'>50 + loops, in the style of ken yeat and more!</p>
        </div>
        <div>
        </div>
      </div>
        <Button className="bg-dark-200 hover:bg-blue-950 mb-2 flex">
          <div className='flex relative right-2'>
        <svg className='fill-accent-100 mr-2' width="21" height="21" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d=" M 500 171C 499 171 499 171 498 171C 417 172 351 239 350 325C 350 325 350 462 350 462C 350 462 650 462 650 462C 650 462 650 325 650 325C 650 325 650 325 650 325C 650 324 650 323 650 322C 647 236 580 171 500 171C 500 171 500 171 500 171M 500 71C 634 71 745 181 750 318C 750 320 750 323 750 325C 750 325 750 325 750 325C 750 325 750 463 750 463C 784 464 812 493 812 528C 812 528 812 872 812 872C 812 908 783 937 747 937C 747 937 253 937 253 937C 217 937 188 908 188 872C 188 872 188 528 188 528C 188 493 216 464 250 463C 250 463 250 325 250 325C 250 325 250 325 250 325C 250 325 250 325 250 324C 252 187 361 73 497 71C 498 71 499 71 500 71C 500 71 500 71 500 71"/></svg>
        <h3 className='text-primary'>{`Unlock for $${price}`}</h3>
        </div>
        </Button>
        <div className='flex items-center gap-1'>
          {/* likes */}
          <Image src="/heart-icon.svg" height={15} width={15} className='fill-white cursor-pointer'/>
          <span className='text-accent-100 mr-2'>{likes}</span>
          {/* downloads */}
          <Image src="/eye-icon.svg" height={15} width={15} />
          <span className='text-accent-100 mr-2'>{downloads}</span>
        </div>
        <img src={icon} alt="" height={50} width={50} className={`absolute bottom-[90%] left-[92%] rounded-full ${icon ? 'absolute' : 'hidden'}`} />
    </article>
  )
}

export default Post
