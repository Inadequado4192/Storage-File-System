// import JSZip from "../node_modules/jszip/index/dist";
import { Directory, File } from "../core/index.js";

let mainDir = new Directory({
    name: "Project",
    data: [
        new Directory({
            name: "Assets",
            data: [
                new Directory({
                    name: "Scripts",
                    data: [
                        new File({ name: "script2.js" }),
                        new File({ name: "script1.js" })
                    ]
                }),
                new Directory({
                    name: "Sprites",
                    data: [
                        new File({ name: "sprite1.png" }),
                        new File({ name: "sprite2.png" })
                    ]
                }),
            ]
        }),
        new File({ name: "README.md" }),
    ]
});

let assets = Array.from(mainDir.data)[0][1] as Directory;
let scripts = Array.from(assets.data)[0][1] as Directory;
// assets.move(scripts);

assets.rename("NN");
let nf = new File({ name: "m" });
mainDir.add(nf);
// assets.delete();

console.log(mainDir);
console.log(mainDir.getHierarchy({ size: true, text: 5 }));

mainDir.download();