import JSZip from "jszip/dist/jszip.js";

type BaseType = { name: string }
abstract class Base {
    private _name!: string;
    public get name() { return this._name; }
    public set name(v) {
        if (v.match(/^[\\/:*?"<>|]+$/g)) throw Error(`The file name "${v}" is not allowed!`)
        else this._name = v;
    }

    public parent: Directory | null = null;
    public constructor(o: BaseType) {
        this.name = o.name;
    }

    public get format() { return this.name.search(/\./) > -1 ? (<RegExpMatchArray>this.name.match(/[^\.]+?$/g))?.[0] ?? null : null }


    public abstract type: "directory" | "file";
    public abstract data: string | Set<DF>;
    public abstract get size(): number;
    public abstract __getJSZip(dir: any): any;
    public abstract getHierarchy(o?: HierarchyType, ___tab?: string): string;

    protected getHierarchyString(char: string = "|", o?: HierarchyType, ___tab: string = "") {
        let text = o?.text ?? 0, v: string = "";
        if (text > 0 && this instanceof File) v = ` "${this.data.substring(0, text) + (text < this.data.length ? "..." : "")}"`;
        return `${___tab}${char}---${this.name}${o?.size ? ` (${this.size} bytes)` : ""}${v}\n`;
    }
    public delete() {
        this.parent?.data.delete(this as DF);
        this.parent = null;
    }
    public findParentDir(a: string | Directory): Directory | null {
        if (typeof a == "string" ? this.parent?.name == a : this.parent == a) return this.parent;
        else return this.parent?.findParentDir(a) ?? null;
    }


    public abstract move(dir: Directory): void;

}
type DF = Directory | File;

type HierarchyType = {
    size?: boolean,
    text?: number
}

type DirecoryType = { data?: DF[] | Set<DF> } & BaseType;
export class Directory extends Base {
    public type = "directory" as const;
    public data: Set<DF>;

    public constructor(o: DirecoryType) {
        super(o);
        this.data = o.data instanceof Set ? o.data : new Set(o.data);//new Map(o.data?.map(f => [f.name, f]));
        Array.from(this.data).forEach(f => f.parent = this);
        this.__sort();
    }

    public get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }

    public get(name: string) { return Array.from(this.data).find(f => f.name === name) ?? null; }

    private base<T extends DF>(_: T) { return (_.parent = this, this.__sort(), _) }
    public createFile(o: FileType) { let f = new File(o); return (this.data.add(f), this.base(f)); }
    public createDir(o: DirecoryType) { let d = new Directory(o); return (this.data.add(d), this.base(d)); }

    public add(o: DF) { return this.data.add(o), this.base(o); }

    public getHierarchy(o?: HierarchyType, ___tab: string = "") {
        let str = this.getHierarchyString("+", o, ___tab);
        this.data.forEach(f => str += "|" + f.getHierarchy(o, ___tab + "   "));
        return str;
    }
    public download() {
        const zip = new JSZip();

        const dir = zip.folder(this.name);
        this.data.forEach(f => f.__getJSZip(dir));

        zip.generateAsync({ type: "base64" }).then(function (content: string) {
            try { window.location.href = "data:application/zip;base64," + content; }
            catch (error) { if ((error as Error).message == "window is not defined") console.error("The download is only available in browsers."); }
        });
    }
    public __getJSZip(dir: any) {
        let thisDir = dir.folder(this.name);
        this.data.forEach(f => f.__getJSZip(thisDir));
        return thisDir;
    }

    public move(dir: Directory) {
        if (this == dir || dir.findParentDir(this)) throw Error("Attempting to move the directory to itself."); 
        this.delete();
        dir.add(this);
    }

    private __sort() {
        this.data = new Set(
            Array.from(this.data).sort((a, b) => a.type == "directory" ? -1 : 1)
        );
    }
}

type FileType = { data?: string } & BaseType;
export class File extends Base {
    public type = "file" as const;
    public data: string;
    public constructor(o: FileType) {
        super(o);
        this.data = o.data ?? "";
    }

    public get size() {
        return this.data.length;
    }

    public getHierarchy(o?: HierarchyType, ___tab: string = "") {
        return this.getHierarchyString("|", o, ___tab);//`${tab}|---${this.name}\n`;
    }
    public __getJSZip(dir: any) {
        return dir.file(this.name, this.data);
    }

    public move(dir: Directory) {
        this.delete();
        dir.add(this);
    }
}