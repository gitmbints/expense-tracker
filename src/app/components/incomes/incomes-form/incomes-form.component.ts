import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
} from '@angular/core';
import { ModalBaseComponent } from '../../ui/modal-base/modal-base.component';
import { IncomeService } from '../../../services/income/income.service';
import { Flowbite } from '../../../flowbite/flowbite';
import { Datepicker } from 'flowbite';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Income } from '../../../models/income';

@Component({
  selector: 'app-incomes-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalBaseComponent],
  templateUrl: './incomes-form.component.html',
  styleUrl: './incomes-form.component.css',
})
@Flowbite()
export class IncomesFormComponent implements OnInit, OnChanges {
  readonly isAddForm = input.required<boolean>();
  readonly isCloseModal = output();
  readonly selectedIncome = input<Income | null>(null);

  incomeService: IncomeService = inject(IncomeService);

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
      this.incomeService.addIncome(newIncome);
    } else {
      this.incomeService.updateIncome(this.selectedIncome()?.id, newIncome);
    }

    this.incomeForm.reset();
    this.handleCloseModal();
  }

  handleCloseModal(): void {
    this.isCloseModal.emit();
  }
}
