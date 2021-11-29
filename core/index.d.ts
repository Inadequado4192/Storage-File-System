declare type BaseType = {
    name: string;
};
declare abstract class Base {
    readonly name: string;
    parent: Directory | null;
    constructor(o: BaseType);
    get format(): string | null;
    abstract type: "directory" | "file";
    abstract data: string | Map<string, DF>;
    abstract get size(): number;
    abstract __getJSZip(dir: any): any;
    abstract getHierarchy(o?: HierarchyType, ___tab?: string): string;
    protected getHierarchyString(char?: string, o?: HierarchyType, ___tab?: string): string;
    delete(): void;
    findParentDir(a: string | Directory): Directory | null;
    rename(newName: string): void;
    abstract move(dir: Directory): void;
}
declare type DF = Directory | File;
declare type HierarchyType = {
    size?: boolean;
    text?: number;
};
declare type DirecoryType = {
    data?: DF[] | Map<string, DF>;
} & BaseType;
export declare class Directory extends Base {
    type: "directory";
    data: Map<string, DF>;
    constructor(o: DirecoryType);
    get size(): number;
    get(name: string): [string, DF] | null;
    private base;
    createFile(o: FileType): File;
    createDir(o: DirecoryType): Directory;
    add(o: DF): DF;
    getHierarchy(o?: HierarchyType, ___tab?: string): string;
    download(): void;
    __getJSZip(dir: any): any;
    move(dir: Directory): void;
    __sort(): void;
}
declare type FileType = {
    data?: string;
} & BaseType;
export declare class File extends Base {
    type: "file";
    data: string;
    constructor(o: FileType);
    get size(): number;
    getHierarchy(o?: HierarchyType, ___tab?: string): string;
    __getJSZip(dir: any): any;
    move(dir: Directory): void;
}
export {};
