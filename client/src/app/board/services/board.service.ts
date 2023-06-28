//This service will act as a state manager for each board. 

import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SocketService } from "src/app/shared/services/socket.service";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { ColumnInterface } from "src/app/shared/types/column.interface";
import { SocketEventsEnum } from "src/app/shared/types/socketEvents.enum";
import { TaskInterface } from "src/app/shared/types/task.interface";

@Injectable()

export class BoardService {
    board$ = new BehaviorSubject<BoardInterface | null>(null);
    columns$ = new BehaviorSubject<ColumnInterface[]>([]);
    tasks$ = new BehaviorSubject<TaskInterface[]>([]);

    constructor(private socketService: SocketService) {}

    setBoard(board: BoardInterface): void {
        this.board$.next(board); //setting the app-wide board
    }

    setColumns(columns: ColumnInterface[]): void {
        this.columns$.next(columns); 
    }

    setTasks(tasks: TaskInterface[]): void {
        this.tasks$.next(tasks); //setting the tasks available in the app while it runs
    }

    leaveBoard(boardId: string): void {
        this.board$.next(null);
        this.socketService.emit(SocketEventsEnum.boardsLeave, {boardId});
    }

    addColumn(column: ColumnInterface): void {
        const updatedColumns = [...this.columns$.getValue(), column];
        this.columns$.next(updatedColumns);
    }

    addTask(task: TaskInterface): void {
        const updatedTasks = [...this.tasks$.getValue(), task];
        this.tasks$.next(updatedTasks);
    }

    updateBoard(updatedBoard: BoardInterface): void {
        const board = this.board$.getValue();
        if (!board) {
            throw new Error('Board is not initialized');
        }
        this.board$.next({...board, title: updatedBoard.title});
    }

    deleteColumn(columnId: string):void {
        const updatedColumns = this.columns$.getValue().filter((column) => {
            return column.id !== columnId; //return only that which meets this crit
        })
        this.columns$.next(updatedColumns);
    }

    updateColumn(updatedColumn: ColumnInterface): void {
        const updatedColumns = this.columns$.getValue().map(column => {
            if(column.id === updatedColumn.id) {
                return {...column, title: updatedColumn.title};
            }
            return column;
        });
        this.columns$.next(updatedColumns); //set the curr app columns to updated columns
    }

    updateTask(updatedTask: TaskInterface): void {
        const updatedTasks = this.tasks$.getValue().map(task => {                  
            if(task.id === updatedTask.id) {
                return {...task, title: updatedTask.title, description: updatedTask.description, columnId: updatedTask.columnId};
            }
            return task;
        });
        this.tasks$.next(updatedTasks); //set the curr app columns to updated columns
    }

    deleteTask(taskId: string):void {
        const updatedTasks = this.tasks$.getValue().filter((task) => {
            return task.id !== taskId; //return only that which meets this crit
        });
        
        this.tasks$.next(updatedTasks);
    }
    
}