declare type BaseType = {
    name: string;
};
declare abstract class Base {
    name: string;
    parent: Direcory | null;
    constructor(o: BaseType);
    get format(): string | null;
    abstract type: "directory" | "file";
    abstract data: string | DF[] | Map<string, DF>;
    abstract get size(): number;
    abstract __getJSZip(dir: any): any;
    abstract getHierarchy(o?: HierarchyType, ___tab?: string): string;
    protected getHierarchyString(char?: string, o?: HierarchyType, ___tab?: string): string;
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
    getHierarchy(o?: HierarchyType, ___tab?: string): string;
    download(): void;
    __getJSZip(dir: any): any;
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
}
export {};
