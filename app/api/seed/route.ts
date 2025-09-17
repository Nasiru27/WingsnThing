import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

const DB_NAME = 'WingsnThingsDB';
const COLLECTION_NAME = 'settings';
const SETTINGS_ID = 'main_settings';

export async function GET() {
  try {
    console.log("--- Starting database seed process ---");

    const filePath = path.join(process.cwd(), 'data.json');
    console.log(`Reading master data from: ${filePath}`);
    if (!fs.existsSync(filePath)) {
      throw new Error("data.json file not found in project root!");
    }
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const dataToUpload = JSON.parse(fileContent);
    console.log(`Successfully read data for restaurant: "${dataToUpload.restaurantName}"`);

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    console.log("Successfully connected to MongoDB.");

    // THE FIX IS HERE: We add `as any` to tell TypeScript to allow a string for the _id.
    await collection.replaceOne({ _id: SETTINGS_ID } as any, dataToUpload, { upsert: true });
    console.log("--- Database seed process completed successfully! ---");

    return NextResponse.json({ 
      success: true, 
      message: 'Database has been successfully populated with your data.json file!' 
    });
  } catch (error: any) {
    console.error("!!! ERROR DURING DATABASE SEED !!!", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}