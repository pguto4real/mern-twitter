
import LoadingSpinner from "../../component/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Notification from "./Notification";
import toast from "react-hot-toast";

const NotificationPage = () => {
	const queryClient = useQueryClient()
	const {isLoading, data:notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {

				const res = await fetch("/api/notifications")
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Unable to get notifications");
				if (data.error) throw new Error(data.error)
					return data;
			} catch (error) {
				throw error
			}
		}
		
	})
	
	const { mutate: deleteNotification } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/notifications`, {
					method: "DELETE",
				})
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Failed to delete Notifications");
				if (data.error) throw new Error(data.error)
				return data
			} catch (error) {
				throw new Error(error)
				
			}
		},
		onSuccess: () => {
			
			toast.success("Posts deleted Successful")
			queryClient.invalidateQueries({ queryKey: ["notifications"] })
		}
		,
		onError: () => {
		
			toast.error("cant find post")

		}

	})

	const deleteNotifications = () => {
		deleteNotification()
	};

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{!isLoading && notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{!isLoading && notifications?.length >0 && notifications?.map((notification) => (
					<Notification key={notification._id} notification={notification}/>
				))}
			</div>
		</>
	);
};
export default NotificationPage;