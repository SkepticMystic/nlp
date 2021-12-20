// import { WinkMethods } from "wink-nlp";

// self.onmessage = async function (e) {
// 	console.log(e);
// 	const docs = {};
// 	const {
// 		contentObj,
// 		winkModel,
// 	}: { contentObj: { [path: string]: string }; winkModel: WinkMethods } =
// 		e.data;

// 	console.log({ contentObj });

// 	for (const path in contentObj) {
// 		docs[path] = winkModel.readDoc(contentObj[path]);
// 	}
// 	self.postMessage(docs);
// };
