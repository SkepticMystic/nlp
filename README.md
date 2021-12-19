# NLP

The NLP plugin enables various different types of natural language processing in your vault.

It pulls in a few different nlp libraries and exposes various features of them to your vault.

## Features

### Text Maniupulation

Using `compromise`'s functions, you can select a range of text and apply different manipulations to it.
I won't list every single one ehre, but basically any function in [this list](https://github.com/spencermountain/compromise/#api) that starts with `.to` can be used. Just search for `toUpperCase`, for example, in the commmand palette to see different options.

![](https://imgur.com/HhDlI3t.png)

### Match Modal

Using `compromise`'s [match-syntax](https://observablehq.com/@spencermountain/compromise-match-syntax), you can run regex-like searches on a note.

Match-syntax is an even more powerful regex search (it enables a superset of it's functionality). It's regex search with an understanding of language.

Read the docs in the link above, play around with it [here](https://observablehq.com/@spencermountain/compromise-match-test), or just test it in your vault!

![](https://imgur.com/x1efBwL.png)

### Markup Modal

The Markup Modal uses `winkjs`'s entity recognition functionality to wrap entities (and other things) in whatever you want.

It currently struggles a bit with markdown syntax, but it's a start.

![](https://imgur.com/rQaobfw.png)

## API

NLP also works with other plugins. Currently, it only adds features to [Graph Analysis](https://github.com/SkepticMystic/graph-analysis).

With NLP installed (and the `Refresh Docs on Load` setting enabled), you can use Graph Analysis to run _document_ similarity algortihms on your notes. Without NLP, Grpah Analysis only works with the structure of your graph, not the content of your notes (besides the CoCites algorithm 😋).

It adds these three algs to Graph Analysis (marked with a 💬):

![](https://imgur.com/eJ9o5bk.png)
