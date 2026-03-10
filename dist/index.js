#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { YelpSession } from "./session.js";
const server = new Server({
    name: "yelp-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
let session = null;
const tools = [
    {
        name: "yelp_search_restaurants",
        description: "Search for restaurants on Yelp by location, cuisine, price range, and more.",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "Search query (e.g., 'sushi', 'italian')" },
                location: { type: "string", description: "Location (city, neighborhood, or address)" },
                priceRange: { type: "string", enum: ["$", "$$", "$$$", "$$$$"], description: "Price range filter" },
                openNow: { type: "boolean", description: "Only show places open now" },
                sortBy: { type: "string", enum: ["best_match", "rating", "review_count", "distance"], description: "Sort order" },
            },
            required: ["location"],
        },
    },
    {
        name: "yelp_search_businesses",
        description: "Search for any type of business on Yelp (not just restaurants).",
        inputSchema: {
            type: "object",
            properties: {
                query: { type: "string", description: "Search query (e.g., 'plumber', 'hair salon')" },
                location: { type: "string", description: "Location (city, neighborhood, or address)" },
                category: { type: "string", description: "Business category" },
            },
            required: ["query", "location"],
        },
    },
    {
        name: "yelp_get_business_details",
        description: "Get detailed information about a specific business including hours, menu, amenities.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID or URL slug" },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_reviews",
        description: "Get reviews for a specific business with ratings and text.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID" },
                sortBy: { type: "string", enum: ["newest", "oldest", "highest", "lowest", "elites"], description: "Sort reviews by" },
                limit: { type: "number", description: "Number of reviews to retrieve", default: 10 },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_photos",
        description: "Get photos for a specific business.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID" },
                category: { type: "string", enum: ["all", "food", "inside", "outside", "drink", "menu"], description: "Photo category" },
                limit: { type: "number", description: "Number of photos to retrieve", default: 10 },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_menu",
        description: "Get menu items and prices for a restaurant.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID" },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_hours",
        description: "Get business hours including special hours and holidays.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID" },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_find_similar",
        description: "Find businesses similar to a given business.",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID to find similar places" },
                limit: { type: "number", description: "Number of similar places", default: 5 },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_trending",
        description: "Get trending/hot new restaurants and businesses in a location.",
        inputSchema: {
            type: "object",
            properties: {
                location: { type: "string", description: "Location to search" },
                category: { type: "string", description: "Category filter (e.g., 'restaurants', 'nightlife')" },
            },
            required: ["location"],
        },
    },
    {
        name: "yelp_get_collections",
        description: "Get curated Yelp collections for a location (best of lists, staff picks).",
        inputSchema: {
            type: "object",
            properties: {
                location: { type: "string", description: "Location to search" },
                category: { type: "string", description: "Collection category" },
            },
            required: ["location"],
        },
    },
    {
        name: "yelp_check_wait_time",
        description: "Check estimated wait time at a restaurant (if available).",
        inputSchema: {
            type: "object",
            properties: {
                businessId: { type: "string", description: "Yelp business ID" },
            },
            required: ["businessId"],
        },
    },
    {
        name: "yelp_get_deals",
        description: "Get current deals and offers for businesses in a location.",
        inputSchema: {
            type: "object",
            properties: {
                location: { type: "string", description: "Location to search" },
                category: { type: "string", description: "Business category" },
            },
            required: ["location"],
        },
    },
];
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (!session) {
            session = new YelpSession();
            await session.initialize();
        }
        switch (name) {
            case "yelp_search_restaurants":
                return { content: [{ type: "text", text: JSON.stringify(await session.searchRestaurants(args), null, 2) }] };
            case "yelp_search_businesses":
                return { content: [{ type: "text", text: JSON.stringify(await session.searchBusinesses(args), null, 2) }] };
            case "yelp_get_business_details":
                return { content: [{ type: "text", text: JSON.stringify(await session.getBusinessDetails(args?.businessId), null, 2) }] };
            case "yelp_get_reviews":
                return { content: [{ type: "text", text: JSON.stringify(await session.getReviews(args?.businessId, args), null, 2) }] };
            case "yelp_get_photos":
                return { content: [{ type: "text", text: JSON.stringify(await session.getPhotos(args?.businessId, args), null, 2) }] };
            case "yelp_get_menu":
                return { content: [{ type: "text", text: JSON.stringify(await session.getMenu(args?.businessId), null, 2) }] };
            case "yelp_get_hours":
                return { content: [{ type: "text", text: JSON.stringify(await session.getHours(args?.businessId), null, 2) }] };
            case "yelp_find_similar":
                return { content: [{ type: "text", text: JSON.stringify(await session.findSimilar(args?.businessId, args?.limit), null, 2) }] };
            case "yelp_get_trending":
                return { content: [{ type: "text", text: JSON.stringify(await session.getTrending(args?.location, args?.category), null, 2) }] };
            case "yelp_get_collections":
                return { content: [{ type: "text", text: JSON.stringify(await session.getCollections(args?.location, args?.category), null, 2) }] };
            case "yelp_check_wait_time":
                return { content: [{ type: "text", text: JSON.stringify(await session.checkWaitTime(args?.businessId), null, 2) }] };
            case "yelp_get_deals":
                return { content: [{ type: "text", text: JSON.stringify(await session.getDeals(args?.location, args?.category), null, 2) }] };
            default:
                return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
        }
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
