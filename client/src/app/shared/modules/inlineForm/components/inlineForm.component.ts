import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
    selector: 'inline-form',
    templateUrl: './inlineForm.component.html'
})

export class InlineFormComponent {
    @Input() title: string = '';
    @Input() defaultText: string = 'Not defined' //suggested best practice
    @Input() hasButton: boolean = false;
    @Input() buttonText: string = 'Submit' //just because its common
    @Input() inputPlaceholder: string = '';
    @Input() inputType: string = 'input';
    //@Input() - stuff received from user input/html template

    @Output() handleSubmit = new EventEmitter<string>();
    //@Output() - stuff propogated out on submit action

    isEditing: boolean = false;
    form = this.fb.group({
        title: [''],
    });

    constructor(private fb: FormBuilder) {}

    activeEditing(): void {
        if(this.title) {
            this.form.patchValue({ title: this.title });
        }
        this.isEditing = true;
    }

    onSubmit(): void {
        if (this.form.value.title) {
            this.handleSubmit.emit(this.form.value.title);
        }
        this.isEditing = false;
        this.form.reset();
    }

}