import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import CompletedQuiz from '@/app/models/CompletedQuiz';
import { startOfWeek, startOfMonth, startOfYear, format } from 'date-fns';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await dbConnect();

    // Get time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'week';

    // Calculate start date based on time range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = startOfYear(now);
        break;
      default:
        startDate = startOfWeek(now);
    }

    // Base query for the selected time range
    const timeQuery = {
      completedAt: { $gte: startDate }
    };

    // Get overview statistics
    const overview = await CompletedQuiz.aggregate([
      { $match: timeQuery },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          totalQuizzes: { $sum: 1 },
          averageTimeSpent: { $avg: '$timeSpent' },
          successCount: {
            $sum: { $cond: [{ $gte: ['$score', 60] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageScore: 1,
          totalQuizzes: 1,
          averageTimeSpent: 1,
          successRate: {
            $multiply: [
              { $divide: ['$successCount', '$totalQuizzes'] },
              100
            ]
          }
        }
      }
    ]).exec();

    // Get score distribution
    const scoreDistribution = await CompletedQuiz.aggregate([
      { $match: timeQuery },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ['$score', 80] }, then: 'excellent' },
                { case: { $gte: ['$score', 60] }, then: 'good' },
                { case: { $lt: ['$score', 60] }, then: 'needsImprovement' }
              ]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]).exec();

    // Transform score distribution into required format
    const distributionMap = scoreDistribution.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      excellent: 0,
      good: 0,
      needsImprovement: 0
    });

    // Get quiz completion over time
    const quizCompletion = await CompletedQuiz.aggregate([
      { $match: timeQuery },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$completedAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1
        }
      }
    ]).exec();

    // Get average scores by niveau
    const averageScoresByNiveau = await CompletedQuiz.aggregate([
      { $match: timeQuery },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.niveau',
          averageScore: { $avg: '$score' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          niveau: '$_id',
          averageScore: 1,
          count: 1
        }
      },
      { $sort: { niveau: 1 } }
    ]).exec();

    return NextResponse.json({
      overview: overview[0] || {
        averageScore: 0,
        totalQuizzes: 0,
        averageTimeSpent: 0,
        successRate: 0
      },
      scoreDistribution: distributionMap,
      quizCompletion,
      averageScoresByNiveau
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}
