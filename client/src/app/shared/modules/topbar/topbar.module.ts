import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { TopbarComponent } from "./components/topbar.component";

@NgModule({

    imports: [CommonModule, RouterModule],
    declarations: [TopbarComponent],
    exports: [TopbarComponent]
})

export class TopBarModule {

}