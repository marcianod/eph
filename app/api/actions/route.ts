import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ActionRequest } from '@/lib/types';

export async function POST(request: Request) {
    try {
        const body: ActionRequest = await request.json();
        const { action, intensity, endTime } = body;
        const client = await clientPromise;
        const db = client.db("headache-tracker");
        const attacksCollection = db.collection("attacks");

        if (action === 'start') {
            // Check if there is already an active attack
            const activeAttack = await attacksCollection.findOne({ isActive: true });
            if (activeAttack) {
                return NextResponse.json({ success: false, message: 'An attack is already active.' }, { status: 400 });
            }

            const newAttack = {
                start: new Date(),
                intensity: '–', // Placeholder until ended
                isActive: true,
                created_at: new Date()
            } as any; // Cast for now as intensity is '–' but expected number/undefined in some contexts

            await attacksCollection.insertOne(newAttack);
            return NextResponse.json({ success: true, message: 'Attack started.' });

        } else if (action === 'end') {
            // Find the active attack
            const activeAttack = await attacksCollection.findOne({ isActive: true });

            if (!activeAttack) {
                return NextResponse.json({ success: false, message: 'No active attack found to end.' }, { status: 404 });
            }

            // Calculate end time
            const end = endTime ? new Date(endTime) : new Date();

            // Update the attack
            await attacksCollection.updateOne(
                { _id: activeAttack._id },
                {
                    $set: {
                        isActive: false,
                        end: end,
                        intensity: intensity || activeAttack.intensity,
                        duration: end.getTime() - new Date(activeAttack.start).getTime()
                    }
                }
            );

            return NextResponse.json({ success: true, message: 'Attack ended.' });
        }

        return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, message: e.message || 'Internal Server Error' }, { status: 500 });
    }
}
