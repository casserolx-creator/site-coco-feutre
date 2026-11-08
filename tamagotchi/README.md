# Gros Matou · Mon petit Coco

Jeu statique Coco Feutre, prêt pour GitHub Pages dans `/site-coco-feutre/tamagotchi/`. Aucun serveur applicatif, aucune installation, aucune compilation, aucun compte ChatGPT et aucune API payante ne sont nécessaires.

## Jouer

Ouvrir `tamagotchi/` depuis la carte « Gros Matou · Mon petit Coco » de la rubrique Les Jeux Coco Feutre. Le lien « Les jeux » permet de revenir au site.

- **A** : sauter.
- **B** : manger des croquettes.
- **X** : jouer au ballon avec Pinouille.
- **Y** : faire dodo.
- **L** : faire coucou et miaou.
- **R** : boire un bol d’eau.
- **Espace** : Petit Coin Bidou.

Les boutons répondent au clic, au toucher et au clavier. Entrée active le bouton sélectionné. Le petit interrupteur sur la coque active ou coupe les sons. Les effets sont des sons synthétiques originaux, créés localement avec Web Audio. L’audio attend une interaction du joueur après l’ouverture de la page, même si la préférence « son activé » a été conservée.

## Sauvegarde locale

Le jeu garde les sept actions découvertes, le nombre de fois où elles ont été utilisées, la dernière action, la sieste et la préférence de son. La clé `coco-feutre:tamagotchi:gros-matou:v1` lui est exclusivement réservée. Aucun autre stockage du site n’est modifié.

Les données restent dans le navigateur et sur l’appareil utilisés ; elles ne sont pas synchronisées entre un PC et un téléphone. Effacer les données du navigateur les supprime. Si le stockage est bloqué, le jeu continue en mémoire et affiche que la sauvegarde est indisponible. Une sieste restaurée ne compte pas comme une nouvelle action et ne lance aucun son automatiquement.

Aucune faim obligatoire, aucun malus pendant l’absence, aucune maladie et aucune mort.

## Graphismes fournis

`assets/coco-feutre-sheet.png` conserve la planche originale. Les fenêtres SVG décrites par `atlas.js` et `assets/atlas.json` isolent les poses et les objets sans modifier leurs pixels. La ferme, les personnages, les accessoires et les herbes sont des couches distinctes. Les animations utilisent des changements de pose et des mouvements simples.

## Vérification

```sh
node --test tamagotchi/tests/progress.test.cjs
node --check tamagotchi/game.js
node --check tamagotchi/sounds.js
```

Vérifications réalisées dans le navigateur : les sept actions, l’interrupteur, les raccourcis, une largeur de 375 pixels sans débordement, et la reprise après rechargement des sept découvertes, des compteurs, de la sieste et du réglage sonore.

## Publication

Le dossier est autonome. Conserver les fichiers côte à côte : `index.html`, `style.css`, `screen-mask.css`, `atlas.js`, `progress.js`, `game.js`, `sounds.js` et `assets/`. Tous les chemins sont relatifs pour fonctionner sous le sous-dossier GitHub Pages du site existant.

La modification du site d’accueil ajoute uniquement la nouvelle carte et actualise le nombre de cartes. Les autres jeux, les contenus, les scripts et la feuille de style existants restent inchangés.
