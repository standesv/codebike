window.GameEngine = {
  xpPerCorrect: 10,
  xpMissionComplete: 20,

  getLevel(content, xp) {
    let current = content.levels[0];
    for (const level of content.levels) {
      if (xp >= level.xpRequired) current = level;
    }
    return current;
  },

  evaluateAnswer(question, selectedIndex) {
    const isCorrect = selectedIndex === question.correctIndex;
    return {
      isCorrect,
      xp: isCorrect ? this.xpPerCorrect : 0,
      explanation: question.explanation
    };
  },

  completeMission(profile, missionId, score, totalQuestions) {
    const missionXp = this.xpMissionComplete;
    profile.xp += missionXp;
    profile.missions[missionId] = { completed: true, score, totalQuestions };
  },

  syncBadges(content, profile, stats) {
    const owned = new Set(profile.badges);
    if (Object.keys(profile.missions).length >= 1) owned.add('first-ride');
    if (stats.signCorrect >= 5) owned.add('sign-master');
    const perfectMission = Object.values(profile.missions).some(m => m.completed && m.score === m.totalQuestions);
    if (perfectMission) owned.add('perfect');
    profile.badges = [...owned];
    return profile.badges.map(id => content.badges.find(b => b.id === id)).filter(Boolean);
  }
};
