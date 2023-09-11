import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {ProductService} from "../../services/product.service";
import {CartService} from "../../services/cart.service";
import {FavoriteType} from "../../../../types/favorite.type";

@Component({
  selector: 'favorite-product',
  templateUrl: './favorite-product.component.html',
  styleUrls: ['./favorite-product.component.scss'],
})
export class FavoriteProductComponent implements OnChanges {
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
  countInCart: number | undefined = 0;
  @Input() product: FavoriteType | null = null;
  @Output() removedProductId = new EventEmitter<string>();

  constructor(private productService: ProductService,
              private cartService: CartService) {}

  ngOnChanges(): void {
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if (data) {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          (data as CartType).items.forEach(item => {
            if (item.product.id === this.product?.id) {
              this.countInCart = item.quantity;
              if (this.countInCart && this.countInCart > 1) {
                this.count = this.countInCart;
              }
            }
          })
        }
      })
  }

  public addToCard(id: string) {
    this.cartService.updateCart(id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {

        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = this.count;
      });
  }

  public updateCount(value: number, id: string) {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {

          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.countInCart = this.count;
        });
    }
  }

  public removeFromCart(id: string) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {

        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = 0;
        this.count = 1;
      });
  }

  public removeFromFavorites(id: string){
    this.removedProductId.emit(id);
  }
}
