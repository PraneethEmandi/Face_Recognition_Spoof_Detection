import React, { useState, useEffect } from 'react';
import AdminView from './components/AdminView';
import AttendanceView from './components/AttendanceView';
import { User, AttendanceRecord } from './types';
import * as apiService from './services/apiService';
import { Users, Building, ToggleLeft, ToggleRight, Sun, Moon, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAdminView, setIsAdminView] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data from the API service on mount
    const fetchData = async () => {
      setIsLoading(true);
      const [fetchedUsers, fetchedLogs] = await Promise.all([
        apiService.getUsers(),
        apiService.getAttendanceLog()
      ]);
      setUsers(fetchedUsers);
      setAttendanceLog(fetchedLogs);
      setIsLoading(false);
    };
    fetchData();
  }, []);


  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleRegisterUser = async (name: string, employeeId: string, profileImages: string[]): Promise<User> => {
    const newUser = await apiService.registerUser(name, employeeId, profileImages);
    setUsers(currentUsers => [...currentUsers, newUser]);
    return newUser;
  };

  const handleDeleteUser = async (userId: string) => {
    await apiService.deleteUser(userId);
    setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
  };
  
  const handleAddAttendance = async (user: User) => {
    const newRecord = await apiService.addAttendanceRecord(user);
    setAttendanceLog(currentLog => [...currentLog, newRecord]);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        <header className="bg-white dark:bg-gray-800 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center">
                <Building className="h-8 w-8 text-indigo-500" />
                <h1 className="ml-3 text-2xl font-bold">Gemini Smart Attendance</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                </button>
                <button
                  onClick={() => setIsAdminView(!isAdminView)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  {isAdminView ? <Users className="mr-2 h-5 w-5" /> : <ToggleRight className="mr-2 h-5 w-5" />}
                  {isAdminView ? 'User View' : 'Admin View'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
            </div>
          ) : isAdminView ? (
            <AdminView 
              users={users} 
              attendanceLog={attendanceLog} 
              onRegisterUser={handleRegisterUser}
              onDeleteUser={handleDeleteUser}
            />
          ) : (
            <AttendanceView 
              users={users} 
              onAddAttendance={handleAddAttendance} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
