from decimal import Decimal

from django.db import transaction

from cart.models import Cart
from products.models import Product

from .exceptions import OrderError
from .models import Order, OrderItem


def create_order_from_cart(user) -> Order:
    """Create an order from the user's cart inside an atomic transaction.

    Cart items are copied with a frozen ``unit_price``, then the cart is emptied.
    Stock is decremented for each product. Any failure rolls the whole order back.
    """
    with transaction.atomic():
        cart = Cart.objects.select_for_update().filter(user=user).first()
        if cart is None:
            raise OrderError("empty_cart", "Cart is empty.")

        items = list(cart.items.select_related("product").select_for_update())
        if not items:
            raise OrderError("empty_cart", "Cart is empty.")

        order = Order.objects.create(user=user, status=Order.Status.PENDING)
        total = Decimal("0.00")

        for item in items:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            if not product.is_active:
                raise OrderError(
                    "product_unavailable",
                    f"Product '{product.name}' is not available.",
                )
            if product.stock < item.quantity:
                raise OrderError(
                    "insufficient_stock",
                    f"Insufficient stock for '{product.name}'.",
                )

            unit_price = product.price
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                quantity=item.quantity,
                unit_price=unit_price,
            )
            product.stock -= item.quantity
            product.save(update_fields=["stock", "updated_at"])
            total += unit_price * item.quantity

        order.total = total
        order.save(update_fields=["total", "updated_at"])
        cart.items.all().delete()
        return order
