function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('EPH Tracker')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function handleAction(action, intensity = '', endTime = null) {
  try {
    if (action === 'start') {
      // Check if there's already an active attack
      const activeAttack = getActiveAttack();
      if (activeAttack) {
        return { success: false, message: '❌ There is already an active attack' };
      }

      // Add new attack
      const sheet = SpreadsheetApp.getActive().getSheetByName("EPH");
      const lastRow = sheet.getLastRow() + 1;
      const now = new Date();
      const range = sheet.getRange(lastRow, 2, 1, 4);
      range.setValues([[now, null, null, '']]);
      return { success: true, message: '✅ Attack started' };
    }

    if (action === 'end') {
      const sheet = SpreadsheetApp.getActive().getSheetByName("EPH");
      const data = sheet.getDataRange().getValues();

      // Find the last uncompleted attack
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][1] && !data[i][2]) {
          const endDateTime = endTime ? new Date(endTime) : new Date();
          const startTime = new Date(data[i][1]);
          
          // Validate end time
          if (endDateTime < startTime) {
            return { success: false, message: '❌ End time cannot be before start time' };
          }
          
          sheet.getRange(i + 1, 3).setValue(endDateTime); // End time
          sheet.getRange(i + 1, 4).setValue(intensity); // Intensity
          return { success: true, message: '✅ Attack recorded' };
        }
      }
      return { success: false, message: '❌ No active attack found' };
    }

    return { success: false, message: '❌ Invalid action' };
  } catch (error) {
    console.error(error);
    return { success: false, message: '❌ Error: ' + error.message };
  }
}

function logMedication(medicine, dosage, attackId = null) {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName("Medications");
    const timestamp = new Date();
    sheet.appendRow([null, timestamp, medicine, dosage, attackId]);
    return { success: true, message: `✅ ${currentMedType} (${dosage}mg) logged` };
  } catch (error) {
    console.error(error);
    return { success: false, message: '❌ Error logging medication' };
  }
}

function getAttackHistory() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName("EPH");
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // Return empty array if only header row exists

    // Get the data from columns B (start), C (end), D (intensity), and E (medications)
    const data = sheet.getRange(2, 2, lastRow - 1, 4).getValues();

    // Find the active attack from the most recent entries first
    let activeAttack;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i][0] && !data[i][1]) { // Has start time but no end time
        activeAttack = data[i];
        break;
      }
    }

    // Process completed attacks
    const completedAttacks = data
      .filter(row => row[0] && row[1]) // Check if both start and end times exist
      .map(row => ({
        start: row[0].getTime(),
        end: row[1].getTime(),
        intensity: row[2] || '–',
        medications: row[3] || '–',
        isActive: false
      }))
      .reverse() // Most recent first
      .slice(0, 5); // Get last 5 attacks

    // If there's an active attack, add it to the beginning
    if (activeAttack) {
      completedAttacks.unshift({
        start: activeAttack[0].getTime(),
        end: null,
        intensity: activeAttack[2] || '–',
        medications: activeAttack[3] || '–',
        isActive: true
      });
    }

    return completedAttacks;
  } catch (error) {
    console.error('Error in getAttackHistory:', error);
    return [];
  }
}

function getRecentMeds() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName("Medications");
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return []; // Return empty array if only header row exists

    // Get the last 5 medication entries from columns B through E
    const data = sheet.getRange(2, 2, lastRow - 1, 4).getValues().slice(-5).reverse();

    return data.map(row => ({
      time: row[0].getTime(), // Timestamp is now in column B (first element of row)
      medicine: row[1],       // Medicine is in column C (second element)
      dosage: row[2],        // Dosage is in column D (third element)
      linkedAttack: row[3] || '–' // Linked Attack ID is in column E (fourth element)
    }));
  } catch (error) {
    console.error('Error in getRecentMeds:', error);
    return [];
  }
}

function getActiveAttack() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName("EPH");
    const data = sheet.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] && !data[i][2]) {
        return {
          start: data[i][1],
          duration: new Date() - data[i][1],
          intensity: data[i][3] || 'N/A',
          rowId: i + 1 // Return row ID for linking medications
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error in getActiveAttack:', error);
    return null;
  }
}

function predictNextAttack() {
  try {
    const sheet = SpreadsheetApp.getActive().getSheetByName("EPH");
    const data = sheet.getDataRange().getValues();
    
    // Get recent attacks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attacks = data.slice(1)
      .filter(row => row[1] && new Date(row[1]) > thirtyDaysAgo)
      .map(row => ({
        start: new Date(row[1]),
        end: row[2] ? new Date(row[2]) : null,
        intensity: row[3] || 0
      }))
      .sort((a, b) => b.start - a.start); // Newest first

    if (attacks.length < 2) {
      return {
        predictions: [{
          time: Date.now() + (24 * 60 * 60 * 1000),
          confidence: 20,
          type: "insufficient_data"
        }],
        message: "Limited data available"
      };
    }

    // Find clusters of attacks
    const clusters = [];
    let currentCluster = [attacks[0]];
    
    for (let i = 1; i < attacks.length; i++) {
      const lastAttackInCluster = currentCluster[currentCluster.length - 1];
      const hoursSinceLastAttack = Math.abs(attacks[i].start - lastAttackInCluster.start) / (1000 * 60 * 60);
      
      if (hoursSinceLastAttack > 12) { // New day/cluster
        clusters.push(currentCluster);
        currentCluster = [attacks[i]];
      } else {
        currentCluster.push(attacks[i]);
      }
    }
    clusters.push(currentCluster);

    // Calculate typical intervals within clusters
    const withinClusterIntervals = [];
    clusters.forEach(cluster => {
      if (cluster.length > 1) {
        for (let i = 0; i < cluster.length - 1; i++) {
          withinClusterIntervals.push(
            Math.abs(cluster[i + 1].start - cluster[i].start) / (1000 * 60 * 60)
          );
        }
      }
    });

    // Calculate median interval within clusters
    const medianClusterInterval = withinClusterIntervals.length > 0 
      ? withinClusterIntervals.sort((a, b) => a - b)[Math.floor(withinClusterIntervals.length / 2)]
      : 4; // Default to 4 hours if not enough data

    // Make predictions
    const predictions = [];
    const now = new Date();
    const lastAttack = attacks[0];
    const hoursSinceLastAttack = Math.abs(now - lastAttack.start) / (1000 * 60 * 60);

    // If we're within a likely cluster timeframe (< 12 hours since last attack)
    if (hoursSinceLastAttack < 12) {
      const nextInCluster = new Date(lastAttack.start.getTime() + (medianClusterInterval * 60 * 60 * 1000));
      if (nextInCluster > now) {
        predictions.push({
          time: nextInCluster.getTime(),
          confidence: 70,
          type: "within_cluster",
          detail: `Based on typical interval of ${Math.round(medianClusterInterval)} hours between attacks`
        });
      }
    }

    // Predict start of next cluster
    const clusterStartHours = clusters
      .map(cluster => cluster[0].start.getHours())
      .reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

    const commonStartHour = parseInt(
      Object.entries(clusterStartHours)
        .sort((a, b) => b[1] - a[1])[0][0]
    );

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(commonStartHour, 0, 0, 0);

    predictions.push({
      time: tomorrow.getTime(),
      confidence: 40,
      type: "next_cluster",
      detail: `Based on common cluster start time of ${commonStartHour}:00`
    });

    return {
      predictions: predictions.sort((a, b) => a.time - b.time),
      insights: [
        `Typical interval between attacks: ${Math.round(medianClusterInterval)} hours`,
        `Most clusters start around ${commonStartHour}:00`,
        `Average attacks per cluster: ${Math.round(clusters.reduce((sum, cluster) => sum + cluster.length, 0) / clusters.length)}`
      ]
    };
  } catch (error) {
    console.error('Error in predictNextAttack:', error);
    return {
      predictions: [{
        time: Date.now() + (24 * 60 * 60 * 1000),
        confidence: 20,
        type: "error"
      }],
      message: "Error in prediction: " + error.message
    };
  }
}
