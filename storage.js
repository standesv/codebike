
window.StorageService = {
  keys: {
    content: 'velocode_content_v2',
    profile: 'velocode_profile_v2',
    stats: 'velocode_stats_v2',
    importedMedia: 'velocode_imported_media_v2'
  },

  getContent() {
    const raw = localStorage.getItem(this.keys.content);
    return raw ? JSON.parse(raw) : structuredClone(window.DEFAULT_CONTENT);
  },
  saveContent(content) {
    localStorage.setItem(this.keys.content, JSON.stringify(content));
  },
  resetContent() {
    localStorage.removeItem(this.keys.content);
  },

  getProfile() {
    const raw = localStorage.getItem(this.keys.profile);
    return raw ? JSON.parse(raw) : {
      nickname: '',
      ageRange: '6-8',
      avatar: '🚲',
      xp: 0,
      badges: [],
      missions: {},
      answeredIds: []
    };
  },
  saveProfile(profile) {
    localStorage.setItem(this.keys.profile, JSON.stringify(profile));
  },
  resetProfile() {
    localStorage.removeItem(this.keys.profile);
  },

  getStats() {
    const raw = localStorage.getItem(this.keys.stats);
    return raw ? JSON.parse(raw) : {
      answered: 0,
      correct: 0,
      byCategory: {},
      correctByTag: {},
      categoryCorrectCounts: {}
    };
  },
  saveStats(stats) {
    localStorage.setItem(this.keys.stats, JSON.stringify(stats));
  },

  getImportedMedia() {
    const raw = localStorage.getItem(this.keys.importedMedia);
    return raw ? JSON.parse(raw) : {};
  },
  saveImportedMedia(map) {
    localStorage.setItem(this.keys.importedMedia, JSON.stringify(map));
  },
  resetImportedMedia() {
    localStorage.removeItem(this.keys.importedMedia);
  }
};
