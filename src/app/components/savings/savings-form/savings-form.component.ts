import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
} from '@angular/core';
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

@Component({
  selector: 'app-savings-form',
  standalone: true,
  imports: [ModalBaseComponent, ReactiveFormsModule],
  templateUrl: './savings-form.component.html',
})
@Flowbite()
export class SavingsFormComponent implements OnInit, OnChanges {
  readonly isAddForm = input.required<boolean>();
  readonly closeModalForm = output();
  readonly selectedSaving = input<Saving | null>(null);

  savingsService = inject(SavingsService);

  ngOnInit(): void {
    this.initDatePicker();
  }

  ngOnChanges(): void {
    const income = this.selectedSaving();

    if (income) {
      this.savingForm.patchValue({
        created_at: income.created_at,
        amount: income.amount,
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
      this.savingsService.addSaving(newSaving);
    } else {
      this.savingsService.updateSaving(this.selectedSaving()?.id, newSaving);
    }

    this.savingForm.reset();
    this.handleCloseModalForm();
  }

  handleCloseModalForm(): void {
    this.closeModalForm.emit();
  }
}
