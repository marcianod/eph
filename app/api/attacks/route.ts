import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { Attack } from '@/lib/types';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("headache-tracker");
        const attacksCollection = db.collection<Attack>("attacks");

        // Fetch last 50 attacks, sorted by start date desc
        const attacks = await attacksCollection
            .find({})
            .sort({ start: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({
            success: true,
            data: attacks
        });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
