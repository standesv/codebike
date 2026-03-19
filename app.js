const app = document.getElementById('app');
let content = StorageService.getContent();
let profile = StorageService.getProfile();
let stats = StorageService.getStats();

function saveAll() {
  StorageService.saveContent(content);
  StorageService.saveProfile(profile);
  StorageService.saveStats(stats);
}

function renderHome() {
  const level = GameEngine.getLevel(content, profile.xp);
  app.innerHTML = `
    <section class="hero">
      <div class="card">
        <h2>Apprendre le code de la route à vélo</h2>
        <p class="muted">Une V1 ludique, simple et administrable pour les enfants. Les questions, missions et badges peuvent être modifiés sans toucher au code.</p>
        <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
          <button id="start-play">Jouer</button>
          <button id="go-admin" class="secondary">Gérer le contenu</button>
        </div>
      </div>
      <div class="card">
        <div class="badge">Niveau : ${level.name}</div>
        <div class="kpi">${profile.xp} XP</div>
        <p class="muted">Profil : ${profile.nickname || 'non créé'} ${profile.avatar || ''}</p>
        <div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(100, (profile.xp / 500) * 100)}%"></div></div>
      </div>
    </section>
    <section class="grid grid-3">
      ${content.missions.map(m => {
        const done = profile.missions[m.id]?.completed;
        return `<div class="card"><h3>${m.title}</h3><p>${m.description}</p><p class="muted">${m.questionIds.length} questions</p><button data-mission="${m.id}">${done ? 'Rejouer' : 'Commencer'}</button></div>`;
      }).join('')}
    </section>
  `;
  document.getElementById('start-play').onclick = () => profile.nickname ? renderMap() : renderOnboarding();
  document.getElementById('go-admin').onclick = renderAdmin;
  app.querySelectorAll('[data-mission]').forEach(btn => btn.onclick = () => {
    if (!profile.nickname) return renderOnboarding();
    renderMission(btn.dataset.mission);
  });
}

function renderOnboarding() {
  app.innerHTML = `
    <div class="card">
      <h2>Créer un profil enfant</h2>
      <label>Pseudo<input id="nickname" value="${profile.nickname || ''}" /></label>
      <label>Tranche d’âge
        <select id="ageRange">
          <option value="6-8" ${profile.ageRange==='6-8'?'selected':''}>6–8 ans</option>
          <option value="9-11" ${profile.ageRange==='9-11'?'selected':''}>9–11 ans</option>
        </select>
      </label>
      <label>Avatar
        <select id="avatar">
          <option ${profile.avatar==='🚲'?'selected':''}>🚲</option>
          <option ${profile.avatar==='🦺'?'selected':''}>🦺</option>
          <option ${profile.avatar==='🚦'?'selected':''}>🚦</option>
        </select>
      </label>
      <div style="margin-top:16px"><button id="save-profile">Enregistrer</button></div>
    </div>`;
  document.getElementById('save-profile').onclick = () => {
    profile.nickname = document.getElementById('nickname').value.trim();
    profile.ageRange = document.getElementById('ageRange').value;
    profile.avatar = document.getElementById('avatar').value;
    saveAll();
    renderMap();
  };
}

function renderMap() {
  const badges = GameEngine.syncBadges(content, profile, stats);
  saveAll();
  app.innerHTML = `
    <div class="card">
      <h2>${profile.avatar} Bonjour ${profile.nickname}</h2>
      <p>Niveau actuel : <strong>${GameEngine.getLevel(content, profile.xp).name}</strong></p>
      <p>Badges : ${badges.length ? badges.map(b => `<span class="badge">${b.name}</span>`).join('') : '<span class="muted">Aucun pour le moment</span>'}</p>
    </div>
    <div class="grid grid-3">
      ${content.missions.map(m => `<div class="card"><h3>${m.title}</h3><p>${m.description}</p><button data-mission="${m.id}">Lancer la mission</button></div>`).join('')}
    </div>`;
  app.querySelectorAll('[data-mission]').forEach(btn => btn.onclick = () => renderMission(btn.dataset.mission));
}

function renderMission(missionId) {
  const mission = content.missions.find(m => m.id === missionId);
  const questions = mission.questionIds.map(id => content.questions.find(q => q.id === id)).filter(Boolean);
  let currentIndex = 0;
  let score = 0;

  const renderQuestion = () => {
    const q = questions[currentIndex];
    app.innerHTML = `
      <div class="card">
        <div class="badge">Mission : ${mission.title}</div>
        <h2>Question ${currentIndex + 1} / ${questions.length}</h2>
        <p>${q.text}</p>
        ${q.options.map((opt, i) => `<button class="option secondary" data-index="${i}">${opt}</button>`).join('')}
      </div>`;
    app.querySelectorAll('[data-index]').forEach(btn => btn.onclick = () => {
      const result = GameEngine.evaluateAnswer(q, Number(btn.dataset.index));
      stats.answered += 1;
      if (result.isCorrect) {
        score += 1;
        profile.xp += result.xp;
        stats.correct += 1;
        if (q.theme === 'panneaux') stats.signCorrect += 1;
      }
      stats.byTheme[q.theme] = stats.byTheme[q.theme] || { answered: 0, correct: 0 };
      stats.byTheme[q.theme].answered += 1;
      if (result.isCorrect) stats.byTheme[q.theme].correct += 1;
      saveAll();
      app.innerHTML = `
        <div class="card ${result.isCorrect ? 'success-box' : 'error-box'}">
          <h2>${result.isCorrect ? 'Bravo !' : 'Oups'}</h2>
          <p>${result.explanation}</p>
          <p><strong>Gain :</strong> ${result.xp} XP</p>
          <button id="next-question">Continuer</button>
        </div>`;
      document.getElementById('next-question').onclick = () => {
        currentIndex += 1;
        if (currentIndex < questions.length) renderQuestion();
        else finishMission();
      };
    });
  };

  const finishMission = () => {
    GameEngine.completeMission(profile, mission.id, score, questions.length);
    const badges = GameEngine.syncBadges(content, profile, stats);
    saveAll();
    app.innerHTML = `
      <div class="card success-box">
        <h2>Mission terminée</h2>
        <p>Score : <strong>${score}/${questions.length}</strong></p>
        <p>XP total : <strong>${profile.xp}</strong></p>
        <p>Badges débloqués : ${badges.length ? badges.map(b => `<span class="badge">${b.name}</span>`).join('') : 'Aucun'}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button id="back-map">Retour à la carte</button>
          <button id="go-profile" class="secondary">Voir le profil</button>
        </div>
      </div>`;
    document.getElementById('back-map').onclick = renderMap;
    document.getElementById('go-profile').onclick = renderProfile;
  };

  renderQuestion();
}

function renderProfile() {
  const level = GameEngine.getLevel(content, profile.xp);
  const badgeObjects = GameEngine.syncBadges(content, profile, stats);
  saveAll();
  app.innerHTML = `
    <div class="grid grid-2">
      <div class="card">
        <h2>${profile.avatar} ${profile.nickname || 'Profil non créé'}</h2>
        <p><strong>Âge :</strong> ${profile.ageRange}</p>
        <p><strong>XP :</strong> ${profile.xp}</p>
        <p><strong>Niveau :</strong> ${level.name}</p>
        <p><strong>Réponses justes :</strong> ${stats.correct}/${stats.answered}</p>
      </div>
      <div class="card">
        <h3>Badges</h3>
        <p>${badgeObjects.length ? badgeObjects.map(b => `<span class="badge">${b.name}</span>`).join('') : '<span class="muted">Aucun badge</span>'}</p>
        <h3>Par thème</h3>
        ${Object.entries(stats.byTheme).length ? Object.entries(stats.byTheme).map(([theme, s]) => `<p>${theme} : ${s.correct}/${s.answered}</p>`).join('') : '<p class="muted">Aucune donnée</p>'}
      </div>
    </div>`;
}

function renderAdmin() {
  app.innerHTML = `
    <div class="card">
      <h2>Administration du contenu</h2>
      <p class="muted">Cette V1 permet de modifier les questions et d’importer/exporter le contenu en JSON pour GitHub ou pour une future migration vers un backend.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap; margin-bottom:14px;">
        <button id="export-json">Exporter JSON</button>
        <button id="import-json" class="secondary">Importer JSON</button>
        <button id="reset-content" class="danger">Réinitialiser le contenu</button>
      </div>
      <textarea id="json-area" rows="12">${JSON.stringify(content, null, 2)}</textarea>
      <div style="margin-top:12px;"><button id="save-json">Enregistrer le JSON</button></div>
    </div>
    <div class="card">
      <h3>Questions</h3>
      <table class="table"><thead><tr><th>ID</th><th>Thème</th><th>Question</th></tr></thead><tbody>${content.questions.map(q => `<tr><td>${q.id}</td><td>${q.theme}</td><td>${q.text}</td></tr>`).join('')}</tbody></table>
    </div>`;
  document.getElementById('save-json').onclick = () => {
    try {
      content = JSON.parse(document.getElementById('json-area').value);
      saveAll();
      alert('Contenu enregistré.');
      renderAdmin();
    } catch (e) {
      alert('JSON invalide.');
    }
  };
  document.getElementById('export-json').onclick = () => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'velocode-content.json';
    a.click();
  };
  document.getElementById('import-json').onclick = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        content = JSON.parse(text);
        saveAll();
        renderAdmin();
      } catch { alert('Import impossible : JSON invalide.'); }
    };
    input.click();
  };
  document.getElementById('reset-content').onclick = () => {
    StorageService.resetContent();
    content = StorageService.getContent();
    saveAll();
    renderAdmin();
  };
}

document.getElementById('nav-home').onclick = renderHome;
document.getElementById('nav-profile').onclick = renderProfile;
document.getElementById('nav-admin').onclick = renderAdmin;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}

renderHome();
