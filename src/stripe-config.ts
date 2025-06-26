export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number; // Price in dollars
  tokenRate: string; // Rate per token for display
  tokens: number; // Number of tokens included
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SZ2vf7eJcACRDZ',
    priceId: 'price_1RdupuQLS5b9gMNe6IaboeNm',
    name: 'Delta',
    description: 'Best Value - 1.25M tokens',
    mode: 'payment',
    price: 249.99,
    tokenRate: '$0.0002',
    tokens: 1249950,
  },
  {
    id: 'prod_SZ2tyv24Hj2tCh',
    priceId: 'price_1RdunYQLS5b9gMNeTRak3KA5',
    name: 'Gamma',
    description: 'Popular - 500K tokens',
    mode: 'payment',
    price: 149.99,
    tokenRate: '$0.0003',
    tokens: 499966,
  },
  {
    id: 'prod_SZ2tsWuP13AyrH',
    priceId: 'price_1RdunEQLS5b9gMNeqqnqvQdd',
    name: 'Alpha',
    description: 'Great Value - 194K tokens',
    mode: 'payment',
    price: 69.99,
    tokenRate: '$0.00036',
    tokens: 194417,
  },
  {
    id: 'prod_SZ2scEg2ZfMZGq',
    priceId: 'price_1RdumqQLS5b9gMNe5a9BpMh9',
    name: 'Beta',
    description: 'Starter - 50K tokens',
    mode: 'payment',
    price: 19.99,
    tokenRate: '$0.0004',
    tokens: 50000,
  },
];

export function getProductById(id: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.id === id);
}

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
}

// Helper function to get the most cost-effective product
export function getRecommendedProduct(): StripeProduct {
  return STRIPE_PRODUCTS.find(product => product.name === 'Delta') || STRIPE_PRODUCTS[0];
}

// Helper function to sort products by price (ascending)
export function getProductsSortedByPrice(): StripeProduct[] {
  return [...STRIPE_PRODUCTS].sort((a, b) => a.price - b.price);
}

// Helper function to get tokens for a price ID
export function getTokensForPriceId(priceId: string): number {
  const product = getProductByPriceId(priceId);
  return product?.tokens || 0;
}