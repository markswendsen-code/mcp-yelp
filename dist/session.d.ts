export declare class YelpSession {
    private browser;
    constructor();
    initialize(): Promise<void>;
    searchRestaurants(options: {
        query?: string;
        location: string;
        priceRange?: string;
        openNow?: boolean;
        sortBy?: string;
    }): Promise<{
        restaurants: any[];
    }>;
    searchBusinesses(options: {
        query: string;
        location: string;
        category?: string;
    }): Promise<{
        businesses: any[];
    }>;
    getBusinessDetails(businessId: string): Promise<{
        business?: any;
        error?: string;
    }>;
    getReviews(businessId: string, options?: {
        sortBy?: string;
        limit?: number;
    }): Promise<{
        reviews: any[];
    }>;
    getPhotos(businessId: string, options?: {
        category?: string;
        limit?: number;
    }): Promise<{
        photos: any[];
    }>;
    getMenu(businessId: string): Promise<{
        menu?: any;
        error?: string;
    }>;
    getHours(businessId: string): Promise<{
        hours?: any;
        error?: string;
    }>;
    findSimilar(businessId: string, limit?: number): Promise<{
        similar: any[];
    }>;
    getTrending(location: string, category?: string): Promise<{
        trending: any[];
    }>;
    getCollections(location: string, category?: string): Promise<{
        collections: any[];
    }>;
    checkWaitTime(businessId: string): Promise<{
        waitTime?: string;
        available: boolean;
    }>;
    getDeals(location: string, category?: string): Promise<{
        deals: any[];
    }>;
    close(): Promise<void>;
}
