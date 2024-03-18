import React from 'react'
import { Button } from './ui/button'

// const details = [
//     {
//         key: 0,
//         body: "monthly loops"
//     },
//     {
//         key: 1,
//         body: "sending beats out"
//     },
//     {
//         key: 2,
//         body: "midis"
//     },
// ]

const Service = ({type, icon=""}) => {
  return (
    <div className='bg-gradient-to-br from-slate-900 to-dark-100 px-10 py-5 rounded-xl text-left w-[350px] relative'>
        <div className="mb-4">
            <h1 className='font-semibold text-lg'>LIFETIME LOOPS</h1>
            <h2 className='font-semibold text-lg'>£0.00 <span className='text-xs font-normal'>/ month</span><span className='text-xs text-secondary-100 font-normal'> (plus vat) </span></h2>
        </div>
        <Button className="w-full text-dark-200 font-semibold mb-5">Subscribe</Button>
        <div>
            <h2 className='text-sm font-semibold mb-2'>Details:</h2>
            <ul className='list-disc marker:text-primary '>
                {/* {details.map(item => (
                    <li className='text-sm' key={item.key}>{item.body}</li>
                ))} */}
                hi
            </ul>
        </div>
        <img src={icon} alt="" height={50} width={50} className={`absolute bottom-[90%] left-[90%] rounded-full ${icon ? 'absolute' : 'hidden'}`} />
    </div>
  )
}

export default Service
