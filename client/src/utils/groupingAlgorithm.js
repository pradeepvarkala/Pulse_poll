/**
 * Intelligent Grouping & Constraint Satisfaction Algorithm
 * Features:
 * 1. Gender-Balanced Allocation (Equal M/F ratio in every group)
 * 2. Non-Repeating Pair Shuffling (Social Golfer CSP Solver)
 * 3. Pair Interaction Matrix & Coverage Tracking
 * 4. Thematic Group Naming (Indian Rivers, Greek Alphabets, Cosmic Constellations)
 */

export const GROUP_NAMING_THEMES = {
  indian_rivers: {
    name: '🌊 Indian Rivers',
    names: [
      'Ganga 🌊', 'Yamuna 💧', 'Cauvery 🏞️', 'Narmada 🌊',
      'Godavari 🌊', 'Krishna 💧', 'Brahmaputra 🏞️', 'Tapati 🌊',
      'Mahanadi 💧', 'Saraswati 🌊', 'Periyar 🏞️', 'Sabarmati 💧'
    ]
  },
  greek: {
    name: '🏛️ Greek Alphabets',
    names: [
      'Alpha ⚡', 'Beta 🚀', 'Gamma 💎', 'Delta 🔺',
      'Epsilon ✨', 'Zeta 🌟', 'Eta 🪐', 'Theta 🎯',
      'Iota 🔥', 'Kappa 🛡️', 'Lambda 🌌', 'Mu 🏆'
    ]
  },
  cosmic: {
    name: '✨ Cosmic Constellations',
    names: [
      'Orion 🌌', 'Phoenix 🦅', 'Andromeda 🪐', 'Pegasus 🦄',
      'Sirius 🌟', 'Vega 💫', 'Centauri ☄️', 'Cassiopeia ✨',
      'Lyra 🎶', 'Nebula 🔮'
    ]
  },
  numeric: {
    name: '🔢 Team Numbers',
    names: [
      'Team 1', 'Team 2', 'Team 3', 'Team 4',
      'Team 5', 'Team 6', 'Team 7', 'Team 8',
      'Team 9', 'Team 10', 'Team 11', 'Team 12'
    ]
  }
};

/**
 * Get thematic group names for Y groups
 */
export function getGroupNames(groupCount, themeKey = 'indian_rivers', customNames = []) {
  const theme = GROUP_NAMING_THEMES[themeKey] || GROUP_NAMING_THEMES.indian_rivers;
  const result = [];
  
  for (let i = 0; i < groupCount; i++) {
    if (customNames && customNames[i] && customNames[i].trim()) {
      result.push(customNames[i].trim());
    } else {
      result.push(theme.names[i % theme.names.length] + (i >= theme.names.length ? ` ${Math.floor(i / theme.names.length) + 1}` : ''));
    }
  }
  return result;
}

/**
 * Generate unique pair key for 2 participant IDs
 */
export function getPairKey(idA, idB) {
  return idA < idB ? `${idA}___${idB}` : `${idB}___${idA}`;
}

/**
 * Calculate class interaction coverage percentage
 */
export function calculateInteractionCoverage(participants, pairHistory) {
  if (!participants || participants.length < 2) return 100;
  
  const N = participants.length;
  const totalPossiblePairs = (N * (N - 1)) / 2;
  
  let uniquePairsFormed = 0;
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const key = getPairKey(participants[i].id, participants[j].id);
      if (pairHistory[key] && pairHistory[key] > 0) {
        uniquePairsFormed++;
      }
    }
  }
  
  return Math.round((uniquePairsFormed / totalPossiblePairs) * 100);
}

/**
 * Solve Group Allocation using Constraint Satisfaction + Energy Minimization Swap Optimization
 * Constraint 1: Strict Gender Balance (Equal M/F ratio in every group)
 * Constraint 2: Non-repeating pair history (Zero repeat pairings where feasible)
 * Constraint 3: Randomness when multiple valid configurations exist
 */
export function solveGroupAllocation(participants, groupCount = 4, existingPairHistory = {}, themeKey = 'indian_rivers', customNames = []) {
  if (!participants || participants.length === 0) {
    return {
      groups: [],
      pairHistory: { ...existingPairHistory },
      coveragePercentage: 0,
      repeatCount: 0
    };
  }

  const Y = Math.max(1, Math.min(groupCount, participants.length));
  const names = getGroupNames(Y, themeKey, customNames);
  
  // 1. Separate participants by gender for strict gender stratification
  const males = [];
  const females = [];
  const others = [];

  // Shuffle pools first to ensure randomness across multiple valid solutions
  const shuffled = [...participants].sort(() => Math.random() - 0.5);

  shuffled.forEach(p => {
    const g = (p.gender || 'M').toUpperCase();
    if (g === 'F' || g === 'FEMALE') females.push(p);
    else if (g === 'M' || g === 'MALE') males.push(p);
    else others.push(p);
  });

  // Create initial Y empty groups
  const groups = Array.from({ length: Y }, (_, i) => ({
    id: `group-${i + 1}`,
    name: names[i],
    code: `${names[i].split(' ')[0].toUpperCase()}-${100 + i + 1}`,
    members: []
  }));

  // 2. Stratified Round-Robin Initial Assignment (Equal Gender Ratios)
  let groupIdx = 0;

  males.forEach(p => {
    groups[groupIdx % Y].members.push(p);
    groupIdx++;
  });

  females.forEach(p => {
    groups[groupIdx % Y].members.push(p);
    groupIdx++;
  });

  others.forEach(p => {
    groups[groupIdx % Y].members.push(p);
    groupIdx++;
  });

  // Helper: Energy of a group configuration based on repeat pair history
  const calculateEnergy = (currentGroups) => {
    let energy = 0;
    currentGroups.forEach(g => {
      const members = g.members;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const key = getPairKey(members[i].id, members[j].id);
          const historyCount = existingPairHistory[key] || 0;
          if (historyCount > 0) {
            // Heavily penalize previously paired members
            energy += Math.pow(historyCount + 1, 3) * 100;
          }
        }
      }
    });
    return energy;
  };

  // 3. Hill-Climbing Swap Optimization (Swap same-gender participants between groups to minimize pair overlap)
  let currentEnergy = calculateEnergy(groups);
  const maxIterations = 600;

  for (let iter = 0; iter < maxIterations; iter++) {
    if (currentEnergy === 0) break; // Zero repeat pairs achieved!

    // Pick two random different groups
    const g1Idx = Math.floor(Math.random() * Y);
    let g2Idx = Math.floor(Math.random() * Y);
    if (g1Idx === g2Idx) g2Idx = (g1Idx + 1) % Y;

    const g1 = groups[g1Idx];
    const g2 = groups[g2Idx];

    if (g1.members.length === 0 || g2.members.length === 0) continue;

    // Pick a random member from g1
    const m1Idx = Math.floor(Math.random() * g1.members.length);
    const m1 = g1.members[m1Idx];

    // Find candidate members in g2 of the SAME gender to preserve gender balance
    const sameGenderCandidates = g2.members
      .map((m, idx) => ({ m, idx }))
      .filter(item => (item.m.gender || 'M').toUpperCase() === (m1.gender || 'M').toUpperCase());

    if (sameGenderCandidates.length === 0) continue;

    const candidate = sameGenderCandidates[Math.floor(Math.random() * sameGenderCandidates.length)];
    const m2Idx = candidate.idx;

    // Swap m1 and m2
    g1.members[m1Idx] = g2.members[m2Idx];
    g2.members[m2Idx] = m1;

    const newEnergy = calculateEnergy(groups);

    // Accept swap if energy improved or equal with 30% probability (simulated annealing to avoid local minima)
    if (newEnergy < currentEnergy || (newEnergy === currentEnergy && Math.random() < 0.3)) {
      currentEnergy = newEnergy;
    } else {
      // Revert swap
      const temp = g1.members[m1Idx];
      g1.members[m1Idx] = g2.members[m2Idx];
      g2.members[m2Idx] = temp;
    }
  }

  // 4. Update Pair History Matrix with newly assigned groups
  const updatedPairHistory = { ...existingPairHistory };
  let repeatCount = 0;

  groups.forEach(g => {
    const members = g.members;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const key = getPairKey(members[i].id, members[j].id);
        const prevCount = updatedPairHistory[key] || 0;
        if (prevCount > 0) repeatCount++;
        updatedPairHistory[key] = prevCount + 1;
      }
    }
  });

  const coveragePercentage = calculateInteractionCoverage(participants, updatedPairHistory);

  return {
    groups,
    pairHistory: updatedPairHistory,
    coveragePercentage,
    repeatCount
  };
}
