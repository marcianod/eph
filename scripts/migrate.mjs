import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

const client = new MongoClient(uri);

function parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return undefined;
    // Format: D-M-YYYY HH:mm:ss
    const [datePart, timePart] = dateStr.trim().split(' ');
    const [day, month, year] = datePart.split('-').map(Number);
    const [hour, minute, second] = (timePart || '00:00:00').split(':').map(Number);

    // Note: month is 0-indexed in JS Date
    return new Date(year, month - 1, day, hour, minute, second);
}

async function migrate() {
    try {
        await client.connect();
        const db = client.db("headache-tracker");
        const collection = db.collection("attacks");

        const filePath = path.join(__dirname, '../legacy/historical records.txt');
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        const headers = lines[0].split('\t').map(h => h.trim());
        const records = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = line.split('\t');
            // Start Time	End Time	Intensity	Notes	Start Date
            // 0            1           2           3       4

            const startStr = cols[0];
            const endStr = cols[1];
            const intensityStr = cols[2];
            const notes = cols[3] || '';

            const start = parseDate(startStr);
            const end = parseDate(endStr);
            const intensity = intensityStr ? parseInt(intensityStr, 10) : undefined;

            if (start) {
                records.push({
                    start,
                    end,
                    intensity: isNaN(intensity) ? intensityStr : intensity,
                    isActive: false,
                    notes,
                });
            }
        }

        console.log(`Parsed ${records.length} records. Inserting...`);

        if (records.length > 0) {
            const result = await collection.insertMany(records);
            console.log(`Successfully inserted ${result.insertedCount} records.`);
        } else {
            console.log('No records found to migrate.');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.close();
    }
}

migrate();
