import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/app/models/User';
import Formation from '@/app/models/Formation';
import University from '@/app/models/University';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    // Get total counts
    const [
      totalStudents,
      totalCounselors,
      totalFormations,
      totalUniversities,
      recentStudents,
      recentCounselors,
      recentFormations
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'conseiller' }),
      Formation.countDocuments(),
      University.countDocuments(),
      // Recent students (last 30 days)
      User.find({
        role: 'student',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5),
      // Recent counselors (last 30 days)
      User.find({
        role: 'conseiller',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5),
      // Recent formations (last 30 days)
      Formation.find({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate monthly growth for students
    const lastMonthStudents = await User.countDocuments({
      role: 'student',
      createdAt: {
        $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    const thisMonthStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const studentGrowth = lastMonthStudents === 0 
      ? 100 
      : Math.round(((thisMonthStudents - lastMonthStudents) / lastMonthStudents) * 100);

    // Format recent activity
    const recentActivity = [
      ...recentCounselors.map(counselor => ({
        type: 'conseiller',
        message: 'Nouveau conseiller inscrit',
        timestamp: counselor.createdAt,
        color: 'green'
      })),
      ...recentStudents.map(student => ({
        type: 'student',
        message: 'Nouvel étudiant inscrit',
        timestamp: student.createdAt,
        color: 'primary'
      })),
      ...recentFormations.map(formation => ({
        type: 'formation',
        message: 'Nouvelle formation ajoutée',
        timestamp: formation.createdAt,
        color: 'purple'
      }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return new Response(JSON.stringify({
      stats: {
        students: {
          total: totalStudents,
          growth: studentGrowth
        },
        counselors: {
          total: totalCounselors,
          active: totalCounselors // You might want to add an 'active' field to the user model
        },
        formations: {
          total: totalFormations,
          available: totalFormations // You might want to add a 'status' field to the formation model
        },
        universities: {
          total: totalUniversities,
          partners: totalUniversities // You might want to add a 'partner' field to the university model
        }
      },
      recentActivity
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
