import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InlineFormComponent } from "./components/inlineForm.component";

@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    declarations: [InlineFormComponent],
    exports: [InlineFormComponent],
})

export class InlineFormModule {

}