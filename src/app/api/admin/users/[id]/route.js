/**
 * API Route: Single Admin User Management
 * PUT /api/admin/users/[id] - Update admin user
 * DELETE /api/admin/users/[id] - Delete admin user
 * PATCH /api/admin/users/[id] - Toggle admin status
 */

import dbConnect from '@/lib/dbConnect';
import Admin from '@/models/Admin';
import { authenticate, isAdmin, unauthorizedResponse, forbiddenResponse, hashPassword } from '@/lib/auth';
import { successResponse, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PUT(request, { params }) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (authData.role !== 'Super Admin') {
            return forbiddenResponse('Only Super Admin can update admin users');
        }

        const { id } = await params;
        const body = await request.json();

        await dbConnect();

        // Prepare update data
        const updateData = {};
        if (body.role) updateData.role = body.role;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;
        if (body.password) {
            updateData.password = await hashPassword(body.password);
        }

        // Update admin
        const admin = await Admin.findOneAndUpdate(
            { id: parseInt(id) },
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!admin) {
            return notFoundResponse('Admin user');
        }

        return successResponse(admin, 'Admin user updated successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function DELETE(request, { params }) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (authData.role !== 'Super Admin') {
            return forbiddenResponse('Only Super Admin can delete admin users');
        }

        const { id } = await params;

        await dbConnect();

        // Prevent deleting self
        const targetAdmin = await Admin.findOne({ id: parseInt(id) });
        if (targetAdmin && targetAdmin._id.toString() === authData.adminId) {
            return errorResponse('Cannot delete your own account', null, 400);
        }

        // Delete admin
        const admin = await Admin.findOneAndDelete({ id: parseInt(id) });

        if (!admin) {
            return notFoundResponse('Admin user');
        }

        return successResponse(null, 'Admin user deleted successfully');

    } catch (error) {
        return serverErrorResponse(error);
    }
}

export async function PATCH(request, { params }) {
    try {
        // Authenticate admin
        const authData = await authenticate(request);
        if (!authData || authData.type !== 'admin') {
            return unauthorizedResponse();
        }

        if (authData.role !== 'Super Admin') {
            return forbiddenResponse('Only Super Admin can toggle admin status');
        }

        const { id } = await params;

        await dbConnect();

        // Toggle status
        const admin = await Admin.findOne({ id: parseInt(id) });

        if (!admin) {
            return notFoundResponse('Admin user');
        }

        admin.isActive = !admin.isActive;
        await admin.save();

        return successResponse(
            {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                isActive: admin.isActive
            },
            `Admin user ${admin.isActive ? 'activated' : 'deactivated'} successfully`
        );

    } catch (error) {
        return serverErrorResponse(error);
    }
}
