import NotificationSystem from '../components/NotificationSystem'

const Notifications = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-500 mt-1">
                  Manage your notifications here
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-3">
            <NotificationSystem />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications
