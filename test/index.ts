import { Directory, File, readZip } from "../core/index.js";



let mainDir = new Directory({
    name: "Project",
    data: [
        new File({ name: "README.md" }),
        new File({ name: "Z.txt" }),
        new File({ name: "A.txt" }),
        new Directory({
            name: "Assets",
            data: [
                new Directory({
                    name: "Scripts",
                    data: [
                        new File({ name: "script2.js", data: "console.log('Hello world!!');" }),
                        new File({ name: "script1.js" }),
                        new File({ name: "Z.txt" }),
                    ]
                }),
                new Directory({
                    name: "Sprites",
                    data: [
                        new File({ name: "sprite1.png" }),
                        new File({ name: "sprite2.png", data: "**a**" })
                    ]
                }),
            ]
        }),
    ]
});

let assets = Array.from(mainDir.data)[0][1] as Directory;
let scripts = Array.from(assets.data)[0][1] as Directory;


// mainDir.addByPath(".guide", new File({ name: "F" }));
// scripts.moveTo(mainDir);

(document.querySelector("#set") as HTMLElement).onclick = async () => {
    const blob = (document.querySelector("#F") as HTMLInputElement).files?.[0] as globalThis.File;
    let file = new File(blob);
    if (file.format == "zip") {
        mainDir = await readZip(blob);
    } else {
        mainDir.add(file);
    }
}
(document.querySelector("#download") as HTMLElement).onclick = () => {
    mainDir.download();
}


(function l() {
    (document.querySelector("#hierarchy") as HTMLTextAreaElement).value = mainDir.getHierarchy({ size: true, text: 10 });
    requestAnimationFrame(l);
})();

(window as any).mainDir = mainDir;
(window as any).SFS = { Directory, File }
