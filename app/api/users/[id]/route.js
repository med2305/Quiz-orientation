import dbConnect from '@/lib/mongodb';
import User from '@/app/models/User';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// DELETE user
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    console.log('Deleting user with ID:', id);
    
    // Don't allow deletion of the last admin
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userToDelete = await User.findById(id);

    console.log('User to delete:', userToDelete); // Debug log
    
    if (userToDelete?.role === 'admin' && adminCount <= 1) {
      return NextResponse.json(
        { message: 'Cannot delete the last admin user' },
        { status: 400 }
      );
    }

    console.log('User to delete:', userToDelete); // Debug log

    const deletedUser = await User.findByIdAndDelete(id);
    
    console.log('Deleted user:', deletedUser); // Debug log

    if (!deletedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

// PUT (update) user
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const data = await request.json();

    // If password is provided, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      // If no password provided, remove it from the update data
      delete data.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
