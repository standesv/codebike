# VéloCode Kids V2

PWA statique prête à être déposée sur GitHub Pages.

## Contenu livré
- 120 questions illustrées
- 10 missions
- 32 illustrations SVG embarquées
- administration locale : ajout, édition, suppression
- import JSON
- import de médias avec rattachement automatique via convention de nommage (`Q001_main.png`)
- validation automatique : questions incomplètes, médias manquants, doublons, incohérences de structure

## Lancer en local
```bash
python3 -m http.server 8080
```
Puis ouvrir `http://localhost:8080`.

## Déploiement GitHub Pages
Dépose tout le contenu du dossier à la racine du dépôt puis active **Settings > Pages > Deploy from a branch** sur la branche `main`.

## Format d'import
- JSON structuré avec tableau `questions`
- Images optionnelles importables séparément ; le système rattache automatiquement un fichier nommé `Q123_main.png` à la question `Q123`

## Remarque
Cette V2 reste une application statique. Pour une V3 plus industrielle, le bon chemin est :
- base Supabase
- back-office Directus
- front PWA / Flutter branchés sur la même API
