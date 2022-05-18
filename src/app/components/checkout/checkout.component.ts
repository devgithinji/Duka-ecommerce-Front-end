import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {CustomFormService} from "../../services/custom-form.service";
import {Country} from "../../common/country";
import {State} from "../../common/state";
import {CustomValidators} from "../../common/custom-validators";
import {CartService} from "../../services/cart.service";
import {CheckoutService} from "../../services/checkout.service";
import {Router} from "@angular/router";
import {Order} from "../../common/order";
import {OrderItem} from "../../common/order-item";
import {Purchase} from "../../common/purchase";


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
  countries: Country[] = [];

  checkoutFormGroup: FormGroup = this.formBuilder.group({
    customer: this.formBuilder.group({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      email: new FormControl('', [Validators.required, Validators.pattern('^[a-z0-9._+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'), CustomValidators.notOnLyWhiteSpace])
    }),
    shippingAddress: this.formBuilder.group({
      street: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      city: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace])
    }),
    billingAddress: this.formBuilder.group({
      street: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      city: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace])
    }),
    creditCard: this.formBuilder.group({
      cardType: new FormControl('', [Validators.required]),
      nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), CustomValidators.notOnLyWhiteSpace]),
      cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
      security: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
      expirationMonth: [''],
      expirationYear: [''],
    })
  });

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
              private customFormService: CustomFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) {
  }

  ngOnInit(): void {
    const startMonth: number = new Date().getMonth() + 1;
    this.customFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    )
    this.customFormService.getCreditCardYears().subscribe(
      data => this.creditCardYears = data
    )
    this.customFormService.getCountries().subscribe(
      data => this.countries = data
    )

    this.reviewCartDetails();
  }

  get firstName() {
    return this.checkoutFormGroup.get('customer.firstName');
  }

  get lastName() {
    return this.checkoutFormGroup.get('customer.lastName');
  }

  get email() {
    return this.checkoutFormGroup.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }

  get shippingAddressState() {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }

  get shippingAddressZipCode() {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }

  get shippingAddressCountry() {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }

  get billingAddressStreet() {
    return this.checkoutFormGroup.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutFormGroup.get('billingAddress.city');
  }

  get billingAddressState() {
    return this.checkoutFormGroup.get('billingAddress.state');
  }

  get billingAddressZipCode() {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }

  get billingAddressCountry() {
    return this.checkoutFormGroup.get('billingAddress.country');
  }

  get creditCardType() {
    return this.checkoutFormGroup.get('creditCard.cardType');
  }

  get creditCardNameOnCard() {
    return this.checkoutFormGroup.get('creditCard.nameOnCard');
  }

  get creditCardNumber() {
    return this.checkoutFormGroup.get('creditCard.cardNumber');
  }

  get creditCardSecurityCode() {
    return this.checkoutFormGroup.get('creditCard.securityCode');
  }

  onSubmit() {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    //set up order
    let order = new Order();
    order.totalQuantity = this.totalQuantity;
    order.totalPrice = this.totalPrice;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create order items form cartItems
    let orderItems: OrderItem[] = cartItems.map(cartItem => new OrderItem(cartItem));
    //set up purchase

    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    //call rest API
    this.checkoutService.placeOrder(purchase).subscribe({
      next: response => {
        alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)
        //reset cart
        this.resetCart();
      },
      error: err => {
        alert(`Something went wrong: ${err.message}`)
      }
    })

  }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (<HTMLInputElement>event.target).checked;

    if (isChecked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value)
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear)

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.customFormService.getCreditCardMonths(startMonth).subscribe(
      data => this.creditCardMonths = data
    )
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.customFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;

        } else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    )
  }

  private reviewCartDetails() {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    )

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )
  }

  private resetCart() {
    //reset
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    //reset the form
    this.checkoutFormGroup.reset();

    //navigate back to the products page
    this.router.navigateByUrl("/products");
  }
}
