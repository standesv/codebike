
const app = document.getElementById('app');
let content = StorageService.getContent();
let profile = StorageService.getProfile();
let stats = StorageService.getStats();
let importedMedia = StorageService.getImportedMedia();
let currentAdminQuestionId = content.questions[0]?.id || null;

function saveAll() {
  StorageService.saveContent(content);
  StorageService.saveProfile(profile);
  StorageService.saveStats(stats);
  StorageService.saveImportedMedia(importedMedia);
}

function getQuestionById(id) {
  return content.questions.find(q => q.id === id);
}

function resolveMediaSrc(src) {
  return importedMedia[src] || src;
}

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderHome() {
  const level = GameEngine.getLevel(content, profile.xp);
  const validationIssues = GameEngine.validateContent(content, importedMedia);
  app.innerHTML = `
    <section class="hero">
      <div class="card">
        <h2>Une base complète, illustrée et administrable</h2>
        <p class="muted">Cette V2 contient <strong>${content.questions.length} questions</strong>, <strong>${content.missions.length} missions</strong> et des illustrations SVG embarquées. Les questions peuvent être importées, modifiées, validées et supprimées sans toucher au code.</p>
        <div class="toolbar">
          <button id="btn-play">${profile.nickname ? 'Continuer' : 'Créer mon profil'}</button>
          <button id="btn-random" class="secondary">Révision aléatoire</button>
          <button id="btn-admin" class="ghost">Gérer la base</button>
        </div>
        <div class="notice">
          Contrôle qualité actuel :
          <strong class="${validationIssues.some(i => i.level === 'error') ? 'status-ko' : 'status-ok'}">
            ${validationIssues.some(i => i.level === 'error') ? 'erreurs à corriger' : 'structure cohérente'}
          </strong>
          — ${validationIssues.length} alerte(s) détectée(s).
        </div>
      </div>
      <div class="card">
        <div class="chip">Niveau : ${level.name}</div>
        <div class="kpi">${profile.xp} XP</div>
        <p class="muted">Profil : ${profile.nickname || 'non créé'} ${profile.avatar || ''}</p>
        <div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(100, (profile.xp / content.levels.at(-1).xpRequired) * 100)}%"></div></div>
        <p class="muted" style="margin-top:8px">${Object.keys(profile.missions || {}).length} mission(s) terminée(s)</p>
      </div>
    </section>

    <section class="grid grid-4">
      ${content.categories.map(cat => {
        const count = content.questions.filter(q => q.category === cat.id).length;
        return `<div class="card">
          <h3>${cat.label}</h3>
          <p class="muted">${count} question(s)</p>
          <button data-category="${cat.id}" class="secondary">Réviser</button>
        </div>`;
      }).join('')}
    </section>

    <section class="card">
      <h2>Missions</h2>
      <div class="grid grid-3">
        ${content.missions.map(m => {
          const done = profile.missions?.[m.id]?.completed;
          return `<div class="card" style="margin:0">
            <h3>${m.title}</h3>
            <p>${m.description}</p>
            <div class="chip">${m.questionIds.length} étapes</div>
            <div class="chip">${done ? 'Terminée' : 'À faire'}</div>
            <div style="margin-top:10px"><button data-mission="${m.id}">${done ? 'Rejouer' : 'Lancer'}</button></div>
          </div>`;
        }).join('')}
      </div>
    </section>
  `;
  document.getElementById('btn-play').onclick = () => profile.nickname ? renderProfile() : renderOnboarding();
  document.getElementById('btn-random').onclick = () => renderQuestionSequence(shuffle([...content.questions]).slice(0, 10), 'Révision aléatoire');
  document.getElementById('btn-admin').onclick = renderAdmin;
  app.querySelectorAll('[data-mission]').forEach(btn => btn.onclick = () => renderMission(btn.dataset.mission));
  app.querySelectorAll('[data-category]').forEach(btn => btn.onclick = () => {
    const category = btn.dataset.category;
    renderQuestionSequence(content.questions.filter(q => q.category === category), `Révision — ${category}`);
  });
}

function renderOnboarding() {
  app.innerHTML = `
    <div class="card">
      <h2>Créer un profil enfant</h2>
      <label>Pseudo<input id="nickname" value="${esc(profile.nickname)}" /></label>
      <label>Tranche d'âge
        <select id="ageRange">
          <option value="6-8" ${profile.ageRange === '6-8' ? 'selected' : ''}>6–8 ans</option>
          <option value="9-11" ${profile.ageRange === '9-11' ? 'selected' : ''}>9–11 ans</option>
        </select>
      </label>
      <label>Avatar
        <select id="avatar">
          ${['🚲', '🦺', '🚦', '⭐'].map(a => `<option ${profile.avatar === a ? 'selected' : ''}>${a}</option>`).join('')}
        </select>
      </label>
      <div class="toolbar">
        <button id="save-profile">Enregistrer</button>
        <button id="cancel-profile" class="secondary">Retour</button>
      </div>
    </div>`;
  document.getElementById('save-profile').onclick = () => {
    profile.nickname = document.getElementById('nickname').value.trim();
    profile.ageRange = document.getElementById('ageRange').value;
    profile.avatar = document.getElementById('avatar').value;
    saveAll();
    renderProfile();
  };
  document.getElementById('cancel-profile').onclick = renderHome;
}

function renderProfile() {
  const level = GameEngine.getLevel(content, profile.xp);
  const badges = GameEngine.syncBadges(content, profile, stats);
  saveAll();
  app.innerHTML = `
    <div class="grid grid-2">
      <div class="card">
        <h2>${profile.avatar} ${profile.nickname || 'Profil non créé'}</h2>
        <p><strong>Âge :</strong> ${profile.ageRange}</p>
        <p><strong>XP :</strong> ${profile.xp}</p>
        <p><strong>Niveau :</strong> ${level.name}</p>
        <div class="progress-wrap"><div class="progress-bar" style="width:${Math.min(100, (profile.xp / content.levels.at(-1).xpRequired) * 100)}%"></div></div>
        <div class="toolbar" style="margin-top:16px">
          <button id="edit-profile" class="secondary">Modifier le profil</button>
          <button id="go-home">Retour accueil</button>
        </div>
      </div>
      <div class="card">
        <h3>Badges</h3>
        <div class="badge-list">${badges.length ? badges.map(b => `<span class="chip">${b.name}</span>`).join('') : '<span class="muted">Aucun badge pour le moment</span>'}</div>
        <h3>Statistiques</h3>
        <div class="stats-grid">
          <div class="stat-box"><strong>${stats.correct}</strong><br><small>bonnes réponses</small></div>
          <div class="stat-box"><strong>${stats.answered}</strong><br><small>questions jouées</small></div>
          <div class="stat-box"><strong>${Object.keys(profile.missions || {}).length}</strong><br><small>missions finies</small></div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Par catégorie</h3>
      <table class="table">
        <thead><tr><th>Catégorie</th><th>Résultat</th></tr></thead>
        <tbody>
          ${Object.entries(stats.byCategory || {}).map(([name, s]) => `<tr><td>${name}</td><td>${s.correct}/${s.answered}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">Aucune donnée</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById('edit-profile').onclick = renderOnboarding;
  document.getElementById('go-home').onclick = renderHome;
}

function renderMission(missionId) {
  const mission = content.missions.find(m => m.id === missionId);
  const questions = mission.questionIds.map(getQuestionById).filter(Boolean);
  renderQuestionSequence(questions, mission.title, mission.id);
}

function renderQuestionSequence(questionList, title, missionId = null) {
  if (!profile.nickname) {
    renderOnboarding();
    return;
  }
  let current = 0;
  let score = 0;

  const step = () => {
    const q = questionList[current];
    const media = q.media?.[0];
    const mediaHtml = media ? `<div class="media-frame"><img src="${resolveMediaSrc(media.src)}" alt="${esc(media.alt || q.title)}"></div>` : '';
    app.innerHTML = `
      <div class="card">
        <div class="chip">${title}</div>
        <div class="chip">Question ${current + 1} / ${questionList.length}</div>
        <div class="question-card">
          <div>
            <h2>${esc(q.title)}</h2>
            <p>${esc(q.prompt)}</p>
            <div class="options">
              ${q.options.map((opt, idx) => `<button class="option-btn secondary" data-option="${idx}">${esc(opt)}</button>`).join('')}
            </div>
          </div>
          <div>${mediaHtml}</div>
        </div>
      </div>
    `;
    app.querySelectorAll('[data-option]').forEach(btn => btn.onclick = () => {
      const result = GameEngine.evaluateAnswer(q, Number(btn.dataset.option));
      if (result.isCorrect) {
        score += 1;
        profile.xp += result.xp;
      }
      if (!profile.answeredIds.includes(q.id)) profile.answeredIds.push(q.id);
      GameEngine.updateStats(stats, q, result.isCorrect);
      GameEngine.syncBadges(content, profile, stats);
      saveAll();

      app.innerHTML = `
        <div class="card ${result.isCorrect ? 'success-box' : 'error-box'}">
          <h2>${result.isCorrect ? 'Bravo !' : 'Presque'}</h2>
          <p>${esc(result.explanation)}</p>
          <p><strong>Gain :</strong> ${result.xp} XP</p>
          <div class="toolbar">
            <button id="next-step">${current + 1 < questionList.length ? 'Continuer' : 'Voir le résultat'}</button>
            <button id="go-home" class="secondary">Accueil</button>
          </div>
        </div>`;
      document.getElementById('next-step').onclick = () => {
        current += 1;
        if (current < questionList.length) step();
        else finish();
      };
      document.getElementById('go-home').onclick = renderHome;
    });
  };

  const finish = () => {
    if (missionId) GameEngine.completeMission(profile, missionId, score, questionList.length);
    const badges = GameEngine.syncBadges(content, profile, stats);
    saveAll();
    app.innerHTML = `
      <div class="card success-box">
        <h2>Session terminée</h2>
        <p>Score : <strong>${score}/${questionList.length}</strong></p>
        <p>XP total : <strong>${profile.xp}</strong></p>
        <p>Badges débloqués : ${badges.length ? badges.map(b => `<span class="chip">${b.name}</span>`).join('') : 'Aucun'}</p>
        <div class="toolbar">
          <button id="back-home">Retour accueil</button>
          <button id="go-profile" class="secondary">Voir le profil</button>
        </div>
      </div>
    `;
    document.getElementById('back-home').onclick = renderHome;
    document.getElementById('go-profile').onclick = renderProfile;
  };

  step();
}

function renderAdmin() {
  const issues = GameEngine.validateContent(content, importedMedia);
  const current = getQuestionById(currentAdminQuestionId) || content.questions[0];
  currentAdminQuestionId = current?.id || null;
  const filteredRows = content.questions.map(q => `
      <div class="question-row ${q.id === currentAdminQuestionId ? 'active' : ''}" data-qid="${q.id}">
        <strong>${q.id}</strong><br>
        <small>${q.category} · niv. ${q.level}</small><br>
        <span>${esc(q.title)}</span>
      </div>`).join('');

  app.innerHTML = `
    <div class="card">
      <h2>Administration de la base</h2>
      <p class="muted">Ajout, édition, suppression, import JSON, import médias, validation structurelle et aperçu des visuels.</p>
      <div class="toolbar">
        <button id="admin-export">Exporter le JSON</button>
        <button id="admin-import-json" class="secondary">Importer un JSON</button>
        <button id="admin-import-images" class="secondary">Importer des images</button>
        <button id="admin-add" class="ghost">Ajouter une question</button>
        <button id="admin-reset" class="danger">Réinitialiser le contenu</button>
      </div>
      <div class="notice">
        Validation : <strong class="${issues.some(i => i.level === 'error') ? 'status-ko' : 'status-ok'}">${issues.length} alerte(s)</strong>.
      </div>
    </div>

    <div class="grid grid-2">
      <div class="card">
        <h3>Contrôles automatiques</h3>
        <ul>
          ${issues.length ? issues.map(i => `<li class="${i.level === 'error' ? 'status-ko' : 'status-ok'}">${esc(i.message)}</li>`).join('') : '<li class="status-ok">Aucune anomalie détectée.</li>'}
        </ul>
      </div>
      <div class="card">
        <h3>Format d'import recommandé</h3>
        <pre>{
  "questions": [
    {
      "id": "Q999",
      "title": "Titre",
      "prompt": "Question",
      "type": "single",
      "options": ["A", "B", "C"],
      "correctAnswers": [0],
      "explanation": "Explication",
      "category": "signalisation",
      "level": 1,
      "tags": ["stop"],
      "media": [{"src": "Q999_main.png", "role": "main", "alt": "visuel"}]
    }
  ]
}</pre>
      </div>
    </div>

    <div class="admin-layout">
      <section class="card">
        <h3>Questions (${content.questions.length})</h3>
        <div class="list-scroll">${filteredRows}</div>
      </section>
      <section class="card">
        ${current ? renderAdminEditor(current) : '<p class="muted">Aucune question.</p>'}
      </section>
    </div>
  `;

  app.querySelectorAll('[data-qid]').forEach(row => row.onclick = () => {
    currentAdminQuestionId = row.dataset.qid;
    renderAdmin();
  });
  bindAdminEvents(current);

  document.getElementById('admin-export').onclick = exportJson;
  document.getElementById('admin-import-json').onclick = importJson;
  document.getElementById('admin-import-images').onclick = importImages;
  document.getElementById('admin-add').onclick = addQuestion;
  document.getElementById('admin-reset').onclick = () => {
    if (!confirm('Réinitialiser le contenu, le profil et les médias importés ?')) return;
    StorageService.resetContent();
    StorageService.resetProfile();
    StorageService.resetImportedMedia();
    content = StorageService.getContent();
    profile = StorageService.getProfile();
    stats = StorageService.getStats();
    importedMedia = StorageService.getImportedMedia();
    currentAdminQuestionId = content.questions[0]?.id || null;
    saveAll();
    renderAdmin();
  };
}

function renderAdminEditor(q) {
  const mediaRows = (q.media || []).map((m, index) => `
    <tr>
      <td><input data-media-src="${index}" value="${esc(m.src || '')}" /></td>
      <td><input data-media-alt="${index}" value="${esc(m.alt || '')}" /></td>
      <td><button type="button" data-remove-media="${index}" class="danger">Suppr.</button></td>
    </tr>`).join('');
  const mediaPreview = (q.media || []).map(m => `<div class="media-frame" style="margin-top:10px"><img src="${resolveMediaSrc(m.src)}" alt="${esc(m.alt || q.title)}"><small>${esc(m.src)}</small></div>`).join('');
  return `
    <h3>Éditer ${q.id}</h3>
    <div class="filters">
      <div><label>ID</label><input id="q-id" value="${esc(q.id)}"></div>
      <div><label>Catégorie</label><input id="q-category" value="${esc(q.category)}"></div>
      <div><label>Niveau</label><input id="q-level" type="number" min="1" max="5" value="${esc(q.level)}"></div>
      <div><label>Type</label>
        <select id="q-type">
          <option value="single" ${q.type === 'single' ? 'selected' : ''}>Choix unique</option>
          <option value="boolean" ${q.type === 'boolean' ? 'selected' : ''}>Vrai / faux</option>
        </select>
      </div>
    </div>
    <label>Titre</label><input id="q-title" value="${esc(q.title)}">
    <label>Intitulé</label><textarea id="q-prompt">${esc(q.prompt)}</textarea>
    <label>Réponses (une par ligne)</label><textarea id="q-options">${esc((q.options || []).join('\n'))}</textarea>
    <label>Bonne(s) réponse(s) — index à partir de 0, séparés par des virgules</label><input id="q-correct" value="${esc((q.correctAnswers || []).join(','))}">
    <label>Explication</label><textarea id="q-explanation">${esc(q.explanation)}</textarea>
    <label>Tags (séparés par virgules)</label><input id="q-tags" value="${esc((q.tags || []).join(','))}">
    <label>Médias</label>
    <table class="table">
      <thead><tr><th>Source</th><th>Texte alternatif</th><th></th></tr></thead>
      <tbody>${mediaRows || '<tr><td colspan="3" class="muted">Aucun média</td></tr>'}</tbody>
    </table>
    <div class="toolbar">
      <button type="button" id="q-add-media" class="secondary">Ajouter une ligne média</button>
      <button type="button" id="q-save">Enregistrer</button>
      <button type="button" id="q-delete" class="danger">Supprimer la question</button>
    </div>
    <h4>Aperçu</h4>
    ${mediaPreview || '<p class="muted">Pas de média à prévisualiser.</p>'}
  `;
}

function bindAdminEvents(q) {
  if (!q) return;
  document.getElementById('q-save').onclick = () => {
    const updated = {
      ...q,
      id: document.getElementById('q-id').value.trim(),
      category: document.getElementById('q-category').value.trim(),
      level: Number(document.getElementById('q-level').value || 1),
      type: document.getElementById('q-type').value,
      title: document.getElementById('q-title').value.trim(),
      prompt: document.getElementById('q-prompt').value.trim(),
      options: document.getElementById('q-options').value.split('\n').map(s => s.trim()).filter(Boolean),
      correctAnswers: document.getElementById('q-correct').value.split(',').map(v => Number(v.trim())).filter(v => !Number.isNaN(v)),
      explanation: document.getElementById('q-explanation').value.trim(),
      tags: document.getElementById('q-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      media: [...q.media]
    };
    updated.media = updated.media.map((m, index) => ({
      ...m,
      src: document.querySelector(`[data-media-src="${index}"]`)?.value.trim() || '',
      alt: document.querySelector(`[data-media-alt="${index}"]`)?.value.trim() || updated.title
    })).filter(m => m.src);

    const idx = content.questions.findIndex(item => item.id === q.id);
    content.questions[idx] = updated;
    currentAdminQuestionId = updated.id;
    saveAll();
    renderAdmin();
  };
  document.getElementById('q-delete').onclick = () => {
    if (!confirm(`Supprimer ${q.id} ?`)) return;
    content.questions = content.questions.filter(item => item.id !== q.id);
    content.missions = content.missions.map(m => ({ ...m, questionIds: m.questionIds.filter(id => id !== q.id) }));
    currentAdminQuestionId = content.questions[0]?.id || null;
    saveAll();
    renderAdmin();
  };
  document.getElementById('q-add-media').onclick = () => {
    q.media = [...(q.media || []), { id: `m-${Date.now()}`, role: 'main', src: '', alt: q.title }];
    renderAdmin();
  };
  app.querySelectorAll('[data-remove-media]').forEach(btn => btn.onclick = () => {
    q.media.splice(Number(btn.dataset.removeMedia), 1);
    renderAdmin();
  });
}

function addQuestion() {
  const nextNumber = content.questions.length + 1;
  const q = {
    id: `Q${String(nextNumber).padStart(3, '0')}`,
    title: 'Nouvelle question',
    prompt: 'Écris ici la question.',
    type: 'single',
    options: ['Réponse A', 'Réponse B'],
    correctAnswers: [0],
    explanation: 'Écris ici l’explication pédagogique.',
    category: 'signalisation',
    level: 1,
    tags: [],
    ageRange: '6-11',
    media: [],
    status: 'draft'
  };
  content.questions.unshift(q);
  currentAdminQuestionId = q.id;
  saveAll();
  renderAdmin();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'velocode-content.json';
  a.click();
}

async function importJson() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async () => {
    const file = input.files[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed.questions)) throw new Error('JSON sans tableau questions');
      content = { ...content, ...parsed };
      if (!content.missions) content.missions = [];
      saveAll();
      currentAdminQuestionId = content.questions[0]?.id || null;
      renderAdmin();
    } catch (error) {
      alert(`Import JSON impossible : ${error.message}`);
    }
  };
  input.click();
}

async function importImages() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = 'image/*';
  input.onchange = async () => {
    const files = [...input.files];
    for (const file of files) {
      const dataUrl = await fileToDataURL(file);
      importedMedia[file.name] = dataUrl;

      const match = file.name.match(/^(Q\d{3,})(?:[_-].+)?\.[a-zA-Z0-9]+$/);
      if (match) {
        const q = getQuestionById(match[1]);
        if (q) {
          const already = (q.media || []).some(m => m.src === file.name);
          if (!already) {
            q.media = [...(q.media || []), { id: `import-${Date.now()}`, role: 'main', src: file.name, alt: q.title }];
          }
        }
      }
    }
    saveAll();
    renderAdmin();
  };
  input.click();
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function shuffle(arr) {
  return arr.map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value);
}

document.getElementById('nav-home').onclick = renderHome;
document.getElementById('nav-profile').onclick = renderProfile;
document.getElementById('nav-admin').onclick = renderAdmin;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}

renderHome();
