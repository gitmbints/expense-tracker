import {
  Component, DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output
} from "@angular/core";
import { Saving } from '../../../models/saving';
import { SavingsService } from '../../../services/savings/savings.service';
import { Flowbite } from '../../../flowbite/flowbite';
import { Datepicker } from 'flowbite';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalBaseComponent } from '../../ui/modal-base/modal-base.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-savings-form',
  standalone: true,
  imports: [ModalBaseComponent, ReactiveFormsModule],
  templateUrl: './savings-form.component.html',
})
@Flowbite()
export class SavingsFormComponent implements OnInit, OnChanges {
  readonly savingsService = inject(SavingsService);
  protected readonly destroy = inject(DestroyRef);

  readonly isAddForm = input.required<boolean>();
  readonly closeModalForm = output();
  readonly selectedSaving = input<Saving | null>(null);

  ngOnInit(): void {
    this.initDatePicker();
  }

  ngOnChanges(): void {
    const saving = this.selectedSaving();

    if (saving) {
      this.savingForm.patchValue({
        created_at: saving.created_at,
        amount: saving.amount,
      });
    }
  }

  private initDatePicker(): void {
    setTimeout(() => {
      const datePickerElement: HTMLInputElement = document.getElementById(
        'datepicker-actions',
      ) as HTMLInputElement;
      new Datepicker(datePickerElement);

      datePickerElement?.addEventListener('changeDate', (e: any) => {
        const value = e.target.value;
        const dateFormControl = this.savingForm.controls.created_at;
        dateFormControl?.setValue(value);
        dateFormControl?.markAsDirty;
      });
    });
  }

  readonly savingForm = new FormGroup({
    created_at: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    amount: new FormControl<number>(0, {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  isInvalidAndTouched(formControl: FormControl): boolean {
    return formControl.invalid && formControl.touched;
  }

  onSubmit(): void {
    this.savingForm.markAllAsTouched();

    if (this.savingForm.invalid) {
      return;
    }

    const newSaving = this.savingForm.getRawValue();

    if (this.isAddForm()) {
      this.savingsService.createSaving$(newSaving).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: () => {
          console.log("Saving added successfully!");
          this.savingForm.reset();
          this.handleCloseModalForm();
        },
        error: () => {
          console.log("Adding saving failed!");
        }
      });
    } else {
      this.savingsService.editSaving$(this.selectedSaving()?.id, newSaving).pipe(takeUntilDestroyed(this.destroy)).subscribe({
        next: () => {
          console.log("Saving updated successfully!");
          this.savingForm.reset();
          this.handleCloseModalForm();
        },
        error: () => { console.log("Updating saving failed!") }
      });
    }
  }

  handleCloseModalForm(): void {
    this.closeModalForm.emit();
  }
}
