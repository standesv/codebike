window.DEFAULT_CONTENT = {
  levels: [
    { id: 1, name: 'Débutant', xpRequired: 0 },
    { id: 2, name: 'Petit cycliste', xpRequired: 100 },
    { id: 3, name: 'Cycliste vigilant', xpRequired: 250 },
    { id: 4, name: 'As du guidon', xpRequired: 500 }
  ],
  badges: [
    { id: 'first-ride', name: 'Premier trajet', description: 'Terminer une première mission.' },
    { id: 'perfect', name: 'Sans faute', description: 'Réussir une mission sans erreur.' },
    { id: 'sign-master', name: 'Maître des panneaux', description: 'Réussir 5 questions sur les panneaux.' }
  ],
  questions: [
    { id: 1, theme: 'panneaux', text: 'Que signifie un panneau STOP ?', options: ['Je ralentis un peu', 'Je m’arrête complètement', 'Je passe vite'], correctIndex: 1, explanation: 'Au STOP, il faut marquer un arrêt complet.' },
    { id: 2, theme: 'sécurité', text: 'Avant de partir à vélo, que dois-tu vérifier ?', options: ['Que mes freins fonctionnent', 'Que mon sac est lourd', 'Que je roule vite'], correctIndex: 0, explanation: 'Un vélo sûr commence par les freins, pneus et éclairages.' },
    { id: 3, theme: 'priorités', text: 'Une voiture arrive à droite à une intersection sans panneau. Que fais-tu ?', options: ['Je passe quand même', 'Je lui cède le passage', 'Je ferme les yeux'], correctIndex: 1, explanation: 'La priorité à droite s’applique lorsqu’aucun panneau ne dit le contraire.' },
    { id: 4, theme: 'comportement', text: 'Peut-on rouler sur le trottoir à vélo ?', options: ['Toujours', 'Jamais sans règle locale', 'Seulement très vite'], correctIndex: 1, explanation: 'Le trottoir est d’abord pour les piétons. Les règles locales peuvent prévoir des exceptions.' },
    { id: 5, theme: 'panneaux', text: 'Une piste cyclable est indiquée. Que fais-tu ?', options: ['Je l’utilise', 'Je roule au milieu de la route', 'Je marche à côté du vélo'], correctIndex: 0, explanation: 'Quand une piste adaptée est prévue, il faut la privilégier.' },
    { id: 6, theme: 'sécurité', text: 'Quand la nuit tombe, quel équipement aide à être vu ?', options: ['Des lumières', 'Un ballon', 'Un klaxon jouet'], correctIndex: 0, explanation: 'Les feux et éléments réfléchissants améliorent la visibilité.' },
    { id: 7, theme: 'comportement', text: 'Tu veux tourner à gauche. Que fais-tu ?', options: ['Je tends le bras', 'Je crie très fort', 'Je tourne sans prévenir'], correctIndex: 0, explanation: 'Signaler sa direction aide les autres usagers à anticiper.' },
    { id: 8, theme: 'priorités', text: 'Au passage piéton, un piéton veut traverser. Que fais-tu ?', options: ['Je passe avant lui', 'Je ralentis et je le laisse passer', 'Je sonne sans m’arrêter'], correctIndex: 1, explanation: 'Le piéton est prioritaire lorsqu’il s’engage pour traverser.' },
    { id: 9, theme: 'environnement', text: 'Une portière de voiture peut s’ouvrir. Que dois-tu faire ?', options: ['Rouler trop près', 'Garder une distance de sécurité', 'Fermer les yeux'], correctIndex: 1, explanation: 'Laisse un espace latéral pour éviter les portières.' },
    { id: 10, theme: 'sécurité', text: 'Le casque est-il utile ?', options: ['Oui, il protège la tête', 'Non, jamais', 'Seulement quand il pleut'], correctIndex: 0, explanation: 'Le casque réduit les risques en cas de chute.' },
    { id: 11, theme: 'panneaux', text: 'Un panneau triangulaire annonce en général…', options: ['Un danger', 'Un parking', 'Une obligation de vitesse'], correctIndex: 0, explanation: 'Les panneaux triangulaires avertissent souvent d’un danger.' },
    { id: 12, theme: 'priorités', text: 'Au rond-point, avant d’entrer, tu dois…', options: ['Forcer le passage', 'Regarder et céder à ceux déjà engagés', 'Accélérer très fort'], correctIndex: 1, explanation: 'Il faut vérifier la circulation avant d’entrer dans le rond-point.' }
  ],
  missions: [
    { id: 'home', title: 'Sortir de chez soi', description: 'Préparer ton vélo et partir en sécurité.', questionIds: [2,10,7,11] },
    { id: 'school', title: 'Aller à l’école', description: 'Apprendre les priorités et les bons réflexes.', questionIds: [1,3,8,5] },
    { id: 'city', title: 'Se déplacer en ville', description: 'Gérer l’environnement urbain en toute vigilance.', questionIds: [4,6,9,12] }
  ]
};
