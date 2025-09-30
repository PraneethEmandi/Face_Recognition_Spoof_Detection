import React, { useState } from 'react';
import { User, AttendanceRecord } from '../types';
import WebcamCapture from './WebcamCapture';
import { UserPlus, ListChecks, Trash2, Loader2 } from 'lucide-react';

interface AdminViewProps {
  users: User[];
  attendanceLog: AttendanceRecord[];
  onRegisterUser: (name: string, employeeId: string, profileImages: string[]) => Promise<any>;
  onDeleteUser: (userId: string) => Promise<void>;
}

const AdminView: React.FC<AdminViewProps> = ({ users, attendanceLog, onRegisterUser, onDeleteUser }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'log'>('register');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [profileImages, setProfileImages] = useState<string[] | null>(null);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !employeeId || !profileImages) {
      setError('All fields including a profile picture sequence are required.');
      return;
    }
    if(users.some(u => u.employeeId === employeeId)) {
      setError('An employee with this ID is already registered.');
      return;
    }

    setError('');
    setIsRegistering(true);
    try {
      await onRegisterUser(name, employeeId, profileImages);
      // Reset form on successful registration
      setName('');
      setEmployeeId('');
      setProfileImages(null);
    } catch (err: any) {
       setError(err.message || 'An unexpected error occurred.');
    } finally {
       setIsRegistering(false);
    }
  };

  const handleUserDelete = (userId: string) => {
    if(window.confirm('Are you sure you want to delete this user? This action cannot be undone.')){
        onDeleteUser(userId).catch(err => alert("Failed to delete user."));
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            }`}
          >
            <UserPlus className="mr-2 h-5 w-5"/>
            Register New User
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'log'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
            }`}
          >
            <ListChecks className="mr-2 h-5 w-5"/>
            Attendance Log
          </button>
        </nav>
      </div>

      {activeTab === 'register' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Enroll New User</h2>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" disabled={isRegistering} />
              </div>
              <div>
                <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
                <input type="text" id="employeeId" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" disabled={isRegistering} />
              </div>
               <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50" disabled={isRegistering}>
                {isRegistering ? <Loader2 className="animate-spin h-5 w-5" /> : 'Register User'}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
             <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</p>
              {profileImages ? (
                <div className="relative w-full max-w-md">
                   <div className="grid grid-cols-3 gap-2 p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                    {profileImages.map((img, index) => (
                      <img key={index} src={img} alt={`Capture ${index + 1}`} className="rounded-md shadow-sm aspect-square object-cover" />
                    ))}
                  </div>
                  <button onClick={() => setProfileImages(null)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 disabled:opacity-50" disabled={isRegistering}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <WebcamCapture onCapture={setProfileImages} buttonText="Start Capture Sequence" />
              )}
            </div>
          </form>
          <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Registered Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Photo</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                      <th scope="col" className="relative px-6 py-3"><span className="sr-only">Delete</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><img src={user.profileImageBase64[0]} alt={user.name} className="h-10 w-10 rounded-full object-cover"/></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleUserDelete(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div>
           <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Attendance Log</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {[...attendanceLog].reverse().map(record => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.userName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{record.employeeId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(record.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
