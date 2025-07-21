Documentation: Property Filter Implementation
This document describes the implementation of the filtering functionality on the property listing page, covering both the frontend and the backend, and how they interact to allow users to search for properties with specific criteria.

1. Objective
Allow users to filter the property list by various criteria such as price range, property type, number of bedrooms and bathrooms, operation (sale/rent), and whether it's furnished.

Maintain selected filters in the URL so they can be shared or reloaded.

Ensure that the backend efficiently processes these filters to return only relevant properties.

2. Frontend Implementation (src/app/properties/page.js)
The main properties page (src/app/properties/page.js) has been updated to include the filter user interface and the logic to manage its state and interaction with the URL.

Filter State:

The useState hook is used to manage the state of the filters (minPrice, maxPrice, propertyType, bedrooms, bathrooms, operation, furnished).

The initial values for these states are read directly from the URL's searchParams (useSearchParams), allowing filters to persist if the user shares the URL or reloads the page.

Handling Changes (handleFilterChange):

A handleFilterChange function is responsible for updating the filter state as the user interacts with the input fields (<input> and <select>).

Applying Filters (applyFilters):

When the user clicks the "Apply Filters" button, the applyFilters function constructs a new URLSearchParams object with the current values from the filters state.

Only filters with a value (not empty or not 'all' for selectors) are added to the URL.

router.push(/properties?${newSearchParams.toString()}); is used to navigate to the same page but with the new query parameters in the URL. This triggers the property fetching useEffect to re-execute.

Clearing Filters (clearFilters):

The "Clear Filters" button resets the filters state to its default values (empty or 'all') and navigates to the base URL /properties, removing all query parameters.

Fetching Properties (useEffect):

A useEffect is responsible for calling the API endpoint (/api/properties) whenever the URL's searchParams change.

The query string (queryString) is passed directly to the API, allowing the backend to receive the filtering criteria.

The API results (data) are used to update the properties state, which is then rendered in the user interface.

Filter Field Design:

Initially, an attempt was made to reduce the size of the text fields with max-w-sm, but it was decided to revert to w-full so they occupy 100% of their grid column width, which was aesthetically preferred.

3. Backend Implementation (src/app/api/properties/route.js)
The API endpoint for properties (src/app/api/properties/route.js) has been modified to read and apply the URL query parameters to the database query.

Handling GET Requests:

Within the GET handler, URL query parameters are accessed using new URL(request.url).searchParams.

Values for minPrice, maxPrice, propertyType, bedrooms, bathrooms, operation, and furnished are extracted.

Constructing Prisma's where Clause:

An empty whereClause object is initialized.

For each filter present in the query parameters:

Price ranges (minPrice, maxPrice) are converted to parseFloat and added to whereClause.price using gte (greater than or equal to) and lte (less than or equal to) operators.

propertyType is added to whereClause.type. It's assumed that property types in the database are stored in uppercase (e.g., 'HOUSE', 'APARTMENT'), so the filter value is converted to uppercase before the query.

bedrooms and bathrooms are converted to parseInt and used with gte.

operation is added to whereClause.operation (also converted to uppercase if necessary, according to DB convention).

furnished is handled as a boolean, filtering only if explicitly true or false.

Executing the Prisma Query:

The prisma.property.findMany() function now receives the whereClause object, allowing Prisma to build the appropriate SQL query to filter results directly in the database.

4. Interconnection and Data Flow
User Interacts: The user enters criteria into the filter fields on the frontend (src/app/properties/page.js).

Frontend Updates URL: Upon clicking "Apply Filters", the frontend constructs a new URL with query parameters (e.g., /properties?minPrice=100000&propertyType=Casa).

Frontend Re-renders and Re-fetches: Navigation to the new URL triggers the useEffect in src/app/properties/page.js, which detects the new searchParams.

Frontend Calls API: A new GET request is made to /api/properties including the URL query parameters.

Backend Processes: The GET handler in src/app/api/properties/route.js reads these parameters, constructs the where clause for Prisma, and executes the database query.

Backend Returns Filtered Properties: The API sends a JSON response with properties matching the criteria.

Frontend Displays Results: The frontend receives the filtered data and updates the list of properties displayed to the user.

This approach ensures that the filtering logic is handled efficiently on both the frontend for the user interface and the backend for data querying, providing a fluid and persistent user experience.