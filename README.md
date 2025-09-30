# PropertyHub - Business Real Estate Website

PropertyHub is a comprehensive business real estate website for the Bangladesh market, designed to connect property sellers with potential buyers. The platform allows users to browse and search for commercial properties, view detailed property information, and contact sellers directly through email.

## Features

- **Responsive Design**: Works well on desktop, tablet, and mobile devices
- **Property Listings**: Browse through commercial properties with images and details
- **Property Search**: Filter properties by type, location, and price range
- **Interactive Maps**: View property locations with OpenStreetMap integration
- **User Authentication**: Register and login as a buyer or seller
- **Seller Dashboard**: Manage property listings, upload documents, and track statistics
- **Email Contact System**: Built-in system for buyers to contact sellers

## Pages

1. **Home Page**: Landing page showcasing featured properties
2. **Properties Page**: Complete listing of all available properties with filters
3. **Property Details Page**: Detailed view of individual properties with images, descriptions, features, and map location
4. **Login Page**: User authentication with role selection (buyer/seller)
5. **Registration Page**: New user registration with role selection
6. **Seller Dashboard**: Property management interface for sellers

## Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- LeafletJS for maps (no API key required)

## Setup Instructions

1. Download or clone this repository
2. No build process or dependencies are required - it's a static website
3. Open `index.html` in your web browser to view the site
4. Ensure you have an internet connection for the Leaflet maps to load properly

## Image Placeholder Note

The website references image files that are not included in the repository. For a complete experience, you should add the following images to the `/images` directory:

- hero.jpg (banner image for the home page)
- property1.jpg through property6.jpg (thumbnail images for property listings)
- property1-2.jpg through property1-5.jpg (additional images for the first property's gallery)

## Contact Form Functionality

The contact forms use a simple `mailto:` link approach to open the user's default email client. In a production environment, you would likely replace this with a server-side email handling solution.

## Development Notes

- The website uses CSS variables for consistent styling
- The color scheme is monochromatic green and white as requested
- All forms include client-side validation
- For a production site, additional functionality would need to be implemented:
  - Backend server for user authentication
  - Database for property storage
  - File upload and storage handling
  - More advanced search and filtering

## License

This project is available for personal and commercial use.

## Credits

Developed for PropertyHub Bangladesh. 