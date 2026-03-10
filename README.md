# @striderlabs/mcp-yelp

MCP server connector for Yelp - the leading platform for local business discovery. Enables AI agents to search restaurants, read reviews, view photos, check hours, find deals, and discover trending spots.

## Installation

```bash
npm install @striderlabs/mcp-yelp
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "yelp": {
      "command": "npx",
      "args": ["@striderlabs/mcp-yelp"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `yelp_search_restaurants` | Search restaurants by location, cuisine, price |
| `yelp_search_businesses` | Search any type of business |
| `yelp_get_business_details` | Get detailed business information |
| `yelp_get_reviews` | Get reviews with ratings and text |
| `yelp_get_photos` | Get business photos by category |
| `yelp_get_menu` | Get restaurant menu items and prices |
| `yelp_get_hours` | Get business hours |
| `yelp_find_similar` | Find similar businesses |
| `yelp_get_trending` | Get trending/new spots in a location |
| `yelp_get_collections` | Get curated Yelp collections |
| `yelp_check_wait_time` | Check estimated wait time |
| `yelp_get_deals` | Get current deals and offers |

## Example Usage

```typescript
// Search for sushi restaurants
const results = await client.call("yelp_search_restaurants", {
  query: "sushi",
  location: "San Francisco, CA",
  priceRange: "$$",
  sortBy: "rating"
});

// Get business details
const details = await client.call("yelp_get_business_details", {
  businessId: "nobu-san-francisco"
});

// Read reviews
const reviews = await client.call("yelp_get_reviews", {
  businessId: "nobu-san-francisco",
  sortBy: "newest",
  limit: 20
});

// Get restaurant photos
const photos = await client.call("yelp_get_photos", {
  businessId: "nobu-san-francisco",
  category: "food"
});

// Find trending restaurants
const trending = await client.call("yelp_get_trending", {
  location: "San Francisco, CA",
  category: "restaurants"
});
```

## Features

- **Restaurant Search**: Filter by cuisine, price, distance, ratings
- **Business Discovery**: Search for any type of local business
- **Reviews**: Access user reviews with ratings and photos
- **Photos**: Browse food, interior, and exterior photos
- **Menus**: View menu items with prices
- **Hours**: Get operating hours including special hours
- **Trending**: Discover hot new spots
- **Collections**: Access curated "best of" lists
- **Deals**: Find current promotions and offers

## Requirements

- Node.js 18+

## License

MIT

## Links

- [Strider Labs](https://striderlabs.ai)
- [GitHub Repository](https://github.com/markswendsen-code/mcp-yelp)
