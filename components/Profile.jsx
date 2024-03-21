"use client"
import Image from "next/image";

const Profile = ({url="/profile/1", thumbnail="/profile.png", name, credits}) => {
  return (
    <a href={url} className='relative flex flex-col gap-3 hover:bg-secondary-200 hover:border hover:px-[7px] hover:py-[11px] border-secondary-100 w-fit px-2 py-3 rounded-md cursor-pointer'>
      <div className="h-[170px] w-[170px] ">
        <Image height={170} width={170} src={thumbnail} alt="profile" className='border-2 border-secondary-200 rounded-lg' />
      </div>
      <div>
        <h2>{name}</h2>
        <h3 className='text-secondary-100 text-sm uppercase'>{`CR: ${credits}`}</h3>
      </div>
    </a>
  )
}

export default Profile
