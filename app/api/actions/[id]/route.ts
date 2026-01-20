import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { start, end, intensity, isActive, notes } = body;

        const client = await clientPromise;
        const db = client.db("headache-tracker");
        const attacksCollection = db.collection("attacks");

        const updateData: any = {};
        if (start) updateData.start = new Date(start);
        if (end) updateData.end = new Date(end);
        if (intensity !== undefined) updateData.intensity = intensity;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (notes !== undefined) updateData.notes = notes;

        // Recalculate duration if start or end is provided
        if (updateData.start || updateData.end) {
            const current = await attacksCollection.findOne({ _id: new ObjectId(id) });
            if (current) {
                const finalStart = updateData.start || new Date(current.start);
                const finalEnd = updateData.end || (current.end ? new Date(current.end) : null);

                if (finalStart && finalEnd) {
                    updateData.duration = finalEnd.getTime() - finalStart.getTime();
                }
            }
        }

        const result = await attacksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ success: false, message: 'Attack not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Attack updated.' });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const client = await clientPromise;
        const db = client.db("headache-tracker");
        const attacksCollection = db.collection("attacks");

        const result = await attacksCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, message: 'Attack not found.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Attack deleted.' });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
