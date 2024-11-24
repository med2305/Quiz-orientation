import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Advice from '@/app/models/Advice';
import User from '@/app/models/User';

// GET advice (for both students and counselors)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Get user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    let query = {};
    if (user.role === 'student') {
      query.studentId = user._id;
    } else if (user.role === 'conseiller') {
      query.conseillerId = user._id;
    } else {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const advice = await Advice.find(query)
      .populate('conseillerId', 'nom prenom email')
      .populate('studentId', 'nom prenom email')
      .sort({ createdAt: -1 });

    return NextResponse.json(advice, { status: 200 });
  } catch (error) {
    console.error('Error fetching advice:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST new advice (counselors only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Get counselor
    const counselor = await User.findOne({ email: session.user.email });
    if (!counselor || counselor.role !== 'conseiller') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    const { studentId, message } = data;

    // Validate student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Étudiant non trouvé' }, { status: 404 });
    }

    // Create advice
    const advice = await Advice.create({
      conseillerId: counselor._id,
      studentId,
      message
    });

    // Populate counselor and student info
    const populatedAdvice = await Advice.findById(advice._id)
      .populate('conseillerId', 'nom prenom email')
      .populate('studentId', 'nom prenom email');

    return NextResponse.json(populatedAdvice, { status: 201 });
  } catch (error) {
    console.error('Error creating advice:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// PATCH update advice status (students only)
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Get student
    const student = await User.findOne({ email: session.user.email });
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    const { adviceId } = data;

    // Update advice status
    const advice = await Advice.findOneAndUpdate(
      { _id: adviceId, studentId: student._id },
      { status: 'read' },
      { new: true }
    )
      .populate('conseillerId', 'nom prenom email')
      .populate('studentId', 'nom prenom email');

    if (!advice) {
      return NextResponse.json({ error: 'Conseil non trouvé' }, { status: 404 });
    }

    return NextResponse.json(advice, { status: 200 });
  } catch (error) {
    console.error('Error updating advice:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
