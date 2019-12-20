QUIZ
====

Un mini générateur de quiz pour Google Forms.

## Usage

```node index.js [-v | --verbose] quizDir quizNum```

Un quiz est un répertoire (`quizDir`) contenant des fichiers .md qui encodent une question chacun. Le nom du répertoire est le nom du quiz. Le quizNum permet de différencier les promotions.

## Anatomie d'une question

C'est simplement un fichier .md contenant un titre dénotant la question, une liste pour les réponses possibles et un `H2` pour les bonnes réponses, comma separated.

## Exemple

A la racine du projet, nous créons un répertoire/quiz `html1` avec l'arboresence:
```
[ <racine-projet>/md 
  [ js1 [...] ],
  [ js2 [...] ],
  [ js3 [...] ],
]
```

Nous avons déjà quelques tests sur Javascript mais rien sur html. Il faut y pallier de suite.

Pour créer un quiz, il nous faut un répertoire sous `/md`:

```
<racine-projet>/md/ > mkdir html1
<racine-projet>/md/ > cd html1
<racine-projet>/md/ > touch q1.md
<racine-projet>/md/ > touch q2.md
```

Dans le fichier q1.md, on y met le contenu:

```
Comment definir l'encodage d'un document HTML?
==============================================

- la propriété "lang" de la balise html
- la meta balise "charset"
- la propriété "encoding" de la balise html

## 2
```

Dans le fichier q2.md:

```
Comment dénoter l'expression x > 3?
===================================

- x &gt; 3
- x > 3
- x &#62; 3

## 1, 3
```

Et c'est parti pour la génération du quiz, pour la quatrième promotion:

```
<...>/md/ > node index.js --verbose html1 
[snip]
function createForm(){
  var form = FormApp.create('html1 / Promo 4');
  item = form.addMultipleChoiceItem()
  item.setTitle("Comment definir l'encodage d'un document HTML?")
  item.setChoices([
    item.createChoice('la propriété "lang" de la balise html', false),
    item.createChoice('la meta balise "charset"', true),
    item.createChoice('la propriété "encoding" de la balise html', false),
  ]),
  item = form.addMultipleChoiceItem()
  item.setTitle('Comment dénoter l'expression x > 3?')
  item.setChoices([
    item.createChoice('x &gt; 3', true),
    item.createChoice('x > 3', false),
    item.createChoice('x &#62; 3', true),
  ])  Logger.log('Published URL: ' + form.getPublishedUrl());
  Logger.log('Editor URL:    ' + form.getEditUrl());

}

[2019-12-20T07:28:03.279Z] Copying appscript to clipboard
[2019-12-20T07:28:03.292Z] Appscript in clipboard
```

En plus d'être affiché, le code appscript est également copié dans le presse papier.

Reste à créer le Google Form. On se rend sur `https://docs.google.com/forms/u/0/` et on créé un nouveau formulaire, de n'importe quelle sorte. `Blank` est le choix idéal. Une fois sur la page de création de formulaire, on clique sur l'ellipsis à côté de sa photo de profil et on selectionne `Scipt Editor`. On remplace le texte présent par celui copié par le script quiz et on click run (>). Le nouveau formulaire est ajouté à notre accueil Google Forms.