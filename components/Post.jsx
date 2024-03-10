import React from 'react'
import { Button } from './ui/button'

const Post = () => {
  return (
    <article className='padding-container py-3 border border-secondary-100 rounded-lg'>
        <div className='mb-5'>
            <h1 className='text-lg font-medium'>LOOPS 10/03/24</h1>
            <p className='text-sm text-secondary-100 mb-2'>3 days ago</p>
            <p className='text-sm'>50 + loops, in the style of ken yeat and more!</p>
        </div>
        <Button className="bg-dark-200 hover:bg-blue-950">Unlock</Button>
    </article>
  )
}

export default Post
