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
let assets = Array.from(mainDir.data)[0][1];
let scripts = Array.from(assets.data)[0][1];
document.querySelector("#set").onclick = async () => {
    const blob = document.querySelector("#F").files?.[0];
    let file = new File(blob);
    if (file.format == "zip") {
        mainDir = await readZip(blob);
    }
    else {
        mainDir.add(file);
    }
};
document.querySelector("#download").onclick = () => {
    mainDir.download();
};
(function l() {
    document.querySelector("#hierarchy").value = mainDir.getHierarchy({ size: true, text: 10 });
    requestAnimationFrame(l);
})();
window.mainDir = mainDir;
window.SFS = { Directory, File };
