import JSZip from "jszip/dist/jszip.js";
if (!("window" in globalThis))
    throw Error("At the moment, the module is only available in the window area.");
class Base {
    constructor(o) {
        this.parent = null;
        let _this = this;
        _this.rename(o.name);
        _this.createdAt = new Date();
    }
    get name() { return this.__name; }
    ;
    rename(newName) {
        newName = newName.replace(/(^\s+)|(\s+$)/g, "").replace(/\s{2,}/g, " ");
        if (newName == "")
            throw Error("You must specify the name of the file or directory");
        if (newName.match(/^[\\/:*?"<>|]+$/g))
            throw Error(`The file name "${newName}" is not allowed!`);
        if (this.parent?.data.has(newName))
            throw Error(`A file named "${newName}" already exists`);
        this.parent?.data.delete(this.name);
        this.__name = newName;
        this.parent?.add(this);
    }
    findParent(a) {
        if (typeof a == "string" ? this.parent?.name == a : this.parent == a)
            return this.parent;
        else
            return this.parent?.findParent(a) ?? null;
    }
    delete() {
        this.parent?.data.delete(this.name);
        this.parent = null;
    }
    moveTo(dir) {
        if (this == dir || (this instanceof Directory && dir.findParent(this)))
            throw Error("Attempting to move the directory to itself.");
        this.delete();
        dir.add(this);
    }
    async download() {
        const zip = new JSZip();
        const setData = async (d, df) => {
            if (df instanceof Directory) {
                const dir = df == this ? zip : d.folder(df.name);
                for (let f of df.data)
                    await setData(dir, f[1]);
            }
            else if (df instanceof File)
                d.file(df.name, df.data, { binary: true });
        };
        await setData(zip, this);
        zip.generateAsync({ type: "base64" }).then((content) => {
            try {
                const link = document.createElement("a");
                link.href = "data:application/zip;base64," + content;
                link.download = `${this.name}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            catch (error) {
                if (error.message == "window is not defined")
                    console.error("The download is only available in browsers.");
            }
        });
    }
    path(char = " > ") {
        let s = this.parent?.path(char);
        return `${s ? `${s}${char}` : ""}${this.name}`;
    }
}
export class Directory extends Base {
    constructor(o) {
        super(o);
        this.type = "directory";
        this.data = new Map();
        if (o.data)
            this.add(o.data);
        this.data[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => {
                if (a[1] instanceof Directory && !(b[1] instanceof Directory))
                    return -1;
                else if (b[1] instanceof Directory && !(a[1] instanceof Directory))
                    return 1;
                else if (a[0] == b[0])
                    return 0;
                else
                    return a[0] > b[0] ? 1 : -1;
            });
        };
    }
    get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }
    add(o) {
        function f(df) {
            if (this.data.has(df.name))
                throw Error(`A file named "${df.name}" already exists`);
            if (df.parent)
                df.delete();
            df.parent = this;
            this.data.set(df.name, df);
        }
        if (o instanceof Directory || o instanceof File)
            f.call(this, o);
        else
            o.forEach(f.bind(this));
    }
    getHierarchy(O) {
        function _str(o) {
            let text = O?.text ?? 0, v = "";
            if (text > 0 && o instanceof File)
                v = ` "${o.text.substring(0, text).replace("\n", " ") + (text < o.text.length ? "..." : "")}"`;
            return `${o.name}${O?.size ? ` (${o.size} bytes)` : ""}${v}`;
        }
        const getDeep = (deep) => new Array(deep).fill("   ").join("");
        function D(d, deep = 0) {
            let str = `${getDeep(deep)}+---${_str(d)}\n`;
            Array.from(d.data).forEach(df => str += `${df[1] instanceof File ? F(df[1], deep + 1) : D(df[1], deep + 1)}`);
            return str;
        }
        function F(f, deep = 0) {
            return `${getDeep(deep)}|---${_str(f)}\n`;
        }
        return D(this);
    }
    forEach(callbackfn) {
        for (let f of this.data) {
            callbackfn(f[1], f[1].type);
            if (f[1] instanceof Directory)
                f[1].forEach(callbackfn);
        }
    }
    find(name, fn) {
        let df = this.data.get(name);
        return (fn && df && fn(df) && df) || (() => { for (let df of this.data)
            if (df[1] instanceof Directory) {
                let r = df[1].find(name, fn);
                if (r)
                    return r;
            } })() || null;
    }
    addByPath(path, data) {
        let p = path.match(/[^/\s]+/g) ?? [];
        let type = data instanceof Blob || typeof data == "string" ? "file" : "directory";
        if (p.length == 0 && type === "file")
            throw Error("The path must contain at least one name");
        (function f(i) {
            let name = p[i];
            let d = this.data.get(name);
            if (d instanceof File)
                throw Error("Found a file in the path that should have been a directory.");
            if (i == p.length - +(type == "file")) {
                if (type == "directory")
                    (this ?? new Directory({ name })).add(data);
                else
                    this.add(new File({ name, data: data }));
            }
            else {
                !d && this.add(d = new Directory({ name }));
                f.call(d, i + 1);
            }
        }).call(this, 0);
    }
}
export class File extends Base {
    constructor(o) {
        super(o);
        this.type = "file";
        this._text = "";
        o instanceof window.File && (o = { name: o.name, data: o });
        this.data = o.data instanceof Blob ? o.data : new Blob([o.data ?? ""], { type: "text/plain" });
    }
    get data() { return this.__data; }
    set data(v) {
        this.__data = v;
        v.text().then(t => this._text = t);
    }
    get text() { return this._text; }
    get format() { return this.name.search(/\./) > -1 ? this.name.match(/[^\.]+?$/g)?.[0] ?? null : null; }
    get size() {
        return this.data.size;
    }
}
export function readZip(file) {
    return new Promise(resolve => {
        if (file.name.match(/[^\.]+?$/g)?.[0] !== "zip")
            throw Error("Only the \"zip\" format is supported.");
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = async (e) => {
            let res = (await JSZip.loadAsync(e.target?.result));
            const dir = new Directory({ name: file.name.replace(/\.zip$/, "") });
            for (let path in res.files) {
                let f = res.files[path];
                if (!f.dir)
                    dir.addByPath(path, new Blob([f._data.compressedContent ?? ""]));
            }
            resolve(dir);
        };
    });
}
