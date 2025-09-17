import { NextResponse } from 'next/server';
import { getInitialServerData } from '@/lib/data';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-for-local-dev');

export async function POST(request: Request) {
  try {
    const { role, password } = await request.json();
    
    // Fetch the current data from MongoDB. This function is smart and will
    // return the default data if the database is empty.
    const db = await getInitialServerData(); 

    const correctPassword = role === 'admin' ? db.adminPassword : db.waiterPassword;

    // This is the crucial check. It compares the password you entered
    // with the one loaded from the database (or the default one).
    if (password === correctPassword) {
      const token = await new SignJWT({ role })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
      
      const response = NextResponse.json({ success: true, role });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    } else {
      // If the passwords do not match, send back the "Invalid credentials" error.
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    console.error("CRITICAL ERROR IN LOGIN API:", error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}