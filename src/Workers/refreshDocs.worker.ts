const winkNLP = require("wink-nlp");
const model = require("wink-eng-lite-web-model")
console.log(model)
const winkModel = winkNLP(model);
onmessage = function (e) {
	const message = winkModel.readDoc(e.data).tokens().out();
	console.log(`[From Main (Text)]: ${e.data}`);

	postMessage(JSON.stringify(message));
};
