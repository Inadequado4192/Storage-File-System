import JSZip from "jszip/dist/jszip.js";

if (!("window" in globalThis)) throw Error("At the moment, the module is only available in the window area.");

type DF = Directory | File;


type _Map = Map<string, DF>;
type BaseConstructor = { name: string };


type DirectoryData = _Map;
type DirectoryConstructor = { data?: DF[] | DirectoryData }


type FileData = Blob;
type FileConstructor = { data?: FileData | string }


type HierarchyType = {
    size?: boolean,
    text?: number
}

/**
 * The base class from which `Directory` and `File` are derived.
 */
abstract class Base {
    private __name!: string;
    /** File name */
    public get name() { return this.__name };
    /** The time when the file was created. */
    public createdAt!: Date;
    /** Parent directory. Can be `null`. */
    public parent: Directory | null = null;
    /** Contains a string in the form of a `"directory"` or `"file"`. */
    public readonly type!: "directory" | "file";

    public constructor(o: BaseConstructor) {
        let _this = this as unknown as DF;
        _this.rename(o.name);
        _this.createdAt = new Date();
    }

    public abstract data: FileData | DirectoryData;
    /** File size in bytes. */
    public abstract get size(): number;

    /** Rename the file.
     * @param newName new name
     */
    public rename(this: DF, newName: string) {
        newName = newName.replace(/(^\s+)|(\s+$)/g, "").replace(/\s{2,}/g, " ");
        if (newName == "") throw Error("You must specify the name of the file or directory");
        if (newName.match(/^[\\/:*?"<>|]+$/g)) throw Error(`The file name "${newName}" is not allowed!`);
        if (this.parent?.data.has(newName)) throw Error(`A file named "${newName}" already exists`);

        this.parent?.data.delete(this.name);
        this.__name = newName;
        this.parent?.add(this);
    }

    /** Search the parent directory up in the hierarchy.
     * @param a string or a directory instance
     * @returns Directory | null
     */
    public findParent(this: DF, a: string | Directory): Directory | null {
        if (typeof a == "string" ? this.parent?.name == a : this.parent == a) return this.parent;
        else return this.parent?.findParent(a) ?? null;
    }

    /** Delete file.
     * 
     * This method simply removes that instance from the parent directory.
     */
    public delete(this: DF) {
        this.parent?.data.delete(this.name);
        this.parent = null;
    }

    /** Moves the file to a new directory. */
    public moveTo(this: DF, dir: Directory) {
        if (this == dir || (this instanceof Directory && dir.findParent(this))) throw Error("Attempting to move the directory to itself.");
        this.delete();
        dir.add(this);
    }

    /** Download file.
     * 
     * Downloads the `.zip` extension file that will contain the file.
     */
    public async download(this: DF) {
        const zip = new JSZip();

        const setData = async (d: any, df: DF) => {
            if (df instanceof Directory) {
                const dir = df == this ? zip : d.folder(df.name);
                for (let f of df.data) await setData(dir, f[1]);
            } else if (df instanceof File) d.file(df.name, df.data, { binary: true });
        }

        await setData(zip, this);


        // if (this instanceof Directory && (o.createGuide ?? false)) {
        //     let data = this.name;
        //     this.forEach(df => data += `\n${df.path("\\")}`);
        //     zip.file(".guide", data);
        // }

        zip.generateAsync({ type: "base64" }).then((content: string) => {
            try {
                const link = document.createElement("a");
                link.href = "data:application/zip;base64," + content;
                link.download = `${this.name}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            catch (error) { if ((error as Error).message == "window is not defined") console.error("The download is only available in browsers."); }
        });
        // if (this instanceof Directory) {
        //     try { window.location.href = "data:application/zip;base64," + (this.find("1.png") as File).data64; }
        //     catch (error) { if ((error as Error).message == "window is not defined") console.error("The download is only available in browsers."); }
        // }
    }

    /** 
     * @param char The symbol that separates file names.
     * @returns Returns the file path
     * @example
     * console.log(sprite1.path());
     * Project > Assets > Sprites > sprite1.png
     * console.log(sprite1.path("\\"));
     * Project\Assets\Sprites\sprite1.png
     */
    public path(this: DF, char: string = " > "): string {
        let s = this.parent?.path(char);
        return `${s ? `${s}${char}` : ""}${this.name}`;
    }
}

export class Directory extends Base {
    public readonly type = "directory" as const;
    /** Map Object containing files stored in the directory. */
    public readonly data: DirectoryData = new Map();

    constructor(o: (DirectoryConstructor & BaseConstructor)) {
        super(o);

        if (o.data) this.add(o.data);

        this.data[Symbol.iterator] = function* () {
            yield* [...this.entries()].sort((a, b) => {
                if (a[1] instanceof Directory && !(b[1] instanceof Directory)) return -1;
                else if (b[1] instanceof Directory && !(a[1] instanceof Directory)) return 1;
                else if (a[0] == b[0]) return 0;
                else return a[0] > b[0] ? 1 : -1;
            });
        }
    }

    public get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }


    /** Add a new file or directory */
    public add(o: DF | DF[] | _Map) {
        function f(this: Directory, df: DF) {
            if (this.data.has(df.name)) throw Error(`A file named "${df.name}" already exists`);
            if (df.parent) df.delete();
            df.parent = this;
            this.data.set(df.name, df);
        }
        if (o instanceof Directory || o instanceof File) f.call(this, o);
        else o.forEach(f.bind(this));
    }

    /** Get directory hierarchy
     * 
     * @example
     * let mainDir = new Directory({
     *     name: "Project",
     *     data: [
     *         new Directory({
     *             name: "Assets",
     *             data: [
     *                 new Directory({
     *                     name: "Scripts",
     *                     data: [
     *                         new File({ name: "script2.js", data: "console.log('Hello world!!');" }),
     *                         new File({ name: "script1.js" })
     *                     ]
     *                 }),
     *                 new Directory({
     *                     name: "Sprites",
     *                     data: [
     *                         new File({ name: "sprite1.png" }),
     *                         new File({ name: "sprite2.png" })
     *                     ]
     *                 }),
     *             ]
     *         }),
     *         new File({ name: "README.md" }),
     *     ]
     * });
     * 
     * console.log(mainDir.getHierarchy());
        // +---Project
        //    +---Assets
        //       +---Scripts
        //          |---script2.js
        //          |---script1.js
        //       +---Sprites
        //          |---sprite1.png
        //          |---sprite2.png
        //    |---README.md
     * 
     * 
     * 
     * console.log(mainDir.getHierarchy({ size: true, text: 5 }));
        // +---Project (29 bytes)
        // +---Assets (29 bytes)
        //     +---Scripts (29 bytes)
        //         |---script2.js (29 bytes) "conso..."
        //         |---script1.js (0 bytes) ""
        //     +---Sprites (0 bytes)
        //         |---sprite1.png (0 bytes) ""
        //         |---sprite2.png (0 bytes) ""
        // |---README.md (0 bytes) ""
     */
    public getHierarchy(O?: HierarchyType) {
        function _str(o: DF) {
            let text = O?.text ?? 0,
                v: string = "";
            if (text > 0 && o instanceof File) v = ` "${o.text.substring(0, text).replace("\n", " ") + (text < o.text.length ? "..." : "")}"`;

            return `${o.name}${O?.size ? ` (${o.size} bytes)` : ""}${v}`
        }
        const getDeep = (deep: number) => new Array(deep).fill("   ").join("");

        function D(d: Directory, deep: number = 0) {
            let str = `${getDeep(deep)}+---${_str(d)}\n`;
            Array.from(d.data).forEach(df => str += `${df[1] instanceof File ? F(df[1], deep + 1) : D(df[1], deep + 1)}`);
            return str;
        }
        function F(f: File, deep: number = 0) {
            return `${getDeep(deep)}|---${_str(f)}\n`;
        }

        return D(this);
    }

    /** Go through all of the files and directories. */
    public forEach(callbackfn: (df: DF, type: string) => void) {
        for (let f of this.data) {
            callbackfn(f[1], f[1].type);
            if (f[1] instanceof Directory) f[1].forEach(callbackfn);
        }
    }

    /** Looks for the first file/directory whose name matches the argument. */
    public find(name: string, fn?: (df: DF) => boolean): DF | null {
        let df = this.data.get(name);
        return (fn && df && fn(df) && df) || (() => { for (let df of this.data) if (df[1] instanceof Directory) { let r = df[1].find(name, fn); if (r) return r } })() || null;
    }

    /** 
     * Adds a folder or file based on a specified path.
     * 
     * If there is a non-existent folder in the specified path, it will be created (does not work if there is a file with that name).
     * 
     * @param path The path where the file will be created.
     * @param data The data that determines what will be created
     * @example
     * mainDir.addByPath("public/script.js", "() => {}");
     * // OR
     * mainDir.addByPath("public/script.js", new Blob(["() => {}"]));
     * 
     * mainDir.addByPath("public/img", [new File({ name: "img.png" })]);
     */
    public addByPath(path: string, data: Required<(DirectoryConstructor | FileConstructor)>["data"]) {
        let p = path.match(/[^/\s]+/g) ?? [];

        let type: "directory" | "file" = data instanceof Blob || typeof data == "string" ? "file" : "directory";

        if (p.length == 0 && type === "file") throw Error("The path must contain at least one name");

        (function f(this: Directory, i: number) {
            let name = p[i];
            let d = this.data.get(name);
            if (d instanceof File) throw Error("Found a file in the path that should have been a directory.");

            if (i == p.length - +(type == "file")) {
                if (type == "directory") (this ?? new Directory({ name })).add(data as Required<DirectoryConstructor>["data"]);
                else this.add(new File({ name, data: data as Required<FileConstructor>["data"] }))
            } else {
                !d && this.add(d = new Directory({ name }));
                f.call(d, i + 1);
            }

        }).call(this, 0);
    }
}

export class File extends Base {
    public readonly type = "file" as const;
    private __data!: FileData;
    /** Just `blob` ^^ */
    public get data() { return this.__data; }
    public set data(v) {
        this.__data = v;
        v.text().then(t => this._text = t);
    }
    /** The text contained in `blob.text()` (`this.data`). Automatically updated when `this.data` changes.
     * 
     * **WARNING: Since getting text from `blob.text()` is asynchronous, assigning text to `this.text` is also asynchronous.**
     */
    public _text: string = "";
    public get text() { return this._text; }

    constructor(o: (FileConstructor & BaseConstructor) | globalThis.File) {
        super(o);

        o instanceof window.File && (o = { name: o.name, data: o });

        this.data = o.data instanceof Blob ? o.data : new Blob([o.data ?? ""], { type: "text/plain" });
    }

    /** Returns the file format */
    public get format() { return this.name.search(/\./) > -1 ? (<RegExpMatchArray>this.name.match(/[^\.]+?$/g))?.[0] ?? null : null }


    public get size() {
        return this.data.size;//lengthInUtf8Bytes(this.data);
    }

}

export function readZip(file: globalThis.File) {
    return new Promise<Directory>(resolve => {
        if (file.name.match(/[^\.]+?$/g)?.[0] !== "zip") throw Error("Only the \"zip\" format is supported.")
        let reader = new FileReader();
        reader.readAsBinaryString(file);
        reader.onload = async e => {
            let res = (await JSZip.loadAsync(e.target?.result)) as JSZipObject;
            const dir = new Directory({ name: file.name.replace(/\.zip$/, "") });

            for (let path in res.files) {
                let f = res.files[path];
                if (!f.dir) dir.addByPath(path, new Blob([f._data.compressedContent ?? ""]));
            }
            resolve(dir);
        }
    });
}


interface JSZipObject {
    clone: Function,
    comment: null,
    files: { [key: string]: JSZipFile }
    root: string
}
interface JSZipFile {
    comment: null
    date: Date,
    dir: boolean
    dosPermissions: number
    name: string
    options: { compression: null, compressionOptions: null }
    unixPermissions: null
    _data: { compressedSize: number, uncompressedSize: number, crc32: number, compression: {}, compressedContent: Uint8Array }
    _dataBinary: boolean
}