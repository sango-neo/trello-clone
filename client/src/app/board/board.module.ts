import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../auth/services/authGuard.service";
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopBarModule } from "../shared/modules/topbar/topbar.module";
import { ColumnsService } from "../shared/services/columns.service";
import { TasksService } from "../shared/services/tasks.service";
import { BoardComponent } from "./components/board.component";
import { TaskModalComponent } from "./components/taskModal/taskModal.component";
import { BoardService } from "./services/board.service";

const routes: Routes = [
    {
        path: 'boards/:boardId', //how does it know to choose the id
        component: BoardComponent,
        canActivate: [AuthGuardService], //must be logged in to access this route
        children: [
            {
                path: 'tasks/:taskId',
                component: TaskModalComponent,
            }
        ]
    }
] 

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), TopBarModule, InlineFormModule, ReactiveFormsModule],
    declarations: [BoardComponent, TaskModalComponent],
    providers: [BoardService, ColumnsService, TasksService]
})

export class BoardModule {

}