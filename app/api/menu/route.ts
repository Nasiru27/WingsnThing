import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

let menuCache: any = null;

async function getMenuData() {
  if (menuCache) return menuCache;

  const client = await clientPromise;
  const db = client.db("restaurantdb"); // change to your DB name
  const settings = await db.collection("settings").findOne({});
  const categories = await db.collection("categories").find().toArray();
  const menuItems = await db.collection("menuItems").find().toArray();

  const data = {
    restaurantName: settings?.restaurantName || "My Restaurant",
    currency: settings?.currency || "USD",
    adminPassword: settings?.adminPassword || "",
    waiterPassword: settings?.waiterPassword || "",
    backgroundImage: settings?.backgroundImage || "",
    headerBgColor: settings?.headerBgColor || "#fff",
    headerTextColor: settings?.headerTextColor || "#000",
    categories,
    menuItems,
  };

  menuCache = data;
  return data;
}

function invalidateMenuCache() {
  menuCache = null;
}

async function verifyAdmin() {
  const tokenCookie = (await cookies()).get("auth_token");
  const token = tokenCookie?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const data = await getMenuData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    return NextResponse.json({ error: "Failed to fetch menu data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updatedData = await request.json();
    const client = await clientPromise;
    const db = client.db("restaurantdb");

    // Save settings
    await db.collection("settings").updateOne({}, { $set: updatedData }, { upsert: true });

    invalidateMenuCache();
    return NextResponse.json({ success: true, message: "Settings saved successfully" });
  } catch (error) {
    console.error("Failed to save settings:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
