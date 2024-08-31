import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import toast from 'react-hot-toast'

const useFollow = () => {
    
    const queryClient = useQueryClient()
	const { mutate: follow, isPending,data } = useMutation({
		mutationFn: async (userId) => {
			try {

				const res = await fetch(`api/users/follow/${userId}`, {
					method: "POST",
					headers: {
						"content-type": "application/json"
					},
				})
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Unable to create post");
				if (data.error) throw new Error(data.error)
                    return data
			} catch (error) {
				throw new Error(error.message)
			}
		},
		onSuccess: () => {
			
			toast.success("Followed Successful")

            Promise.all([
                queryClient.invalidateQueries({ queryKey: ["suggestedUser"] }),
                queryClient.invalidateQueries({ queryKey: ["authUser"] })
            ])
			

		},
        onerror:()=>{
            toast.error(error.message)
        }
		
	})
    return {follow,isPending}
}

export default useFollow