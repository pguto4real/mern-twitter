import React from 'react'
import { FaComment, FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { Link } from "react-router-dom";
const Notification = ({notification}) => {
  return (
    <div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "commented" && <FaComment className='w-7 h-7 text-primary' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									
									{notification.type === "follow" ? "followed you" :notification.type === "like"  ?"liked your post":"commented on your post"}
								</div>
							</Link>
						</div>
					</div>
  )
}

export default Notification