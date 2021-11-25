declare type BaseType = {
    name: string;
};
declare abstract class Base {
    name: string;
    abstract data: string | DF[] | Set<DF>;
    constructor(o: BaseType);
    get format(): string | null;
    abstract get size(): number;
    abstract __getJSZip(dir: any): any;
}
declare type DF = Direcory | File;
declare type DirecoryType = {
    data?: DF[] | Set<DF>;
} & BaseType;
export declare class Direcory extends Base {
    data: Set<DF>;
    constructor(o: DirecoryType);
    createFile(o: FileType): File;
    createDir(o: DirecoryType): Direcory;
    getHierarchy(___tab?: string): string;
    private __sort;
    download(): void;
    __getJSZip(dir: any): any;
    get size(): number;
}
declare type FileType = {
    data?: string;
} & BaseType;
export declare class File extends Base {
    data: string;
    constructor(o: FileType);
    get size(): number;
    getHierarchy(tab?: string): string;
    __getJSZip(dir: any): any;
}
export {};
