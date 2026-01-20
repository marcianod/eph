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
}

export interface RawAttackInfo {
    timestamp: Date;
    iatHours: number | null; // Hours from previous attack
    isClusterStart: boolean;
}

export interface PredictionMetadata {
    iats: number[];
    meanIat: number;
    stdDevIat: number;
    cv: number;
    regularityLabel: string;
    hourCounts: Record<number, number>;
    topHour: number | null;
    attacks: RawAttackInfo[];
}

export interface PredictionResult {
    predictions: Prediction[];
    insights: string[];
    metadata: PredictionMetadata;
}

export type ActionType = 'start' | 'end' | 'manual_add';

export interface ActionRequest {
    action: ActionType;
    intensity?: number;
    endTime?: string; // ISO string
    start?: string;   // For manual_add
    end?: string;     // For manual_add
    notes?: string;   // For manual_add
}

export interface ActionResponse {
    success: boolean;
    message: string;
    data?: any;
}
