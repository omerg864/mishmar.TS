export declare class LogController {
    FailLogs(body: {
        err: Object;
        path: string;
        user: Object;
        component: string;
    }): Promise<void>;
}
