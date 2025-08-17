# GlobalSearch Component

A unified global search bar component for the CloudNest project that provides both keyword and AI semantic search capabilities.

## Features

### 🎯 **Dual Search Modes**
- **Keyword Search**: Traditional text-based search using existing `/api/files/search` endpoint
- **AI Search**: Semantic search using `/api/semantic/search` endpoint with relevance scoring

### 🎨 **Modern UI Design**
- Clean, minimal design using TailwindCSS
- Rounded search input with search icon
- Pill-style segmented control for search type selection
- Globe toggle (🌐) for public files inclusion/exclusion
- Responsive design for mobile and desktop

### ⚡ **Smart Functionality**
- 500ms debounced search requests
- Real-time results in dropdown overlay
- Click outside to close results
- Loading states and error handling
- File type icons and metadata display

## Usage

### Basic Implementation

```tsx
import GlobalSearch from '../common/GlobalSearch';

const MyComponent = () => {
  return (
    <div className="w-full max-w-2xl">
      <GlobalSearch />
    </div>
  );
};
```

### Integration in Navbar

The component is already integrated in both:
- `NavBar.tsx` - For public pages
- `DashboardTopNavbar.tsx` - For dashboard pages

## Component Structure

### Props
The component accepts no props - it's self-contained with all necessary state management.

### State Variables
- `query`: Current search input value
- `searchType`: Either `'keyword'` or `'semantic'`
- `includePublic`: Boolean for including public files
- `results`: Array of search results
- `loading`: Loading state indicator
- `showResults`: Controls results dropdown visibility
- `error`: Error message if search fails

### Key Functions
- `performSearch()`: Executes search based on current type and settings
- `debouncedSearch()`: Debounces search requests by 500ms
- `handleResultClick()`: Handles file result clicks
- `getFileIconComponent()`: Renders appropriate file type icons

## API Integration

### Keyword Search
```typescript
// Uses existing api.files.search()
const response = await api.files.search({
  q: searchQuery,
  tags: [],
  mimetype: ''
});
```

### Semantic Search
```typescript
// Uses existing api.files.semanticSearch()
const response = await api.files.semanticSearch({
  q: searchQuery,
  includePublic,
  limit: 10
});
```

## Search Results Display

### Result Item Structure
Each search result shows:
- File type icon (color-coded by type)
- File name (truncated if too long)
- Owner information (if available)
- File size (for keyword search)
- Public file indicator
- Match percentage (for AI search)

### File Type Icons
- **Images**: Green camera icon
- **PDFs**: Red document icon  
- **Documents**: Blue document icon
- **Others**: Gray generic file icon

## Styling

### TailwindCSS Classes Used
- **Layout**: `flex`, `relative`, `absolute`, `max-w-2xl`
- **Spacing**: `p-2`, `px-3`, `py-2`, `space-x-2`, `gap-4`
- **Colors**: `bg-white`, `text-gray-900`, `border-gray-200`
- **Effects**: `shadow-lg`, `rounded-full`, `transition-all`
- **States**: `hover:bg-gray-50`, `focus:ring-1`, `focus:border-[#18b26f]`

### Custom Colors
- Primary brand color: `#18b26f` (CloudNest green)
- Hover states: `gray-50`, `gray-100`
- Success indicators: `green-100`, `green-800`

## Responsive Behavior

### Desktop
- Full search bar with all controls visible
- Results dropdown with full width
- Hover effects and smooth transitions

### Mobile
- Compact layout with essential controls
- Touch-friendly button sizes
- Scrollable results dropdown

## Error Handling

### Search Errors
- API failures are caught and displayed
- User-friendly error messages
- Graceful fallback to empty results

### Network Issues
- Timeout handling for slow requests
- Retry logic for failed searches
- Loading states during requests

## Performance Optimizations

### Debouncing
- 500ms delay prevents excessive API calls
- Clears previous timeouts on new input
- Reduces server load and improves UX

### State Management
- Efficient state updates using React hooks
- Memoized callback functions
- Proper cleanup of event listeners

## Accessibility

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter key submits search
- Escape key closes results dropdown

### Screen Reader Support
- Proper ARIA labels and roles
- Descriptive button text
- Semantic HTML structure

## Browser Compatibility

- **Modern Browsers**: Full functionality
- **IE11+**: Basic functionality (some CSS features may not work)
- **Mobile Browsers**: Touch-optimized interface

## Testing

### Demo Page
Visit `/search-demo` to test the component in isolation.

### Test Scenarios
1. **Keyword Search**: Type exact file names or content
2. **AI Search**: Use natural language queries
3. **Public Files Toggle**: Test inclusion/exclusion
4. **Responsive Design**: Test on different screen sizes
5. **Error Handling**: Test with network issues

## Future Enhancements

### Potential Features
- Search history and suggestions
- Advanced filters (date, size, type)
- Search result highlighting
- Export search results
- Search analytics and insights

### API Improvements
- Real-time search suggestions
- Search result caching
- Batch search operations
- Search result ranking customization

## Troubleshooting

### Common Issues

**Search not working**
- Check API endpoints are accessible
- Verify authentication tokens
- Check browser console for errors

**Results not displaying**
- Ensure `showResults` state is true
- Check results array has data
- Verify dropdown positioning

**Styling issues**
- Confirm TailwindCSS is properly configured
- Check for CSS conflicts
- Verify responsive breakpoints

## Contributing

When modifying the GlobalSearch component:

1. **Maintain TypeScript types** for all new features
2. **Follow existing styling patterns** using TailwindCSS
3. **Test responsive behavior** on multiple screen sizes
4. **Update this documentation** for any new features
5. **Ensure accessibility** for all new interactions

## License

This component is part of the CloudNest project and follows the same licensing terms.
