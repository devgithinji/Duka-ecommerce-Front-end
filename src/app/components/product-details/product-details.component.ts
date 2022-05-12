import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

  product!: Product;

  constructor(private route: ActivatedRoute, private productService: ProductService) {
  }

  ngOnInit(): void {
    this.getProduct();
  }

  getProduct() {
    const productId: number = parseInt(<string>this.route.snapshot.paramMap.get("id"));

    this.productService.getProduct(productId).subscribe(
      data => {
        this.product = data;
      }
    )
  }
}
