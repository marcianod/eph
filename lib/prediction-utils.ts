import { Attack, Prediction, PredictionResult, PredictionMetadata, RawAttackInfo } from './types';
import {
    differenceInHours,
    addHours,
    startOfHour,
    getHours,
    addDays,
    setHours,
    setMinutes,
    setSeconds,
    setMilliseconds
} from 'date-fns';

/**
 * Standard deviation helper
 */
function getStandardDeviation(array: number[], mean: number): number {
    if (array.length <= 1) return 0;
    const squareDiffs = array.map((value) => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / array.length;
    return Math.sqrt(avgSquareDiff);
}

export function predictNextAttack(attacks: Attack[]): PredictionResult {
    const now = new Date();
    const CLUSTER_THRESHOLD = 12;

    const emptyMetadata: PredictionMetadata = {
        iats: [],
        meanIat: 0,
        stdDevIat: 0,
        cv: 0,
        regularityLabel: 'Insufficient Data',
        hourCounts: {},
        topHour: null,
        attacks: []
    };

    // 1. Sort attacks chronologically (oldest to newest) for interval analysis
    const sortedAttacks = [...attacks].sort((a, b) => a.start.getTime() - b.start.getTime());

    if (sortedAttacks.length < 3) {
        return {
            predictions: [{
                time: addDays(startOfHour(now), 1),
                confidence: 15,
                type: 'cluster_start',
                detail: 'Insufficient historical data for a robust prediction.'
            }],
            insights: ['Need at least 3 attacks to calculate regularity.'],
            metadata: emptyMetadata
        };
    }

    // 2. Calculate Inter-Arrival Times (IAT) in hours and map for metadata
    const iats: number[] = [];
    const metaAttacks: RawAttackInfo[] = [];

    for (let i = 0; i < sortedAttacks.length; i++) {
        const current = sortedAttacks[i];
        const previous = i > 0 ? sortedAttacks[i - 1] : null;
        let iat = null;
        let isClusterStart = true;

        if (previous) {
            iat = Math.abs(differenceInHours(current.start, previous.start));
            iats.push(iat);
            isClusterStart = iat > CLUSTER_THRESHOLD;
        }

        metaAttacks.push({
            timestamp: current.start,
            iatHours: iat,
            isClusterStart
        });
    }

    // 3. Statistical Analysis of Regularity (Coefficient of Variation)
    // We filter out "Remissions" (> 14 days) from the CV calculation to avoid skewing
    // the regularity score of the actual active phases.
    const REMISSION_THRESHOLD = 336; // 14 days
    const activeIats = iats.filter(iat => iat <= REMISSION_THRESHOLD);

    const meanIat = activeIats.length > 0 ? activeIats.reduce((a, b) => a + b, 0) / activeIats.length : 0;
    const stdDevIat = getStandardDeviation(activeIats, meanIat);

    // CV = StdDev / Mean. Lower CV means more regular.
    // CV < 0.5 is very regular (Periodic)
    // CV ~ 1.0 is random (Poisson)
    // CV > 1.0 is bursty/clustered
    const cv = meanIat > 0 ? stdDevIat / meanIat : 1;
    const regularityLabel = cv < 0.3 ? 'Very High' : cv < 0.6 ? 'High' : cv < 0.9 ? 'Moderate' : 'Low';

    // Base confidence starts at 80, penalized by CV
    // If CV is 0 (perfect interval), confidence is 100.
    // If CV is 1 (random), confidence drops to ~30.
    let regularityConfidence = Math.max(10, Math.min(100, Math.round(100 * (1 - Math.min(cv, 0.9)))));

    // 4. Identify Clusters and Within-Cluster Intervals
    // Define a cluster threshold (if attacks are < 12h apart)
    const withinClusterIats = iats.filter(iat => iat <= CLUSTER_THRESHOLD);

    const medianWithinClusterIat = withinClusterIats.length > 0
        ? [...withinClusterIats].sort((a, b) => a - b)[Math.floor(withinClusterIats.length / 2)]
        : 4;

    // 5. Detect Diurnal Pattern (Common hour of day)
    const hourCounts: Record<number, number> = {};
    sortedAttacks.forEach(a => {
        const h = getHours(a.start);
        hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const commonHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .filter(entry => entry[1] > 1); // Only count hours that happen more than once

    const topHour = commonHours.length > 0 ? parseInt(commonHours[0][0]) : null;

    // 6. Generate Predictions
    const predictions: Prediction[] = [];
    const lastAttack = sortedAttacks[sortedAttacks.length - 1];
    const hoursSinceLast = differenceInHours(now, lastAttack.start);

    // Scenario A: Within current cluster
    if (hoursSinceLast < CLUSTER_THRESHOLD) {
        const nextTime = addHours(lastAttack.start, medianWithinClusterIat);
        if (nextTime > now) {
            predictions.push({
                time: nextTime,
                confidence: Math.round(regularityConfidence * 0.9), // Slightly lower confidence within cluster
                type: 'within_cluster',
                detail: `Expected next attack in cycle based on typical ${Math.round(medianWithinClusterIat)}h interval.`
            });
        }
    }

    // Scenario B: Daily recurrence (Diurnal)
    if (topHour !== null) {
        let diurnalTime = setHours(
            setMinutes(
                setSeconds(
                    setMilliseconds(new Date(now), 0),
                    0),
                0),
            topHour);

        if (diurnalTime <= now) {
            diurnalTime = addDays(diurnalTime, 1);
        }

        predictions.push({
            time: diurnalTime,
            confidence: Math.round(regularityConfidence * (commonHours[0][1] / sortedAttacks.length + 0.3)),
            type: 'cluster_start',
            detail: `Pattern detected: Attacks frequently occur around ${topHour}:00.`
        });
    }

    // Fallback/Mean-based: Always provide if predictions are sparse or regularity is high
    const meanTime = addHours(lastAttack.start, meanIat);
    if (meanTime > now && (predictions.length === 0 || regularityConfidence > 50)) {
        predictions.push({
            time: meanTime,
            confidence: Math.round(regularityConfidence * 0.8),
            type: 'cluster_start',
            detail: `Based on your average interval of ${Math.round(meanIat)} hours.`
        });
    }

    // If still nothing (e.g. all predicted times are in the past), force a tomorrow prediction
    if (predictions.length === 0) {
        predictions.push({
            time: addDays(startOfHour(now), 1),
            confidence: 10,
            type: 'cluster_start',
            detail: 'Generic prediction based on daily cycle.'
        });
    }

    // 7. Generate Insights
    const insights = [
        `Pattern Regularity: ${regularityLabel} (Variability: ${Math.round(cv * 100)}%)`,
        `Average time between attacks: ${Math.round(meanIat)} hours.`,
    ];

    if (topHour !== null) {
        insights.push(`Most active hour: ${topHour}:00.`);
    }

    return {
        predictions: predictions
            .sort((a, b) => a.time.getTime() - b.time.getTime())
            .filter((p, i, self) => i === self.findIndex(t => t.time.getTime() === p.time.getTime())), // dedupe
        insights,
        metadata: {
            iats,
            meanIat,
            stdDevIat,
            cv,
            regularityLabel,
            hourCounts,
            topHour,
            attacks: metaAttacks
        }
    };
}
