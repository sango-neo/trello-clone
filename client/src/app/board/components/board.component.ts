import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationStart, Router } from "@angular/router";
import { combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { BoardsService } from "src/app/shared/services/boards.service";
import { ColumnsService } from "src/app/shared/services/columns.service";
import { SocketService } from "src/app/shared/services/socket.service";
import { TasksService } from "src/app/shared/services/tasks.service";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { ColumnInterface } from "src/app/shared/types/column.interface";
import { ColumnInputInterface } from "src/app/shared/types/columnInput.interface";
import { SocketEventsEnum } from "src/app/shared/types/socketEvents.enum";
import { TaskInterface } from "src/app/shared/types/task.interface";
import { TaskInputInterface } from "src/app/shared/types/taskInput.interface";
import { BoardService } from "../services/board.service";

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html'
})

export class BoardComponent implements OnInit, OnDestroy {

    boardId: string;
    // board$: Observable<BoardInterface>;
    // columns$: Observable<ColumnInterface[]>;
    data$: Observable<{
        board: BoardInterface,
        columns: ColumnInterface[],
        tasks: TaskInterface[],
    }>;
    unsubscribe$ = new Subject<void>();


    constructor(
        private boardsService: BoardsService,
        private columnsService: ColumnsService, 
        private tasksService: TasksService, 
        private route: ActivatedRoute, 
        private boardService: BoardService,
        private socketService: SocketService,
        private router: Router
        ) {
        const boardId = this.route.snapshot.paramMap.get('boardId'); //this is standard way of getting data from the url

        if(!boardId) {
            throw new Error('Cannot get boardID from url');
        }

        this.boardId = boardId;
        // this.board$ = this.boardService.board$.pipe(filter(Boolean)); //will filter out the null response  
        // this.columns$ = this.boardService.columns$;
        this.data$ = combineLatest([
            this.boardService.board$.pipe(filter(Boolean)),
            this.boardService.columns$,
            this.boardService.tasks$
        ]).pipe(
            map(([board, columns, tasks]) => ({
            board,
            columns,
            tasks,
        })) //destructuring
        );
    }
    // Everytime new data is emitted from any of the orignal observables, combineLatest will run. Gotcha: It not emit a value until all have emitted at least once
    // the filter(Boolean) runs a Boolean function on the data stream. filters out all falsy values. This is good here because we do not want to render any html if the board data is not available

    ngOnInit(): void {
        this.socketService.emit(SocketEventsEnum.boardsJoin, {boardId: this.boardId}); //emit a new socket io message to the backend
        this.fetchData();
        this.initializeListeners();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete(); 
    }

    initializeListeners(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart && !event.url.includes('/boards/')) {
                console.log('leaving a page');
                this.boardService.leaveBoard(this.boardId);
            }
        }); //no need to unsubscribe from http events; unsub handled by angular automatically. Safe approach: unsub from all subs

        //will need to unsub from socket subs because they are custom subs
        this.socketService.listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((column) => { 
            // console.log('column: ', column); //any tab open on this baord's page will get the console log
            this.boardService.addColumn(column);
        });

        this.socketService.listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((task) => { 
            this.boardService.addTask(task);
        });

        this.socketService.listen<TaskInterface>(SocketEventsEnum.tasksUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((updatedTask) => { 
            this.boardService.updateTask(updatedTask);
        });

        this.socketService.listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((updatedBoard) => { 
            this.boardService.updateBoard(updatedBoard);
        });

        this.socketService.listen<ColumnInterface>(SocketEventsEnum.columnsUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((updatedColumn) => { 
            this.boardService.updateColumn(updatedColumn);
        });

        this.socketService.listen<void>(SocketEventsEnum.boardsDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => { 
            this.router.navigateByUrl('/boards');
            //need some other action to block off subsequent manual reqs to the deleted board url
        });

        this.socketService.listen<string>(SocketEventsEnum.columnsDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((columnId) => {
            this.boardService.deleteColumn(columnId);
        });

        this.socketService.listen<string>(SocketEventsEnum.tasksDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((taskId) => {
            this.boardService.deleteTask(taskId);
        });
    }

    fetchData(): void { 
        this.boardsService.getBoard(this.boardId).subscribe((board) => {
            this.boardService.setBoard(board); //instantiating board that is accessible app-wide
        });
        this.columnsService.getColumns(this.boardId).subscribe((columns) => {
            this.boardService.setColumns(columns);
        });
        this.tasksService.getTasks(this.boardId).subscribe((tasks) => {
            this.boardService.setTasks(tasks);
        });
    }

    createColumn(title: string): void {
        // console.log('create column', title);
        const columnInput: ColumnInputInterface = {
            title,
            boardId: this.boardId,
        };
        this.columnsService.createColumn(columnInput);
    }

    createTask(title: string, columnId: string): void {
        const taskInput: TaskInputInterface = {
            title,
            boardId: this.boardId,
            columnId
        };
        this.tasksService.createTask(taskInput);
    }

    getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] {
        //we take all tasks as arg then filter them to get tasks only by the column id
        return tasks.filter(task => task.columnId === columnId);
    }

    openTask(taskId: string): void {
        this.router.navigate(['boards', this.boardId, 'tasks', taskId]);
    }

    // test(): void {
    //     console.log("clicked");
    //     this.socketService.emit("columns:create", {
    //         boardId: this.boardId,
    //         title: "Bonus!"
    //     });
    // }

    updateBoardName(boardName: string): void {
        this.boardsService.updateBoard(this.boardId, {title: boardName});
    }

    deleteBoard(): void {
        if(confirm('Are you sure you want to delete the board?')) {
            this.boardsService.deleteBoard(this.boardId);
        }
    }

    deleteColumn(columnId: string): void {
        if(confirm('Are you sure you want to delete this column?')) {
            this.columnsService.deleteColumn(this.boardId, columnId); //emits event to backend
        }
    }

    updateColumnName(columnName: string, columnId: string): void {
        this.columnsService.updateColumn(this.boardId, columnId, {title: columnName})
    }

}