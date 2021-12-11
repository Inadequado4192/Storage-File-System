declare type DF = Directory | File;
declare type _Map = Map<string, DF>;
declare type BaseConstructor = {
    name: string;
};
declare type DirectoryData = _Map;
declare type DirectoryConstructor = {
    data?: DF[] | DirectoryData;
};
declare type FileData = Blob;
declare type FileConstructor = {
    data?: FileData | string;
};
declare type HierarchyType = {
    size?: boolean;
    text?: number;
};
declare abstract class Base {
    private __name;
    get name(): string;
    createdAt: Date;
    parent: Directory | null;
    readonly type: "directory" | "file";
    constructor(o: BaseConstructor);
    abstract data: FileData | DirectoryData;
    abstract get size(): number;
    rename(this: DF, newName: string): void;
    findParent(this: DF, a: string | Directory): Directory | null;
    delete(this: DF): void;
    moveTo(this: DF, dir: Directory): void;
    download(this: DF): Promise<void>;
    path(this: DF, char?: string): string;
}
export declare class Directory extends Base {
    readonly type: "directory";
    readonly data: DirectoryData;
    constructor(o: (DirectoryConstructor & BaseConstructor));
    get size(): number;
    add(o: DF | DF[] | _Map): void;
    getHierarchy(O?: HierarchyType): string;
    forEach(callbackfn: (df: DF, type: string) => void): void;
    find(name: string, fn?: (df: DF) => boolean): DF | null;
    addByPath(path: string, data: Required<(DirectoryConstructor | FileConstructor)>["data"]): void;
}
export declare class File extends Base {
    readonly type: "file";
    private __data;
    get data(): Blob;
    set data(v: Blob);
    private _text;
    get text(): string;
    constructor(o: (FileConstructor & BaseConstructor) | globalThis.File);
    get format(): string | null;
    get size(): number;
    getBase64(): Promise<string>;
}
export declare function readZip(file: globalThis.File): Promise<Directory>;
export {};
