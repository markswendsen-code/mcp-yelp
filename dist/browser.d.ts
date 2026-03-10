import { Page } from "playwright";
export declare class YelpBrowser {
    private browser;
    private context;
    private page;
    initialize(): Promise<void>;
    getPage(): Promise<Page>;
    navigate(url: string): Promise<void>;
    waitForSelector(selector: string, timeout?: number): Promise<void>;
    evaluate<T>(fn: string | (() => T)): Promise<T>;
    evaluateWithArg<T>(fn: (arg: any) => T, arg: any): Promise<T>;
    close(): Promise<void>;
}
