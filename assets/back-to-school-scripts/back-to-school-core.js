export const ROUND_SECONDS = 90;
export const STREAK_TARGET = 3;
export const STORAGE_KEY = 'back-to-school-progress-v1';

export const PAIRS = [
  {
    id: 'sst-failure',
    situation: 'SST Failure',
    response: 'Inform Supervisor',
    explanation: 'If SST fails, inform your supervisor.'
  },
  {
    id: 'column-leak',
    situation: 'Column Leak',
    response: 'Stop Run',
    explanation: 'Stop the run when a column leaks.'
  },
  {
    id: 'pressure-spike',
    situation: 'Pressure Spike',
    response: 'Investigate Immediately',
    explanation: 'Investigate immediately when a pressure spike occurs.'
  },
  {
    id: 'wrong-standard',
    situation: 'Wrong Standard Used',
    response: 'Initiate Incident',
    explanation: 'Initiate an incident if the wrong standard is used.'
  },
  {
    id: 'unknown-peak',
    situation: 'Unknown Peak',
    response: 'Perform Investigate',
    explanation: 'Perform an investigation when an unknown peak appears.'
  }
];

export const PAIR_BY_ID = Object.fromEntries(PAIRS.map((p) => [p.id, p]));

export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createBoard(rng = Math.random) {
  return {
    situationsOrder: shuffle(PAIRS.map((p) => p.id), rng),
    responsesOrder: shuffle(PAIRS.map((p) => p.id), rng),
    leftSlots: [null, null, null, null, null],
    rightSlots: [null, null, null, null, null]
  };
}

export function isBoardComplete(board) {
  return (
    board.leftSlots.every((v) => typeof v === 'string' && v.length > 0) &&
    board.rightSlots.every((v) => typeof v === 'string' && v.length > 0)
  );
}

export function placeCard(board, side, id, targetSlotIndex = null) {
  const key = side === 'left' ? 'leftSlots' : 'rightSlots';
  const slots = [...board[key]];
  const existingIdx = slots.indexOf(id);

  let dest = targetSlotIndex;
  if (dest === null || dest === undefined) {
    dest = slots.indexOf(null);
  }
  if (dest < 0 || dest >= slots.length) return board;

  if (existingIdx !== -1) {
    // Swap or move within the same column
    const displaced = slots[dest];
    slots[dest] = id;
    slots[existingIdx] = displaced;
  } else {
    slots[dest] = id;
  }
  return { ...board, [key]: slots };
}

export function removeSlotCard(board, side, slotIndex) {
  const key = side === 'left' ? 'leftSlots' : 'rightSlots';
  if (slotIndex < 0 || slotIndex >= board[key].length) return board;
  const slots = [...board[key]];
  slots[slotIndex] = null;
  return { ...board, [key]: slots };
}

export function evaluateBoard(board) {
  const rows = board.leftSlots.map((sitId, index) => {
    const respId = board.rightSlots[index];
    const sitPair = PAIR_BY_ID[sitId] || null;
    const respPair = PAIR_BY_ID[respId] || null;
    const correct = Boolean(sitId && respId && sitId === respId);
    return {
      index,
      situationId: sitId,
      situation: sitPair ? sitPair.situation : '',
      responseId: respId,
      response: respPair ? respPair.response : '',
      correct,
      expectedPair: sitPair
    };
  });

  const wrongRows = rows.filter((r) => !r.correct);
  return {
    rows,
    wrongCount: wrongRows.length,
    allCorrect: wrongRows.length === 0,
    wrongPairs: wrongRows.map((r) => r.expectedPair).filter(Boolean)
  };
}

export function createInitialProgress() {
  return {
    demoSeen: false,
    stars: 0,
    streak: 0,
    streakTimes: [],
    targetSeconds: ROUND_SECONDS
  };
}

export function applyRoundOutcome(progress, { allCorrect, elapsedSeconds, timedOut }) {
  const prevTarget = progress.targetSeconds || ROUND_SECONDS;
  if (timedOut) {
    return {
      outcome: 'timeout',
      elapsedSeconds: ROUND_SECONDS,
      targetSeconds: prevTarget,
      progress: { ...progress, streak: 0, streakTimes: [] }
    };
  }
  if (!allCorrect) {
    return {
      outcome: 'wrong',
      elapsedSeconds,
      targetSeconds: prevTarget,
      progress: { ...progress, streak: 0, streakTimes: [] }
    };
  }
  if (elapsedSeconds > prevTarget) {
    return {
      outcome: 'too-slow',
      elapsedSeconds,
      targetSeconds: prevTarget,
      progress: { ...progress, streak: 0, streakTimes: [] }
    };
  }

  const nextStreak = progress.streak + 1;
  const nextTimes = [...(progress.streakTimes || []), elapsedSeconds];

  if (nextStreak >= STREAK_TARGET) {
    const avg = Math.max(10, Math.round(nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length));
    return {
      outcome: 'star',
      elapsedSeconds,
      averageSeconds: avg,
      targetSeconds: avg,
      progress: {
        ...progress,
        stars: (progress.stars || 0) + 1,
        streak: 0,
        streakTimes: [],
        targetSeconds: avg
      }
    };
  }

  return {
    outcome: 'correct',
    elapsedSeconds,
    targetSeconds: prevTarget,
    streak: nextStreak,
    progress: {
      ...progress,
      streak: nextStreak,
      streakTimes: nextTimes
    }
  };
}

