import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {CustomFormService} from "../../services/custom-form.service";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  checkoutFormGroup: FormGroup = this.formBuilder.group({
    customer: this.formBuilder.group({
      firstName: [''],
      lastName: [''],
      email: ['']
    }),
    shippingAddress: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    }),
    billingAddress: this.formBuilder.group({
      street: [''],
      city: [''],
      state: [''],
      country: [''],
      zipCode: ['']
    }),
    creditCard: this.formBuilder.group({
      cardType: [''],
      nameOnCard: [''],
      cardNumber: [''],
      security: [''],
      expirationMonth: [''],
      expirationYear: [''],
    })
  });

  constructor(private formBuilder: FormBuilder, private customFormService: CustomFormService) {
  }

  ngOnInit(): void {
    const startMonth: number = new Date().getMonth() + 1;
    this.customFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    )
    this.customFormService.getCreditCardYears().subscribe(
      data => this.creditCardYears = data
    )
  }

  onSubmit() {
    console.log("Handling the submit button")
    console.log(this.checkoutFormGroup.get('customer')?.value)
  }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    if (isChecked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value)
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
    }
  }
}
