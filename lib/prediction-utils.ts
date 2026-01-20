
import { Attack, Prediction } from './types';

interface PredictionResult {
    predictions: Prediction[];
    insights: string[];
}

export function predictNextAttack(attacks: Attack[]): PredictionResult {
    // 1. Filter for valid data (last 30 days is handled by the caller/DB query, but good to be safe)
    // The GAS code sorts newest first.
    const sortedAttacks = [...attacks].sort((a, b) => b.start.getTime() - a.start.getTime());

    if (sortedAttacks.length < 2) {
        return {
            predictions: [{
                time: new Date(Date.now() + (24 * 60 * 60 * 1000)),
                confidence: 20,
                type: 'cluster_start', // Fallback type
                detail: 'Insufficient data'
            }],
            insights: ['Limited data available']
        };
    }

    // 2. Find clusters
    // A cluster is defined by attacks happening within 12 hours of each other
    const clusters: Attack[][] = [];
    let currentCluster: Attack[] = [sortedAttacks[0]];

    for (let i = 1; i < sortedAttacks.length; i++) {
        const lastAttackInCluster = currentCluster[currentCluster.length - 1];
        const hoursSinceLastAttack = Math.abs(sortedAttacks[i].start.getTime() - lastAttackInCluster.start.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastAttack > 12) {
            // New cluster found
            // pushed currentCluster to clusters
            clusters.push(currentCluster);
            currentCluster = [sortedAttacks[i]];
        } else {
            currentCluster.push(sortedAttacks[i]);
        }
    }
    clusters.push(currentCluster);

    // 3. Calculate typical intervals within clusters
    const withinClusterIntervals: number[] = [];
    clusters.forEach(cluster => {
        if (cluster.length > 1) {
            // Cluster is newest-first, so iterate backwards or just diff adjacent
            // But logic in GAS was:
            // for (let i = 0; i < cluster.length - 1; i++)
            //   diff(cluster[i+1], cluster[i])
            // Since cluster is [newest, ..., oldest], cluster[i] > cluster[i+1]
            // so cluster[i].start - cluster[i+1].start is positive
            for (let i = 0; i < cluster.length - 1; i++) {
                const diffHours = Math.abs(cluster[i].start.getTime() - cluster[i + 1].start.getTime()) / (1000 * 60 * 60);
                withinClusterIntervals.push(diffHours);
            }
        }
    });

    // Calculate median interval
    let medianClusterInterval = 4; // Default
    if (withinClusterIntervals.length > 0) {
        withinClusterIntervals.sort((a, b) => a - b);
        const mid = Math.floor(withinClusterIntervals.length / 2);
        medianClusterInterval = withinClusterIntervals[mid];
    }

    // 4. Make Predictions
    const predictions: Prediction[] = [];
    const now = new Date();
    const lastAttack = sortedAttacks[0]; // Newest
    const hoursSinceLastAttack = Math.abs(now.getTime() - lastAttack.start.getTime()) / (1000 * 60 * 60);

    // Predict next in cluster
    if (hoursSinceLastAttack < 12) {
        const nextInClusterTime = new Date(lastAttack.start.getTime() + (medianClusterInterval * 60 * 60 * 1000));

        if (nextInClusterTime > now) {
            predictions.push({
                time: nextInClusterTime,
                confidence: 70,
                type: 'within_cluster',
                detail: `Based on typical interval of ${Math.round(medianClusterInterval)} hours between attacks`
            });
        }
    }

    // Predict start of next cluster
    // Cluster start times (using local time hours)
    const clusterStartHours: Record<number, number> = {};
    clusters.forEach(cluster => {
        // Oldest attack in cluster is the start?
        // Wait, GAS code: cluster[0].start.getHours()
        // If 'cluster' is [newest, ..., oldest], then cluster[0] is the END of the cluster (most recent attack in that group)
        // Actually, GAS code logic:
        // let currentCluster = [attacks[0]]; (attacks is Newest First)
        // ... currentCluster.push(attacks[i]) (older)
        // So cluster[0] is the NEWEST attack in the cluster.
        // But GAS code says:
        /*
          const clusterStartHours = clusters
            .map(cluster => cluster[0].start.getHours())
        */
        // This takes the hour of the *last* attack in the cluster (chronologically last, array index 0).
        // Is that intentional? "Start of next cluster"... maybe they mean "Time when attacks usually happen"?
        // If a cluster is a series of attacks, usually you care about when the *first* one happens (chronologically first).
        // If the array is Newest->Oldest, the chronological start is cluster[cluster.length-1].
        // However, I should stick to the GAS logic effectively, unless it's clearly buggy.
        // GAS comment: "Predict start of next cluster"
        // Code: cluster[0].start.getHours().
        // If my cluster is [10:00, 08:00, 06:00], cluster[0] is 10:00.
        // I will replicate the GAS logic exactly for now.
        const hour = cluster[0].start.getHours();
        clusterStartHours[hour] = (clusterStartHours[hour] || 0) + 1;
    });

    let commonStartHour = 0;
    if (Object.keys(clusterStartHours).length > 0) {
        const sortedHours = Object.entries(clusterStartHours).sort((a, b) => b[1] - a[1]);
        commonStartHour = parseInt(sortedHours[0][0]);
    }

    // Predict tomorrow at commonStartHour
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(commonStartHour, 0, 0, 0);

    predictions.push({
        time: tomorrow,
        confidence: 40,
        type: 'cluster_start',
        detail: `Based on common cluster start time of ${commonStartHour}:00`
    });

    // 5. Generate Insights
    const avgAttacksPerCluster = Math.round(clusters.reduce((sum, c) => sum + c.length, 0) / clusters.length);

    const insights = [
        `Typical interval between attacks: ${Math.round(medianClusterInterval)} hours`,
        `Most clusters start around ${commonStartHour}:00`,
        `Average attacks per cluster: ${avgAttacksPerCluster}`
    ];

    return {
        predictions: predictions.sort((a, b) => a.time.getTime() - b.time.getTime()),
        insights
    };
}
