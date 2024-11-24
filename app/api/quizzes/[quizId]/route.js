'use server';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/app/models/Quiz';
import User from '@/app/models/User';
import CompletedQuiz from '@/app/models/CompletedQuiz';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const quiz = await Quiz.findById(params.quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
    }

    // For students, check if they can access this quiz
    if (user.role === 'student') {
      // Check if quiz matches student's niveau
      if (quiz.niveau !== user.niveau) {
        return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
      }

      // Remove correct answers from questions
      const quizForStudent = quiz.toObject();
      quizForStudent.questions = quizForStudent.questions.map(q => ({
        ...q,
        correctOption: undefined
      }));

      return NextResponse.json(quizForStudent);
    }

    // For admin, return full quiz data
    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const data = await request.json();
    const quiz = await Quiz.findByIdAndUpdate(params.quizId, data, {
      new: true,
      runValidators: true
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error updating quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Delete the quiz and all related completed quizzes
    await Promise.all([
      Quiz.findByIdAndDelete(params.quizId),
      CompletedQuiz.deleteMany({ quizId: params.quizId })
    ]);

    return NextResponse.json({ message: 'Quiz supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
