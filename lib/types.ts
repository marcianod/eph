import { ObjectId } from 'mongodb';

export interface Attack {
    _id?: ObjectId;
    start: Date;
    end?: Date;
    intensity?: number | '–'; // 1-10 or placeholder when active
    isActive: boolean;
    notes?: string;
}

export interface Medication {
    _id?: ObjectId;
    timestamp: Date;
    name: string; // 'ibuprofen' | 'indomethacin' | 'custom'
    dosage: number; // mg
    attackId?: ObjectId; // Optional link to an active attack
}

export interface Prediction {
    time: Date;
    confidence: number; // 0-100
    type: 'within_cluster' | 'cluster_start';
    detail?: string;
    insights?: string[];
}

export type ActionType = 'start' | 'end';

export interface ActionRequest {
    action: ActionType;
    intensity?: number;
    endTime?: string; // ISO string
}

export interface ActionResponse {
    success: boolean;
    message: string;
    data?: any;
}
