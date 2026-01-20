
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { predictNextAttack } from '@/lib/prediction-utils';
import { Attack } from '@/lib/types';

export async function GET() {
    try {
        const client = await clientPromise;
        // Use 'headache-tracker' database as per spec
        const db = client.db("headache-tracker");
        const collection = db.collection<Attack>("attacks");

        // Calculate date 18 months ago (approx 547 days)
        const observationWindow = new Date();
        observationWindow.setMonth(observationWindow.getMonth() - 18);

        // Query: start > observationWindow
        const attacks = await collection.find({
            start: { $gt: observationWindow }
        }).toArray();

        // Convert MongoDB documents to clean Attack objects and fix dates if needed
        // MongoDB driver returns Dates as Date objects usually.
        const cleanAttacks: Attack[] = attacks.map(a => ({
            ...a,
            start: new Date(a.start),
            end: a.end ? new Date(a.end) : undefined
        }));

        const result = predictNextAttack(cleanAttacks);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Prediction API Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to generate prediction" },
            { status: 500 }
        );
    }
}
