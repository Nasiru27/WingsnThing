import clientPromise from './mongodb';
import { SavableState } from '@/context/AppContext';

const DB_NAME = 'WingsnThingsDB';
const COLLECTION_NAME = 'settings';
const SETTINGS_ID = 'main_settings';

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection<Omit<SavableState, '_id'>>(COLLECTION_NAME);
}

export async function getInitialServerData(): Promise<SavableState> {
  console.log("Fetching initial data from MongoDB Atlas...");
  const collection = await getCollection();
  
  // THE FIX IS HERE: Add `as any` to allow searching by a string _id.
  let data = await collection.findOne({ _id: SETTINGS_ID } as any);

  if (!data) {
    console.log("No data found in MongoDB. Your app will use the default settings. Go to the admin page and click 'Save All Changes' to create the first database entry.");
    return {
      restaurantName: 'My Restaurant',
      currency: '$',
      adminPassword: 'password',
      waiterPassword: 'password',
      categories: ['Appetizers', 'Main Courses'],
      menuItems: [],
      backgroundImage: '',
      headerBgColor: 'rgba(255, 255, 255, 0.8)',
      headerTextColor: '#1e2b3c',
      logoUrl: '',
      logoType: 'text',
      textColor: '#1e2b3c',
    };
  }
  
  console.log("Initial data fetched successfully from MongoDB.");
  const { _id, ...rest } = data;
  return rest as SavableState;
}

export async function writeDb(data: SavableState) {
  try {
    console.log("Writing data to MongoDB Atlas...");
    const collection = await getCollection();
    
    // THE FIX IS HERE: Add `as any` to allow replacing by a string _id.
    await collection.replaceOne({ _id: SETTINGS_ID } as any, data, { upsert: true });
    console.log("Successfully wrote data to MongoDB.");
  } catch (error) {
    console.error('Error writing to MongoDB:', error);
    throw new Error('Could not write to database.');
  }
}