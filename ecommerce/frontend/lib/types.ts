export type Id = number | string

export type Category = {
  id: Id
  name: string
  description: string
  slug: string | null
}

export type Product = {
  id: Id
  name: string
  description: string
  price: number
  stock: number | null
  image: string | null
  categoryId: Id | null
  categoryName: string | null
  isActive: boolean
}

export type CartItem = {
  id: Id
  productId: Id | null
  name: string
  image: string | null
  price: number
  quantity: number
  subtotal: number
  stock: number | null
}

export type Cart = {
  id: Id | null
  items: CartItem[]
  total: number
  count: number
}

export type Order = {
  id: Id
  status: string
  total: number
  createdAt: string | null
  items: CartItem[]
  shippingAddress: string
  customer: string | null
}

export type User = {
  id: Id
  username: string
  email: string
  firstName: string
  lastName: string
  isStaff: boolean
  phone: string
  address: string
  dateJoined: string | null
}
