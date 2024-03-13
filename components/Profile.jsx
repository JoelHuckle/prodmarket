"use client"
import Image from "next/image";

import React, { useState } from 'react'

const Profile = ({url, thumbnail="/profile.png", name, credits}) => {
  const [notificationTrue, setNotificationTrue] = useState(false)

   function handleNotification() {
    notificationTrue ? setNotificationTrue(false) : setNotificationTrue(true)
   }
  return (
    <a href={url} className='relative flex flex-col gap-3 hover:bg-secondary-200 hover:border hover:px-[7px] hover:py-[11px] border-secondary-100 w-fit px-2 py-3 rounded-md cursor-pointer'>
      <Image src="/notification.svg" width={15} height={15} className={`animate-pulse ${notificationTrue ? 'absolute' : 'hidden'} absolute bottom-[92%] left-[90%]`}/>
      <div className="h-[170px] w-[170px] ">
        <img src={thumbnail} alt="profile" className='border-2 border-secondary-200 rounded-lg' />
      </div>
      <div>
        <h2>{name}</h2>
        <h3 className='text-secondary-100 text-sm uppercase'>{`CR: ${credits}`}</h3>
      </div>
    </a>
  )
}

export default Profile
