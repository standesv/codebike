# VéloCode Kids V1

PWA statique pour apprendre les bases du code de la route à vélo pour les enfants.

## Contenu
- `index.html` : point d'entrée
- `styles.css` : styles
- `data.js` : contenu par défaut (questions, missions, badges)
- `storage.js` : persistance localStorage
- `game-engine.js` : logique XP / badges / niveaux
- `app.js` : écrans et navigation
- `service-worker.js` : mode offline basique

## Lancer localement
```bash
python3 -m http.server 8080
```
Puis ouvrir `http://localhost:8080`.

## Déployer sur GitHub Pages
Dépose les fichiers à la racine du dépôt, puis active GitHub Pages sur la branche principale (`/root`).

## Administration
Le bouton **Admin** permet d’exporter/importer le contenu JSON et de le modifier sans toucher au code.
