import React from 'react'

const Profile = ({url, thumbnail="https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg", name, credits}) => {
  return (
    <a href={url} className='flex flex-col gap-3 hover:bg-secondary-200 hover:border hover:px-[7px] hover:py-[11px] border-secondary-100 w-fit px-2 py-3 rounded-md cursor-pointer'>
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
