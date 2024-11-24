'use server';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Quiz from '@/app/models/Quiz';
import User from '@/app/models/User';
import CompletedQuiz from '@/app/models/CompletedQuiz';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    await dbConnect();

    // Get user with population
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Only students can submit quizzes
    if (user.role !== 'student') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { quizId, answers, timeSpent } = await request.json();

    // Get quiz with population
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 });
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      return NextResponse.json({ error: 'Réponses invalides' }, { status: 400 });
    }

    // Calculate score and mark correct answers
    let correctAnswers = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const isCorrect = answer.selectedOption === quiz.questions[index].correctOption;
      if (isCorrect) correctAnswers++;
      return {
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        correct: isCorrect
      };
    });

    const score = (correctAnswers / quiz.questions.length) * 100;

    // Check if quiz was previously completed and update if it exists
    const existingCompletion = await CompletedQuiz.findOne({
      userId: user._id,
      quizId: quiz._id
    });

    let completion;
    if (existingCompletion) {
      // Update existing completion
      completion = await CompletedQuiz.findByIdAndUpdate(
        existingCompletion._id,
        {
          score,
          answers: gradedAnswers,
          timeSpent,
          completedAt: new Date()
        },
        { new: true }
      );
    } else {
      // Create new completion
      completion = await CompletedQuiz.create({
        userId: user._id,
        quizId: quiz._id,
        score,
        answers: gradedAnswers,
        timeSpent,
        completedAt: new Date()
      });
    }

    // Populate the completion with user and quiz details for the admin dashboard
    const populatedCompletion = await CompletedQuiz.findById(completion._id)
      .populate('userId', 'name email')
      .populate('quizId', 'title niveau');

    return NextResponse.json({
      score,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      timeSpent,
      completion: {
        _id: populatedCompletion._id,
        user: {
          name: populatedCompletion.userId.name,
          email: populatedCompletion.userId.email
        },
        quiz: {
          title: populatedCompletion.quizId.title,
          niveau: populatedCompletion.quizId.niveau
        },
        score: populatedCompletion.score,
        timeSpent: populatedCompletion.timeSpent,
        completedAt: populatedCompletion.completedAt
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
