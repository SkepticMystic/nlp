const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model");
const nlp = winkNLP(model);

onmessage = function (e) {
	const message = nlp.readDoc(e.data).tokens().out();
	console.log(`[From Main (Text)]: ${e.data}`);

	postMessage(JSON.stringify(message));
};
