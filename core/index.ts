import JSZip from "jszip/dist/jszip.js";

type BaseType = { name: string }
abstract class Base {
    public name: string;
    public abstract data: string | DF[] | Set<DF>;
    public constructor(o: BaseType) {
        this.name = o.name;
    }

    public get format() { return this.name.search(/\./) > -1 ? (<RegExpMatchArray>this.name.match(/[^\.]+?$/g))[0] : null }

    public abstract get size(): number;
    public abstract __getJSZip(dir: any): any;
}
type DF = Direcory | File;

type DirecoryType = { data?: DF[] | Set<DF> } & BaseType;
export class Direcory extends Base {
    public data: Set<DF>;
    public constructor(o: DirecoryType) {
        super(o);
        this.data = o.data instanceof Set ? o.data : new Set(o.data);
    }

    public createFile(o: FileType) { let f = new File(o); return (this.data.add(f), f); }
    public createDir(o: DirecoryType) { let d = new Direcory(o); return (this.data.add(d), d); }
    public getHierarchy(___tab: string = "") {
        let str = `${___tab}+---${this.name}\n`;
        this.data.forEach(f => str += "|" + f.getHierarchy(___tab + "   "));
        return str;
    }
    private __sort() { }
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

    public get size() {
        let s = 0;
        this.data.forEach(f => s += f.size);
        return s;
    }
}

type FileType = { data?: string } & BaseType;
export class File extends Base {
    public data: string;
    public constructor(o: FileType) {
        super(o);
        this.data = o.data ?? "";
    }

    public get size() {
        return this.data.length;
    }

    public getHierarchy(tab: string = "") {
        return `${tab}|---${this.name}\n`;
    }
    public __getJSZip(dir: any) {
        return dir.file(this.name, this.data);
    }
}



// function download(text: string, name: string, type: "text/plain") {
//     let a = document.createElement("a");
//     // var file = new Blob([text], { type: type });
//     // a.href = URL.createObjectURL(file);
//     a.href = `data:text/plain;base64,${btoa(text)}`
//     a.download = name;
//     a.click();
// }