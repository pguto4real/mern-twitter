import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skelentons/RightPanelSkelenton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const RightPanel = () => {
	
	const queryClient = useQueryClient()
	const { mutate: mutateSuggestedUser, isPending,isLoading, error, isError, data:suggestedUser } = useMutation({
		mutationFn: async ({ text, img }) => {
			try {

				const res = await fetch("api/users/suggested", {
					method: "POST",
	
				})
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Unable to create post");
				if (data.error) throw new Error(data.error)
			} catch (error) {
				throw error
			}
		},
		onSuccess: () => {
			
			// toast.success("Post Created Successful")
			// queryClient.invalidateQueries({ queryKey: ["posts"] })

		}
		
	})
	console.log(suggestedUser)
	useEffect(() => {
		mutateSuggestedUser()
	}, [mutateSuggestedUser])
	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUser?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className='flex items-center justify-between gap-4'
								key={user._id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.username}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => e.preventDefault()}
									>
										Follow
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;