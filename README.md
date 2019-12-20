QUIZ
====

Un mini générateur de quiz pour Google Forms.

# Usage

Un quiz est un répertoire contenant des fichiers .md qui encodent une question chacun. Le nom du répertoire est le nom du quiz.

Pour créer un quiz, créer un répertoire sous `/md`:
```
[...]/quiz/md/ > mkdir html1
[...]/quiz/md/ > cd html1
```

On ajoute une question
```
[...]/quiz/md/html1 > touch q1.md
```

Dans ce fichier q1.md, on y met le contenu:
```
Que dénote la chaine &#62; dans un node de type TEXT
====================================================

- une série de typos, ça arrive
- une entité représentée par son code
- une entité nommée

## 2
```

Vous aurez noté l'anatomie d'une question: un titre, une liste pour les réponses possibles et un `H2` pour les bonnes réponses, comma separated.

Ensuite, vous lancez l'index:
```
node index.js --verbose html1 4
```

Et vous voyez par vous même.