import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Formation from '@/app/models/Formation';

export async function GET() {
  try {
    await dbConnect();
    const formations = await Formation.find({});
    return NextResponse.json(formations);
  } catch (error) {
    console.error('Error fetching formations:', error);
    return NextResponse.json({ error: 'Failed to fetch formations' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['nom', 'specialite', 'niveauMinRequis'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const formation = new Formation(data);
    const savedFormation = await formation.save();
    
    return NextResponse.json(savedFormation, { status: 201 });
  } catch (error) {
    console.error('Error creating formation:', error);
    return NextResponse.json(
      { error: `Failed to create formation: ${error.message}` },
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
        { error: 'Formation ID is required' },
        { status: 400 }
      );
    }

    const requiredFields = ['nom', 'specialite', 'niveauMinRequis'];
    const missingFields = requiredFields.filter(field => !updateData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedFormation = await Formation.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedFormation) {
      return NextResponse.json(
        { error: 'Formation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFormation);
  } catch (error) {
    console.error('Error updating formation:', error);
    return NextResponse.json(
      { error: `Failed to update formation: ${error.message}` },
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
        { error: 'Formation ID is required' },
        { status: 400 }
      );
    }

    const deletedFormation = await Formation.findByIdAndDelete(id);

    if (!deletedFormation) {
      return NextResponse.json(
        { error: 'Formation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Formation deleted successfully' });
  } catch (error) {
    console.error('Error deleting formation:', error);
    return NextResponse.json(
      { error: `Failed to delete formation: ${error.message}` },
      { status: 500 }
    );
  }
}
