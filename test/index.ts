// import JSZip from "../node_modules/jszip/index/dist";
import { Direcory } from "../core/index.js";

const mainDir = new Direcory({ name: "mainDir" });

mainDir.createFile({ name: "testName", data: "Hello" });
const assets = mainDir.createDir({ name: "assets" });

assets.createFile({ name: "image1.png" });
assets.createFile({ name: "image2.png" });
assets.createFile({ name: "image3.png" });

console.log(mainDir.getHierarchy());

mainDir.download();