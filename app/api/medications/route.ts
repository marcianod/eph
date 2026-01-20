import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Medication } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const client = await clientPromise;
        const db = client.db("headache-tracker");
        const collection = db.collection("medications");

        const newMedication: Medication = {
            timestamp: new Date(),
            name: body.name,
            dosage: body.dosage,
            attackId: body.attackId // Optional
        };

        const result = await collection.insertOne(newMedication);

        return NextResponse.json({
            success: true,
            message: 'Medication logged.',
            data: { id: result.insertedId }
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
