window.StorageService = {
  contentKey: 'velocode_content_v1',
  profileKey: 'velocode_profile_v1',
  statsKey: 'velocode_stats_v1',

  getContent() {
    const raw = localStorage.getItem(this.contentKey);
    return raw ? JSON.parse(raw) : structuredClone(window.DEFAULT_CONTENT);
  },
  saveContent(content) {
    localStorage.setItem(this.contentKey, JSON.stringify(content));
  },
  resetContent() {
    localStorage.removeItem(this.contentKey);
  },
  getProfile() {
    const raw = localStorage.getItem(this.profileKey);
    return raw ? JSON.parse(raw) : { nickname: '', ageRange: '6-8', avatar: '🚲', xp: 0, badges: [], missions: {} };
  },
  saveProfile(profile) {
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
  },
  getStats() {
    const raw = localStorage.getItem(this.statsKey);
    return raw ? JSON.parse(raw) : { answered: 0, correct: 0, byTheme: {}, signCorrect: 0 };
  },
  saveStats(stats) {
    localStorage.setItem(this.statsKey, JSON.stringify(stats));
  }
};
