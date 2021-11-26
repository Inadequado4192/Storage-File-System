// import JSZip from "../node_modules/jszip/index/dist";
import { Direcory, File } from "../core/index.js";

let [f1, f2] = [new Direcory({ name: "Dir" }), new File({ name: "script.js" })];

let mainDir = new Direcory({
    name: "dirName",
    data: [f1, f2]
});


console.log(mainDir.getHierarchy({ size: true, text: 5 }));

mainDir.download();