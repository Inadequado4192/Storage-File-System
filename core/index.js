import JSZip from "jszip/dist/jszip.js";
class Base {
    constructor(o) {
        this.parent = null;
        this.name = o.name;
    }
    get name() { return this._name; }
    set name(v) {
        if (v.match(/^[\\/:*?"<>|]+$/g))
            throw Error(`The file name "${v}" is not allowed!`);
        else
            this._name = v;
    }
    get format() { return this.name.search(/\./) > -1 ? this.name.match(/[^\.]+?$/g)?.[0] ?? null : null; }
    getHierarchyString(char = "|", o, ___tab = "") {
        let text = o?.text ?? 0, v = "";
        if (text > 0 && this instanceof File)
            v = ` "${this.data.substring(0, text) + (text < this.data.length ? "..." : "")}"`;
        return `${___tab}${char}---${this.name}${o?.size ? ` (${this.size} bytes)` : ""}${v}\n`;
    }
    delete() {
        this.parent?.data.delete(this.name);
        this.parent = null;
    }
    findParentDir(a) {
        if (typeof a == "string" ? this.parent?.name == a : this.parent == a)
            return this.parent;
        else
            return this.parent?.findParentDir(a) ?? null;
    }
}
export class Directory extends Base {
    constructor(o) {
        super(o);
        this.type = "directory";
        this.data = o.data instanceof Map ? o.data : new Map(o.data?.map(f => [f.name, f]));
        Array.from(this.data).forEach(f => f[1].parent = this);
        this.__sort();
    }
    get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }
    get(name) { return this.data.get(name) ?? null; }
    base(_) { return (_.parent = this, this.__sort(), _); }
    createFile(o) { let f = new File(o); return (this.data.set(f.name, f), this.base(f)); }
    createDir(o) { let d = new Directory(o); return (this.data.set(d.name, d), this.base(d)); }
    add(o) { return this.data.set(o.name, o), this.base(o); }
    getHierarchy(o, ___tab = "") {
        let str = this.getHierarchyString("+", o, ___tab);
        this.data.forEach(f => str += "|" + f.getHierarchy(o, ___tab + "   "));
        return str;
    }
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
    move(dir) {
        if (this == dir || dir.findParentDir(this))
            throw Error("Attempting to move the directory to itself.");
        this.delete();
        dir.add(this);
    }
    __sort() {
        this.data = new Map(Array.from(this.data).sort((a, b) => a[1].type == "directory" ? -1 : 1));
    }
}
export class File extends Base {
    constructor(o) {
        super(o);
        this.type = "file";
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
    move(dir) {
        this.delete();
        dir.add(this);
    }
}
