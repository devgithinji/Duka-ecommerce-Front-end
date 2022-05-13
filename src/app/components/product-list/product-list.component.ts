import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../services/product.service";
import {Product} from "../../common/product";
import {ActivatedRoute} from "@angular/router";
import {CartService} from "../../services/cart.service";
import {CartItem} from "../../common/cart-item";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId!: number;
  searchMode: boolean = false;
  pageNumber: number = 1;
  pageSize: number = 10;
  totalElements: number = 0
  previousKeyWord?: string;

  constructor(private productService: ProductService, private route: ActivatedRoute, private cartService: CartService) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    })
    this.listProducts();
  }

  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has("keyword");
    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }


  handleSearchProducts() {
    const keyword: string = <string>this.route.snapshot.paramMap.get('keyword');
    //if we have a different keyword than the previous then set the pageNumber to 1
    if (this.previousKeyWord != keyword) {
      this.pageNumber = 1;
    }
    this.previousKeyWord = keyword;

    this.productService.searchProductsPaginate(this.pageNumber - 1, this.pageSize, keyword).subscribe(
      this.processResult()
    )
  }

  handleListProducts() {
    //check if id param is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      this.currentCategoryId = parseInt(<string>this.route.snapshot.paramMap.get("id"));
    } else {
      this.currentCategoryId = 1;
    }

    this.productService.getProductListPaginate(this.pageNumber - 1, this.pageSize, this.currentCategoryId).subscribe(
      this.processResult()
    )
  }

  private processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalElements = data.page.totalElements;
    };
  }

  updatePageSize(event: any) {
    this.pageSize = event.target.value;
    this.pageNumber = 1;
    this.listProducts();
  }

  addToCart(product: Product) {
    const cartItem = new CartItem(product);
    this.cartService.addToCart(cartItem);
  }

}
