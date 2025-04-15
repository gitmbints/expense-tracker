import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Datepicker } from 'flowbite';
import { Flowbite } from '../../../flowbite/flowbite';
import { Income } from '../../../models/income';
import { IncomeService } from '../../../services/income/income.service';
import { ModalBaseComponent } from '../../ui/modal-base/modal-base.component';

@Component({
  selector: 'app-incomes-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalBaseComponent],
  templateUrl: './incomes-form.component.html',
})
@Flowbite()
export class IncomesFormComponent implements OnInit, OnChanges {
  private incomeService = inject(IncomeService);
  protected readonly destroy = inject(DestroyRef);

  readonly isAddForm = input.required<boolean>();
  readonly isCloseModal = output();
  readonly selectedIncome = input<Income | null>(null);

  ngOnInit(): void {
    this.initDatePicker();
  }

  ngOnChanges(): void {
    const income = this.selectedIncome();

    if (income) {
      this.incomeForm.patchValue({
        name: income.name,
        amount: income.amount,
        date: income.date,
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
        const dateFormControl = this.incomeForm.controls.date;
        dateFormControl?.setValue(value);
        dateFormControl?.markAsDirty;
      });
    });
  }

  readonly incomeForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    amount: new FormControl<number>(0, {
      validators: Validators.required,
      nonNullable: true,
    }),
    date: new FormControl<string>('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  isInvalidAndTouched(formControl: FormControl): boolean {
    return formControl.invalid && formControl.touched;
  }

  onSubmit(): void {
    this.incomeForm.markAllAsTouched();

    if (this.incomeForm.invalid) {
      return;
    }

    const newIncome = this.incomeForm.getRawValue();

    if (this.isAddForm()) {
      this.incomeService
        .createIncome$(newIncome)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            console.log('Income added successfully!');
            this.incomeForm.reset();
            this.handleCloseModal();
          },
          error: () => {
            console.log('Adding income failed!');
          },
        });
    } else {
      this.incomeService
        .editIncome$(this.selectedIncome()?.id, newIncome)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            console.log('Income updated successfully!');
            this.incomeForm.reset();
            this.handleCloseModal();
          },
          error: () => {
            console.log('Updating income failed!');
          },
        });
    }
  }

  handleCloseModal(): void {
    this.isCloseModal.emit();
  }
}
