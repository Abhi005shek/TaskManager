import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '../types'
import { profileFormSchema, ProfileFormValues } from '../lib/validations'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState('')
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema)
  })

  const { data: response, isLoading } = useQuery<{status: string, data: User}>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/users/me`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    }
  })

  const user = response?.data

  useEffect(() => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
    }
  }, [user, setValue])

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to update profile');
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['currentUser'], updatedUser)
      setMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setMessage(''), 3000)
    },
    onError: () => {
      setMessage('Failed to update profile')
      setTimeout(() => setMessage(''), 3000)
    }
  })

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data)
  }

  const handleCancel = () => {
    if (user) {
      setValue('name', user.name)
      setValue('email', user.email)
    }
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20">
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
            </div>
          </div>
          
          <div className="p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                message.includes('success') 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <svg className={`w-5 h-5 ${
                  message.includes('success') ? 'text-emerald-600' : 'text-rose-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {message.includes('success') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="font-medium">{message}</span>
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    User Information
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Full Name</label>
                      <p className="text-lg font-medium text-slate-900">{user.name}</p>
                    </div>
                     <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Email Address</label>
                      <p className="text-lg font-medium text-slate-900">{user.email}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl">
                      <label className="block text-sm font-medium text-slate-600 mb-2">Member Since</label>
                      <p className="text-lg font-medium text-slate-900">
                        {new Date(user?.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        {...register('name')}
                        type="text"
                        id="name"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        {...register('email')}
                        type="email"
                        id="email"
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting || updateProfileMutation.isPending}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {(isSubmitting || updateProfileMutation.isPending) && <LoadingSpinner size="sm" />}
                    {isSubmitting || updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
