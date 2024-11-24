import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// GET all users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();
    
    // Get role from query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    // Build query
    const query = role ? { role } : {};
    
    // Fetch users based on query
    const users = await User.find(query).select('-password');

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new user
export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    console.log('Received user data:', { ...data, password: '[REDACTED]' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with hashed password
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Detailed error creating user:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
