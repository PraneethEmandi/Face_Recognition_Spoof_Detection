import { User, AttendanceRecord } from '../types';

// --- MOCK DATABASE using localStorage ---
// In a real application, these functions would make fetch calls to a backend server.

const FAKE_LATENCY = 300; // ms

const getStoredData = <T>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
        try {
            return JSON.parse(saved) as T;
        } catch (e) {
            console.error(`Failed to parse ${key} from localStorage`, e);
            return defaultValue;
        }
    }
    return defaultValue;
};

const setStoredData = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};


// --- USER API ---

export const getUsers = async (): Promise<User[]> => {
    console.log("API: Fetching users...");
    return new Promise(resolve => {
        setTimeout(() => {
            const users = getStoredData<User[]>('users', []);
            console.log("API: Found users.", users);
            resolve(users);
        }, FAKE_LATENCY);
    });
};

export const registerUser = async (name: string, employeeId: string, profileImageBase64: string[]): Promise<User> => {
    console.log("API: Registering new user...", { name, employeeId });
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getStoredData<User[]>('users', []);
            if (users.some(u => u.employeeId === employeeId)) {
                return reject(new Error('An employee with this ID is already registered.'));
            }
            const newUser: User = {
                id: crypto.randomUUID(),
                name,
                employeeId,
                profileImageBase64,
            };
            setStoredData('users', [...users, newUser]);
            console.log("API: User registered successfully.", newUser);
            resolve(newUser);
        }, FAKE_LATENCY);
    });
};

export const deleteUser = async (userId: string): Promise<void> => {
     console.log("API: Deleting user...", { userId });
     return new Promise(resolve => {
        setTimeout(() => {
            let users = getStoredData<User[]>('users', []);
            users = users.filter(user => user.id !== userId);
            setStoredData('users', users);
            console.log("API: User deleted.");
            resolve();
        }, FAKE_LATENCY);
    });
};


// --- ATTENDANCE API ---

export const getAttendanceLog = async (): Promise<AttendanceRecord[]> => {
    console.log("API: Fetching attendance log...");
    return new Promise(resolve => {
        setTimeout(() => {
            const log = getStoredData<AttendanceRecord[]>('attendanceLog', []);
            console.log("API: Found log.", log);
            resolve(log);
        }, FAKE_LATENCY);
    });
};

export const addAttendanceRecord = async (user: User): Promise<AttendanceRecord> => {
    console.log("API: Adding attendance record for user...", user.name);
     return new Promise(resolve => {
        setTimeout(() => {
            const newRecord: AttendanceRecord = {
                id: crypto.randomUUID(),
                userId: user.id,
                userName: user.name,
                employeeId: user.employeeId,
                timestamp: new Date().toISOString(),
            };
            const log = getStoredData<AttendanceRecord[]>('attendanceLog', []);
            setStoredData('attendanceLog', [...log, newRecord]);
            console.log("API: Record added.", newRecord);
            resolve(newRecord);
        }, FAKE_LATENCY);
    });
};
