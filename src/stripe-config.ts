export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: string;
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SYlo2xBe2w8BiL',
    priceId: 'price_1RdeGlQLS5b9gMNelMadoHW7',
    name: 'Beta',
    description: 'For beginners',
    mode: 'subscription',
    price: '$14.99',
  },
  {
    id: 'prod_SYlpE7WYflKF6z',
    priceId: 'price_1RdeI2QLS5b9gMNej54P3GIV',
    name: 'Alpha',
    description: 'For professionals',
    mode: 'subscription',
    price: '$99.99',
  },
  {
    id: 'prod_SYlrWY33GZzBmc',
    priceId: 'price_1RdeJJQLS5b9gMNewONf3GMu',
    name: 'Gamma',
    description: 'For Business persons',
    mode: 'subscription',
    price: '$199.99',
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}