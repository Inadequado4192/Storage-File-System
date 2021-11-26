// import JSZip from "../node_modules/jszip/index/dist";
import { Direcory } from "../core/index.js";

const mainDir = new Direcory({ name: "mainDir" });

mainDir.createFile({ name: "testName", data: "Hello" });
const assets = mainDir.createDir({ name: "assets" });

let i1 = assets.createFile({ name: "image1.png" });
let i2 = assets.createFile({ name: "345.p" });
let i3 = assets.createFile({ name: "i3.png" });

i1.data = "344";
i2.data = "3432133424567";
i3.data = "12345";

console.log(mainDir.getHierarchy({ size: true, text: 5 }));

mainDir.download();