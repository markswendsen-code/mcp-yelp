import { YelpBrowser } from "./browser.js";

export class YelpSession {
  private browser: YelpBrowser;

  constructor() {
    this.browser = new YelpBrowser();
  }

  async initialize(): Promise<void> {
    await this.browser.initialize();
  }

  async searchRestaurants(options: {
    query?: string;
    location: string;
    priceRange?: string;
    openNow?: boolean;
    sortBy?: string;
  }): Promise<{ restaurants: any[] }> {
    try {
      let url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(options.query || 'restaurants')}&find_loc=${encodeURIComponent(options.location)}`;
      if (options.priceRange) {
        const priceMap: Record<string, string> = { '$': '1', '$$': '2', '$$$': '3', '$$$$': '4' };
        url += `&attrs=RestaurantsPriceRange2.${priceMap[options.priceRange] || '2'}`;
      }
      if (options.openNow) url += '&open_now=true';
      if (options.sortBy) url += `&sortby=${options.sortBy}`;

      await this.browser.navigate(url);
      await this.browser.waitForSelector('[data-testid="serp-ia-card"]');

      const restaurants = await this.browser.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
        return Array.from(cards).slice(0, 20).map(card => ({
          id: card.querySelector('a')?.href?.match(/\/biz\/([^?]+)/)?.[1] || '',
          name: card.querySelector('h3 a, [class*="businessName"] a')?.textContent || '',
          rating: card.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '',
          reviewCount: card.querySelector('[class*="reviewCount"]')?.textContent || '',
          priceRange: card.querySelector('[class*="priceRange"]')?.textContent || '',
          categories: Array.from(card.querySelectorAll('[class*="category"] a')).map(c => c.textContent).join(', '),
          neighborhood: card.querySelector('[class*="neighborhood"]')?.textContent || '',
          address: card.querySelector('[class*="secondaryAttributes"] address')?.textContent || '',
          imageUrl: card.querySelector('img')?.src || '',
        }));
      });

      return { restaurants };
    } catch (error) {
      return { restaurants: [] };
    }
  }

  async searchBusinesses(options: {
    query: string;
    location: string;
    category?: string;
  }): Promise<{ businesses: any[] }> {
    try {
      let url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(options.query)}&find_loc=${encodeURIComponent(options.location)}`;
      if (options.category) url += `&cflt=${encodeURIComponent(options.category)}`;

      await this.browser.navigate(url);
      await this.browser.waitForSelector('[data-testid="serp-ia-card"]');

      const businesses = await this.browser.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
        return Array.from(cards).slice(0, 20).map(card => ({
          id: card.querySelector('a')?.href?.match(/\/biz\/([^?]+)/)?.[1] || '',
          name: card.querySelector('h3 a')?.textContent || '',
          rating: card.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '',
          reviewCount: card.querySelector('[class*="reviewCount"]')?.textContent || '',
          categories: Array.from(card.querySelectorAll('[class*="category"] a')).map(c => c.textContent).join(', '),
          address: card.querySelector('address')?.textContent || '',
          phone: card.querySelector('[class*="phone"]')?.textContent || '',
        }));
      });

      return { businesses };
    } catch (error) {
      return { businesses: [] };
    }
  }

  async getBusinessDetails(businessId: string): Promise<{ business?: any; error?: string }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/biz/${businessId}`);
      await this.browser.waitForSelector('[class*="businessName"]');

      const business = await this.browser.evaluate(() => {
        return {
          name: document.querySelector('h1')?.textContent || '',
          rating: document.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '',
          reviewCount: document.querySelector('[class*="reviewCount"]')?.textContent || '',
          priceRange: document.querySelector('[class*="priceRange"]')?.textContent || '',
          categories: Array.from(document.querySelectorAll('[class*="category"] a')).map(c => c.textContent).join(', '),
          address: document.querySelector('address')?.textContent || '',
          phone: document.querySelector('a[href^="tel:"]')?.textContent || '',
          website: document.querySelector('a[href*="biz_redir"]')?.getAttribute('href') || '',
          claimed: document.querySelector('[class*="claimed"]') !== null,
          highlights: Array.from(document.querySelectorAll('[class*="bizHighlight"]')).map(h => h.textContent),
          amenities: Array.from(document.querySelectorAll('[class*="bizAmenities"] span')).map(a => a.textContent),
        };
      });

      return { business };
    } catch (error) {
      return { error: `Failed to get business details: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async getReviews(businessId: string, options?: { sortBy?: string; limit?: number }): Promise<{ reviews: any[] }> {
    try {
      let url = `https://www.yelp.com/biz/${businessId}`;
      if (options?.sortBy) url += `?sort_by=${options.sortBy}`;

      await this.browser.navigate(url);
      await this.browser.waitForSelector('[class*="review__"]');

      const limit = options?.limit || 10;
      const reviews = await this.browser.evaluateWithArg((maxReviews: number) => {
        const reviewEls = document.querySelectorAll('[class*="review__"]');
        return Array.from(reviewEls).slice(0, maxReviews).map(review => ({
          author: review.querySelector('[class*="user-passport"] a')?.textContent || '',
          rating: review.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '',
          date: review.querySelector('[class*="date"]')?.textContent || '',
          text: review.querySelector('[class*="comment"]')?.textContent || '',
          photos: Array.from(review.querySelectorAll('img')).map(img => img.src),
          useful: review.querySelector('[class*="useful"] span')?.textContent || '0',
          funny: review.querySelector('[class*="funny"] span')?.textContent || '0',
          cool: review.querySelector('[class*="cool"] span')?.textContent || '0',
        }));
      }, limit);

      return { reviews };
    } catch (error) {
      return { reviews: [] };
    }
  }

  async getPhotos(businessId: string, options?: { category?: string; limit?: number }): Promise<{ photos: any[] }> {
    try {
      let url = `https://www.yelp.com/biz_photos/${businessId}`;
      if (options?.category && options.category !== 'all') url += `?tab=${options.category}`;

      await this.browser.navigate(url);
      await this.browser.waitForSelector('[class*="photo-box"]');

      const limit = options?.limit || 10;
      const photos = await this.browser.evaluateWithArg((maxPhotos: number) => {
        const photoEls = document.querySelectorAll('[class*="photo-box"] img');
        return Array.from(photoEls).slice(0, maxPhotos).map(img => ({
          url: (img as HTMLImageElement).src,
          caption: img.getAttribute('alt') || '',
        }));
      }, limit);

      return { photos };
    } catch (error) {
      return { photos: [] };
    }
  }

  async getMenu(businessId: string): Promise<{ menu?: any; error?: string }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/menu/${businessId}`);
      await this.browser.waitForSelector('[class*="menu-section"]');

      const menu = await this.browser.evaluate(() => {
        const sections = document.querySelectorAll('[class*="menu-section"]');
        return Array.from(sections).map(section => ({
          name: section.querySelector('h2, h3')?.textContent || '',
          items: Array.from(section.querySelectorAll('[class*="menu-item"]')).map(item => ({
            name: item.querySelector('[class*="item-title"]')?.textContent || '',
            description: item.querySelector('[class*="item-description"]')?.textContent || '',
            price: item.querySelector('[class*="item-price"]')?.textContent || '',
          })),
        }));
      });

      return { menu };
    } catch (error) {
      return { error: `Failed to get menu: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async getHours(businessId: string): Promise<{ hours?: any; error?: string }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/biz/${businessId}`);
      await this.browser.waitForSelector('[class*="hours-table"], [class*="hoursTable"]');

      const hours = await this.browser.evaluate(() => {
        const rows = document.querySelectorAll('[class*="hours-table"] tr, [class*="hoursTable"] tr');
        return Array.from(rows).map(row => ({
          day: row.querySelector('th, td:first-child')?.textContent || '',
          hours: row.querySelector('td:last-child, td:nth-child(2)')?.textContent || '',
        }));
      });

      return { hours };
    } catch (error) {
      return { error: `Failed to get hours: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  async findSimilar(businessId: string, limit = 5): Promise<{ similar: any[] }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/biz/${businessId}`);
      await this.browser.waitForSelector('[class*="similar"], [class*="youMightAlsoConsider"]');

      const similar = await this.browser.evaluateWithArg((maxSimilar: number) => {
        const similarEls = document.querySelectorAll('[class*="similar"] a, [class*="youMightAlsoConsider"] a');
        return Array.from(similarEls).slice(0, maxSimilar).map(el => ({
          id: el.getAttribute('href')?.match(/\/biz\/([^?]+)/)?.[1] || '',
          name: el.textContent || '',
        }));
      }, limit);

      return { similar };
    } catch (error) {
      return { similar: [] };
    }
  }

  async getTrending(location: string, category?: string): Promise<{ trending: any[] }> {
    try {
      let url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category || 'restaurants')}&find_loc=${encodeURIComponent(location)}&sortby=date`;
      
      await this.browser.navigate(url);
      await this.browser.waitForSelector('[data-testid="serp-ia-card"]');

      const trending = await this.browser.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
        return Array.from(cards).slice(0, 10).map(card => ({
          id: card.querySelector('a')?.href?.match(/\/biz\/([^?]+)/)?.[1] || '',
          name: card.querySelector('h3 a')?.textContent || '',
          rating: card.querySelector('[aria-label*="star rating"]')?.getAttribute('aria-label') || '',
          isNew: card.textContent?.includes('New') || false,
        }));
      });

      return { trending };
    } catch (error) {
      return { trending: [] };
    }
  }

  async getCollections(location: string, category?: string): Promise<{ collections: any[] }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/collections/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'))}`);
      await this.browser.waitForSelector('[class*="collection-card"]');

      const collections = await this.browser.evaluate(() => {
        const cards = document.querySelectorAll('[class*="collection-card"]');
        return Array.from(cards).slice(0, 10).map(card => ({
          id: card.querySelector('a')?.href || '',
          name: card.querySelector('[class*="title"]')?.textContent || '',
          count: card.querySelector('[class*="count"]')?.textContent || '',
          imageUrl: card.querySelector('img')?.src || '',
        }));
      });

      return { collections };
    } catch (error) {
      return { collections: [] };
    }
  }

  async checkWaitTime(businessId: string): Promise<{ waitTime?: string; available: boolean }> {
    try {
      await this.browser.navigate(`https://www.yelp.com/biz/${businessId}`);
      
      const waitInfo = await this.browser.evaluate(() => {
        const waitEl = document.querySelector('[class*="waitTime"], [class*="wait-time"]');
        return {
          waitTime: waitEl?.textContent || undefined,
          available: waitEl !== null,
        };
      });

      return waitInfo;
    } catch (error) {
      return { available: false };
    }
  }

  async getDeals(location: string, category?: string): Promise<{ deals: any[] }> {
    try {
      let url = `https://www.yelp.com/search?find_desc=${encodeURIComponent(category || 'restaurants')}&find_loc=${encodeURIComponent(location)}&attrs=deals`;
      
      await this.browser.navigate(url);
      await this.browser.waitForSelector('[data-testid="serp-ia-card"]');

      const deals = await this.browser.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="serp-ia-card"]');
        return Array.from(cards).slice(0, 10).map(card => ({
          id: card.querySelector('a')?.href?.match(/\/biz\/([^?]+)/)?.[1] || '',
          name: card.querySelector('h3 a')?.textContent || '',
          deal: card.querySelector('[class*="deal"]')?.textContent || '',
        }));
      });

      return { deals };
    } catch (error) {
      return { deals: [] };
    }
  }

  async close(): Promise<void> {
    await this.browser.close();
  }
}
