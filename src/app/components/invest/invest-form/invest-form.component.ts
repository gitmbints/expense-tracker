import { Component, inject, input, OnInit, output } from '@angular/core';
import { Invest } from '../../../models/invest.model';
import { InvestmentsService } from '../../../services/investments/investments.service';
import { Datepicker } from 'flowbite';
import { Flowbite } from '../../../flowbite/flowbite';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalBaseComponent } from '../../ui/modal-base/modal-base.component';

@Component({
  selector: 'app-invest-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalBaseComponent],
  templateUrl: './invest-form.component.html',
})
@Flowbite()
export class InvestFormComponent implements OnInit {
  readonly isAddForm = input.required<boolean>();
  readonly isCloseModal = output();
  readonly selectedInvest = input<Invest | null>(null);

  private investmentsService = inject(InvestmentsService);

  ngOnInit(): void {
    this.initDatePicker();
  }

  ngOnChanges(): void {
    const invest = this.selectedInvest();

    if (invest) {
      this.investForm.patchValue({
        name: invest.name,
        amount: invest.amount,
        date: invest.date,
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
        const dateFormControl = this.investForm.controls.date;
        dateFormControl?.setValue(value);
        dateFormControl?.markAsDirty;
      });
    });
  }

  readonly investForm = new FormGroup({
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
    this.investForm.markAllAsTouched();

    if (this.investForm.invalid) {
      return;
    }

    const newInvest = this.investForm.getRawValue();

    if (this.isAddForm()) {
      this.investmentsService.addInvest(newInvest);
    } else {
      this.investmentsService.updateInvest(
        this.selectedInvest()?.id,
        newInvest,
      );
    }

    this.investForm.reset();
    this.handleCloseModal();
  }

  handleCloseModal(): void {
    this.isCloseModal.emit();
  }
}
