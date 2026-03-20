
window.GameEngine = {
  xpPerCorrect: 10,
  xpMissionComplete: 30,

  getLevel(content, xp) {
    let current = content.levels[0];
    for (const level of content.levels) {
      if (xp >= level.xpRequired) current = level;
    }
    return current;
  },

  evaluateAnswer(question, selectedIndex) {
    const good = question.correctAnswers.includes(selectedIndex);
    return {
      isCorrect: good,
      xp: good ? this.xpPerCorrect : 0,
      explanation: question.explanation
    };
  },

  updateStats(stats, question, isCorrect) {
    stats.answered += 1;
    if (isCorrect) stats.correct += 1;
    if (!stats.byCategory[question.category]) {
      stats.byCategory[question.category] = { answered: 0, correct: 0 };
    }
    stats.byCategory[question.category].answered += 1;
    if (isCorrect) stats.byCategory[question.category].correct += 1;

    (question.tags || []).forEach(tag => {
      if (!stats.correctByTag[tag]) stats.correctByTag[tag] = 0;
      if (isCorrect) stats.correctByTag[tag] += 1;
    });

    if (isCorrect) {
      if (!stats.categoryCorrectCounts[question.category]) stats.categoryCorrectCounts[question.category] = 0;
      stats.categoryCorrectCounts[question.category] += 1;
    }
  },

  completeMission(profile, missionId, score, totalQuestions) {
    profile.xp += this.xpMissionComplete;
    profile.missions[missionId] = {
      completed: true,
      score,
      totalQuestions,
      finishedAt: new Date().toISOString()
    };
  },

  syncBadges(content, profile, stats) {
    const owned = new Set(profile.badges || []);
    if (Object.keys(profile.missions || {}).length >= 1) owned.add('first-mission');
    if ((stats.categoryCorrectCounts['équipement'] || 0) >= 5) owned.add('helmet-pro');
    if ((stats.categoryCorrectCounts['signalisation'] || 0) >= 8) owned.add('sign-master');
    const pedestrianCount = (stats.correctByTag['piéton'] || 0) + (stats.correctByTag['partage'] || 0);
    if (pedestrianCount >= 6) owned.add('pedestrian-friend');
    const nightCount = (stats.correctByTag['nuit'] || 0) + (stats.correctByTag['visibilité'] || 0) + (stats.correctByTag['gilet'] || 0);
    if (nightCount >= 4) owned.add('night-rider');
    if ((stats.correctByTag['pluie'] || 0) >= 3) owned.add('rain-brain');
    const roundabout = (stats.correctByTag['giratoire'] || 0) + (stats.correctByTag['priorité à droite'] || 0);
    if (roundabout >= 4) owned.add('roundabout-star');
    const perfectMission = Object.values(profile.missions || {}).some(m => m.completed && m.score === m.totalQuestions);
    if (perfectMission) owned.add('perfect-run');
    profile.badges = [...owned];
    return profile.badges.map(id => content.badges.find(b => b.id === id)).filter(Boolean);
  },

  validateContent(content, importedMedia = {}) {
    const issues = [];
    const ids = new Set();
    const hashSet = new Set();

    if (!content.questions || !Array.isArray(content.questions)) {
      issues.push({ level: 'error', message: 'Le contenu ne contient pas de tableau questions.' });
      return issues;
    }

    content.questions.forEach((q, index) => {
      if (!q.id) issues.push({ level: 'error', message: `Question #${index + 1} sans identifiant.` });
      if (q.id && ids.has(q.id)) issues.push({ level: 'error', message: `Doublon d'identifiant : ${q.id}.` });
      ids.add(q.id);
      if (!q.title || !q.prompt) issues.push({ level: 'error', message: `${q.id || 'question sans id'} incomplète : titre ou intitulé manquant.` });
      if (!q.options || !q.options.length) issues.push({ level: 'error', message: `${q.id || 'question'} sans réponses.` });
      if (!q.correctAnswers || !q.correctAnswers.length) issues.push({ level: 'error', message: `${q.id || 'question'} sans bonne réponse.` });
      if (q.type === 'boolean' && q.options && q.options.length !== 2) {
        issues.push({ level: 'warning', message: `${q.id} est en vrai/faux mais n'a pas exactement 2 réponses.` });
      }
      if (!q.explanation) issues.push({ level: 'warning', message: `${q.id || 'question'} sans explication.` });
      if (!q.media || !q.media.length) {
        issues.push({ level: 'warning', message: `${q.id || 'question'} sans illustration.` });
      } else {
        q.media.forEach(media => {
          const src = media.src || '';
          const ok = src.startsWith('assets/') || src.startsWith('data:') || !!importedMedia[src];
          if (!ok) {
            issues.push({ level: 'warning', message: `${q.id} référence un média non embarqué : ${src}` });
          }
        });
      }
      const hash = JSON.stringify([q.prompt, q.options]);
      if (hashSet.has(hash)) issues.push({ level: 'warning', message: `Possible doublon de contenu autour de ${q.id}.` });
      hashSet.add(hash);
      (q.correctAnswers || []).forEach(idx => {
        if (!q.options || typeof q.options[idx] === 'undefined') {
          issues.push({ level: 'error', message: `${q.id} contient un index de bonne réponse invalide.` });
        }
      });
    });

    (content.missions || []).forEach(mission => {
      (mission.questionIds || []).forEach(qid => {
        if (!ids.has(qid)) {
          issues.push({ level: 'error', message: `La mission ${mission.id} référence une question introuvable : ${qid}.` });
        }
      });
    });

    return issues;
  }
};
