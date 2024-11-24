import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import University from '@/app/models/University';

export async function GET() {
  try {
    await dbConnect();
    const universities = await University.find({});
    return NextResponse.json(universities);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['nom', 'specialite'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Ensure specialite is an array
    if (!Array.isArray(data.specialite)) {
      data.specialite = [data.specialite];
    }

    const university = new University(data);
    const savedUniversity = await university.save();
    
    return NextResponse.json(savedUniversity, { status: 201 });
  } catch (error) {
    console.error('Error creating university:', error);
    return NextResponse.json(
      { error: `Failed to create university: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, ...updateData } = data;

    if (!_id) {
      return NextResponse.json(
        { error: 'University ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['nom', 'specialite'];
    const missingFields = requiredFields.filter(field => !updateData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Ensure specialite is an array
    if (!Array.isArray(updateData.specialite)) {
      updateData.specialite = [updateData.specialite];
    }

    const updatedUniversity = await University.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedUniversity) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUniversity);
  } catch (error) {
    console.error('Error updating university:', error);
    return NextResponse.json(
      { error: `Failed to update university: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'University ID is required' },
        { status: 400 }
      );
    }

    const deletedUniversity = await University.findByIdAndDelete(id);

    if (!deletedUniversity) {
      return NextResponse.json(
        { error: 'University not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    return NextResponse.json(
      { error: `Failed to delete university: ${error.message}` },
      { status: 500 }
    );
  }
}
