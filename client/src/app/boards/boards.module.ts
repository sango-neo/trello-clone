import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../auth/services/authGuard.service";
import { InlineFormComponent } from "../shared/modules/inlineForm/components/inlineForm.component";
import { BoardsService } from "../shared/services/boards.service";
import { BoardsComponent } from "./components/boards.component";
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopBarModule } from "../shared/modules/topbar/topbar.module";

const routes: Routes = [
    {
        path: 'boards',
        component: BoardsComponent,
        canActivate: [AuthGuardService]
    }
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes), InlineFormModule, TopBarModule],
    declarations: [BoardsComponent],
    providers: [BoardsService]
})

export class BoardsModule {}