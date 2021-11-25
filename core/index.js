import JSZip from "jszip/dist/jszip.js";
class Base {
    constructor(o) {
        this.name = o.name;
    }
    get format() { return this.name.search(/\./) > -1 ? this.name.match(/[^\.]+?$/g)[0] : null; }
    getHierarchyString(char = "|", o, ___tab = "") {
        let text = o?.text ?? 0, v = "";
        if (text > 0 && this instanceof File)
            v = ` "${this.data.substring(0, text) + (text < this.data.length ? "..." : "")}"`;
        return `${___tab}${char}---${this.name}${o?.size ? ` (${this.size} bytes)` : ""}${v}\n`;
    }
}
export class Direcory extends Base {
    constructor(o) {
        super(o);
        this.data = o.data instanceof Set ? o.data : new Set(o.data);
    }
    createFile(o) { let f = new File(o); return (this.data.add(f), f); }
    createDir(o) { let d = new Direcory(o); return (this.data.add(d), d); }
    getHierarchy(o, ___tab = "") {
        let str = this.getHierarchyString("+", o, ___tab);
        this.data.forEach(f => str += "|" + f.getHierarchy(o, ___tab + "   "));
        return str;
    }
    __sort() { }
    download() {
        const zip = new JSZip();
        const dir = zip.folder(this.name);
        this.data.forEach(f => f.__getJSZip(dir));
        zip.generateAsync({ type: "base64" }).then(function (content) {
            try {
                window.location.href = "data:application/zip;base64," + content;
            }
            catch (error) {
                if (error.message == "window is not defined")
                    console.error("The download is only available in browsers.");
            }
        });
    }
    __getJSZip(dir) {
        let thisDir = dir.folder(this.name);
        this.data.forEach(f => f.__getJSZip(thisDir));
        return thisDir;
    }
    get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }
}
export class File extends Base {
    constructor(o) {
        super(o);
        this.data = o.data ?? "";
    }
    get size() {
        return this.data.length;
    }
    getHierarchy(o, ___tab = "") {
        return this.getHierarchyString("|", o, ___tab);
    }
    __getJSZip(dir) {
        return dir.file(this.name, this.data);
    }
}
