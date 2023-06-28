import { Component, HostBinding, OnDestroy } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, filter, map, Observable, Subject, takeUntil } from "rxjs";
import { SocketService } from "src/app/shared/services/socket.service";
import { TasksService } from "src/app/shared/services/tasks.service";
import { ColumnInterface } from "src/app/shared/types/column.interface";
import { ColumnInputInterface } from "src/app/shared/types/columnInput.interface";
import { SocketEventsEnum } from "src/app/shared/types/socketEvents.enum";
import { TaskInterface } from "src/app/shared/types/task.interface";
import { BoardService } from "../../services/board.service";

@Component({
    selector: 'task-modal',
    templateUrl: './taskModal.component.html'
})

export class TaskModalComponent implements OnDestroy {
    @HostBinding('class') classes = 'task-modal';

    taskId: string;
    boardId: string;
    task$: Observable<TaskInterface>;
    data$: Observable<{task: TaskInterface, columns: ColumnInterface[]}>;
    columnForm = this.fb.group({
        columnId: [null]
    });
    unsubscribe$ = new Subject<void>();

    constructor(
        private route: ActivatedRoute, 
        private router: Router, 
        private boardService: BoardService,
        private fb: FormBuilder,
        private tasksService: TasksService,
        private socketService: SocketService
        ) {

         // when this component is instantiated get ids from the url. 
         // throw error if either one not found. 
         // set the properties of this class/component to the ids read from the url

        const taskId = this.route.snapshot.paramMap.get('taskId');
        const boardId = this.route.parent?.snapshot.paramMap.get('boardId');

        if(!taskId) {
            throw new Error("Can't get taskId from URL");
        }

        if(!boardId) {
            throw new Error("Can't get boardId from URL");
        }

        this.taskId = taskId;
        this.boardId = boardId;
        this.task$ = this.boardService.tasks$.pipe(map((tasks) => {
            return tasks.find((task) => task.id === this.taskId);
        }), 
        filter(Boolean) //ignores undefined/null state. stream will only be fulfilled when it is not one of those (when there is a task)
        ); //case of null state is when we do not match the task in the URL with any task in our current data store

        this.data$ = combineLatest([
            this.task$, this.boardService.columns$
        ]).pipe(map(([task, columns]) => ({
            task,
            columns,
        }))
        ); //need the list of columns on the board to fill the select DOM element with list of options
        //this observable is subscribed to in the template with the async pipe

        this.task$.pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
            this.columnForm.patchValue({ columnId: task.columnId });
        }); //wait for the task stream to be initialized then pull from it the column id
        // here we set the value of the select form control to the column id of the current task (its form control name is columnId)

        combineLatest([this.task$, this.columnForm.get('columnId')!.valueChanges]).pipe(takeUntil(this.unsubscribe$)).subscribe(([task, columnId]) => {
            if(task.columnId !== columnId) {
                this.tasksService.updateTask(this.boardId, this.taskId, {columnId});
            }
        });
        // "!" is the non-nullable type assertion - telling typescript that we know that it will not be null.
        // whenever either one of task or columnId updates, check if the column id of the task matches the columnId user changes to in the form select
        // call the updateTask method 

        this.socketService.listen<string>(SocketEventsEnum.tasksDeleteSuccess).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.goToBoard();
        })
        
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }

    goToBoard(): void {
        this.router.navigate(['boards', this.boardId]);
    }

    updateTaskName(taskName: string): void {
        console.log(taskName);
        this.tasksService.updateTask(this.boardId, this.taskId, {title: taskName});
    }

    updateTaskDesc(taskDescription: string):void {
        console.log(taskDescription);
        this.tasksService.updateTask(this.boardId, this.taskId, {description: taskDescription});
    }

    deleteTask(): void {
        if(confirm('Are you sure you want to delete this column?')) {
            this.tasksService.deleteTask(this.boardId, this.taskId); //emits event to backend
        }
    }
}