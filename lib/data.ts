import fs from 'fs';
import path from 'path';
import { SavableState } from '@/context/AppContext';

const DB_PATH = path.join(process.cwd(), 'data.json');

// Create default data if file doesn't exist
function initializeDb(): SavableState {
    console.log("Database is empty. Initializing with default values...");
    const defaultData: SavableState = {
        restaurantName: 'My Awesome Restaurant',
        currency: '$',
        adminPassword: 'password',
        waiterPassword: 'password',
        backgroundImage: '',
        headerBgColor: 'rgba(255, 255, 255, 0.8)',
        headerTextColor: '#1e293b',
        categories: ['Appetizers', 'Main Courses', 'Desserts', 'Drinks'],
        menuItems: [],
        logoUrl: '',
        logoType: 'text',
        textColor: '#1e293b',
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    return defaultData;
}

export async function readDb(): Promise<SavableState> {
    try {
        if (!fs.existsSync(DB_PATH)) {
            return initializeDb();
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data) as SavableState;
    } catch (error) {
        console.error('Error reading local DB file:', error);
        throw new Error('Could not read from database.');
    }
}

export async function writeDb(data: SavableState) {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing to local DB file:', error);
        throw new Error('Could not write to database.');
    }
}

export async function getInitialServerData() {
    console.log("Fetching initial data from local DB file...");
    const data = await readDb();
    console.log("Initial data fetched successfully.");
    return data;
}
