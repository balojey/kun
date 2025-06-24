export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SYmo3AG8yunq3N',
    priceId: 'price_1RdfEiQLS5b9gMNer7aUjMXf',
    name: 'Aven Shit',
    description: 'Transform your email productivity with Aven, the AI voice assistant that helps you manage, reply to, and organize emails through natural conversation.',
    mode: 'subscription',
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}