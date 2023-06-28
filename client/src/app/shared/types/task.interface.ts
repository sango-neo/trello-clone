export interface TaskInterface {
    id: string;
    title: string;
    description?: string;
    boardId: string;
    columnId: string;
    userId: string;
}