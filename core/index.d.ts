declare type BaseType = {
    name: string;
};
declare abstract class Base {
    private _name;
    get name(): string;
    set name(v: string);
    parent: Direcory | null;
    constructor(o: BaseType);
    get format(): string | null;
    abstract type: "directory" | "file";
    abstract data: string | DF[] | Map<string, DF>;
    abstract get size(): number;
    abstract __getJSZip(dir: any): any;
    abstract getHierarchy(o?: HierarchyType, ___tab?: string): string;
    protected getHierarchyString(char?: string, o?: HierarchyType, ___tab?: string): string;
    delete(): void;
    abstract move(dir: Direcory): void;
}
declare type DF = Direcory | File;
declare type HierarchyType = {
    size?: boolean;
    text?: number;
};
declare type DirecoryType = {
    data?: DF[] | Map<string, DF>;
} & BaseType;
export declare class Direcory extends Base {
    type: "directory";
    data: Map<string, DF>;
    constructor(o: DirecoryType);
    get size(): number;
    get(name: string): DF | null;
    private base;
    createFile(o: FileType): File;
    createDir(o: DirecoryType): Direcory;
    add(o: DF): DF;
    getHierarchy(o?: HierarchyType, ___tab?: string): string;
    download(): void;
    __getJSZip(dir: any): any;
    move(dir: Direcory): void;
    private __sort;
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
    move(dir: Direcory): void;
}
export {};
