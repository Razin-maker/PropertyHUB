document.addEventListener('DOMContentLoaded', function() {
    // Initialize map if map element exists on the page
    const mapElement = document.getElementById('property-map');
    
    // Add CSS for property details meta (beds/baths)
    const style = document.createElement('style');
    style.textContent = `
        .property-details-meta {
            display: flex;
            gap: 15px;
            margin-top: 5px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .property-details-meta span {
            display: flex;
            align-items: center;
        }
        
        .property-details-meta span strong {
            margin-right: 4px;
            color: #333;
        }
    `;
    document.head.appendChild(style);
    
    // Check if we're on the property details page and load the correct property
    if (window.location.href.includes('property-details.html')) {
        loadPropertyDetails();
        // Note: Map will be initialized in loadPropertyDetails
    } 
    // Otherwise initialize map for other pages (like the property form)
    else if (mapElement) {
        initMap(mapElement);
    }

    // If we're on the seller dashboard, initialize notifications
    if (window.location.href.includes('seller-dashboard.html')) {
        initializeNotifications();
        
        // Initialize the property type change handler to show/hide beds and baths fields
        const propertyTypeSelect = document.getElementById('property-type');
        if (propertyTypeSelect) {
            // Initial setup of beds/baths fields
            toggleBedsAndBathsFields(propertyTypeSelect.value);
            
            // Add change listener
            propertyTypeSelect.addEventListener('change', function() {
                toggleBedsAndBathsFields(this.value);
            });
        }
    }

    // If we're on the buyer dashboard, initialize notifications
    if (window.location.href.includes('buyer-dashboard.html')) {
        initializeNotifications();
        // Load bookings and visits for the buyer
        loadUserBookingsAndVisits();
    }

    // Role selector for login page
    const roleOptions = document.querySelectorAll('.role-option');
    if (roleOptions.length > 0) {
        roleOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                roleOptions.forEach(o => o.classList.remove('role-selected'));
                // Add selected class to clicked option
                this.classList.add('role-selected');
                // Set hidden input value
                document.getElementById('role').value = this.dataset.role;
            });
        });
    }

    // Property image gallery functionality
    const propertyThumbnails = document.querySelectorAll('.property-thumbnail');
    if (propertyThumbnails.length > 0) {
        propertyThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const mainImage = document.querySelector('.property-main-image');
                const thumbnailStyle = this.style.backgroundImage;
                const mainImageStyle = mainImage.style.backgroundImage;
                
                // Swap images
                mainImage.style.backgroundImage = thumbnailStyle;
                this.style.backgroundImage = mainImageStyle;
            });
        });
    }

    // Check if we're on the seller dashboard and ensure action buttons work
    if (window.location.href.includes('seller-dashboard.html')) {
        // We need to set a short timeout to ensure the DOM is fully ready
        setTimeout(() => {
            addPropertyActionListeners();
            console.log('Added property action listeners to seller dashboard');
            
            // Load bookings for seller properties
            loadSellerBookings();
        }, 500);
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;

                requiredFields.forEach(field => {
                    if (!field.value) {
                        isValid = false;
                        field.classList.add('error');
                    } else {
                        field.classList.remove('error');
                    }
                });

                // Email validation for contact forms
                const emailField = form.querySelector('input[type="email"]');
                if (emailField && emailField.value) {
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailPattern.test(emailField.value)) {
                        isValid = false;
                        emailField.classList.add('error');
                    }
                }

                if (!isValid) {
                    event.preventDefault();
                    alert('Please fill in all required fields correctly.');
                }
            });
        });
    }

    // Load user data into dashboard if available
    if (window.location.href.includes('seller-dashboard.html')) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name) {
            document.querySelector('.sidebar-header p:first-of-type').textContent = userData.name;
        }
        if (userData.email) {
            document.querySelector('.sidebar-header p:last-of-type').textContent = userData.email;
        }
    }

    // Load user data into buyer dashboard if available
    if (window.location.href.includes('buyer-dashboard.html')) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name) {
            document.querySelector('.sidebar-header p:first-of-type').textContent = userData.name;
        }
        if (userData.email) {
            document.querySelector('.sidebar-header p:last-of-type').textContent = userData.email;
        }
        
        // Load properties for buyer dashboard
        loadPropertiesForBuyer();
        
        // Handle profile tab click
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#profile') {
                    e.preventDefault();
                    showBuyerProfile();
                } else if (this.getAttribute('href') === '#messages') {
                    e.preventDefault();
                    showBuyerMessages();
                } else if (this.getAttribute('href') === '#available-properties') {
                    e.preventDefault();
                    showAvailableProperties();
                } else if (this.getAttribute('href') === '#saved-properties') {
                    e.preventDefault();
                    showSavedProperties();
                }
            });
        });
    }

    // Load admin dashboard data if available
    if (window.location.href.includes('admin-dashboard.html')) {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.name) {
            document.querySelector('.sidebar-header p:first-of-type').textContent = userData.name;
        }
        if (userData.email) {
            document.querySelector('.sidebar-header p:last-of-type').textContent = userData.email;
        }
        
        // Load properties for admin approval
        loadPropertiesForApproval();
        
        // Load all bookings for admin
        loadAllBookings();
    }

    // Handle property submission form
    const propertyForm = document.getElementById('property-form');
    if (propertyForm) {
        propertyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            submitProperty(this);
        });
    }

    // Handle property approval buttons
    const approvalButtons = document.querySelectorAll('.approve-property');
    if (approvalButtons.length > 0) {
        approvalButtons.forEach(button => {
            button.addEventListener('click', function() {
                const propertyId = this.dataset.id;
                approveProperty(propertyId);
            });
        });
    }

    // Handle property rejection buttons
    const rejectButtons = document.querySelectorAll('.reject-property');
    if (rejectButtons.length > 0) {
        rejectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const propertyId = this.dataset.id;
                rejectProperty(propertyId);
            });
        });
    }

    // Initialize image preview for property image uploads
    const propertyImageInput = document.getElementById('property-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    if (propertyImageInput && imagePreviewContainer) {
        propertyImageInput.addEventListener('change', function() {
            // Clear existing previews
            imagePreviewContainer.innerHTML = '';
            
            const selectedFiles = this.files;
            if (selectedFiles.length > 0) {
                // Display selected image count
                const countDisplay = document.createElement('div');
                countDisplay.style.width = '100%';
                countDisplay.innerHTML = `<p><strong>${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''} selected</strong></p>`;
                imagePreviewContainer.appendChild(countDisplay);
                
                // Show previews for each image (up to 6 previews to avoid overloading)
                const maxPreviews = Math.min(selectedFiles.length, 6);
                for (let i = 0; i < maxPreviews; i++) {
                    const file = selectedFiles[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const preview = document.createElement('div');
                        preview.className = 'image-preview';
                        preview.style.position = 'relative';
                        preview.style.width = '120px';
                        preview.style.height = '80px';
                        preview.style.overflow = 'hidden';
                        preview.style.borderRadius = '4px';
                        preview.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                        
                        preview.innerHTML = `
                            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                        `;
                        
                        imagePreviewContainer.appendChild(preview);
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // If there are more images than we're showing previews for
                if (selectedFiles.length > maxPreviews) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.style.width = '120px';
                    moreIndicator.style.height = '80px';
                    moreIndicator.style.display = 'flex';
                    moreIndicator.style.alignItems = 'center';
                    moreIndicator.style.justifyContent = 'center';
                    moreIndicator.style.background = '#f0f0f0';
                    moreIndicator.style.borderRadius = '4px';
                    moreIndicator.style.fontSize = '1.2rem';
                    moreIndicator.style.fontWeight = 'bold';
                    moreIndicator.style.color = '#666';
                    moreIndicator.textContent = `+${selectedFiles.length - maxPreviews} more`;
                    
                    imagePreviewContainer.appendChild(moreIndicator);
                }
            }
        });
    }
});

// Load property details based on URL parameter
function loadPropertyDetails() {
    // Get property ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');
    
    if (!propertyId) {
        alert('Property ID not found');
        return;
    }
    
    // Get properties from localStorage
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const property = properties.find(prop => prop.id === propertyId);
    
    if (!property) {
        alert('Property not found');
        return;
    }
    
    console.log('Loading property:', property); // Debug log
    console.log('Property location:', property.location); // Debug log for coordinates
    
    // Update page title
    document.title = `${property.title} - PropertyHub`;
    
    // Update property details
    document.querySelector('.property-title h1').textContent = property.title;
    document.querySelector('.property-title .location').textContent = `${property.address}, ${property.city}`;
    
    // Update price/rent based on listing type
    const priceElement = document.querySelector('.property-price');
    if (property.listingType === 'rent') {
        priceElement.innerHTML = `
            <div>৳${Number(property.rent).toLocaleString()} / month</div>
            ${property.serviceCharge ? `<div style="font-size: 0.9rem; margin-top: 5px;">Service Charge: ৳${Number(property.serviceCharge).toLocaleString()}</div>` : ''}
            <div style="font-size: 0.8rem; background-color: #e3f2fd; color: #0d47a1; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">For Rent</div>
        `;
    } else {
        priceElement.innerHTML = `
            <div>৳${Number(property.price).toLocaleString()}</div>
            <div style="font-size: 0.8rem; background-color: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">For Sale</div>
        `;
    }
    
    // Choose default image based on property type
    let defaultImage = 'property1.jpg';
    if (property.type === 'apartment' || property.type === 'condo') {
        defaultImage = 'property2.jpg';
    } else if (property.type === 'warehouse') {
        defaultImage = 'property3.jpg';
    } else if (property.type === 'plot') {
        defaultImage = 'property4.jpg';
    }
    
    // Update main image and thumbnails with uploaded images or fallback to default
    const mainImageElement = document.querySelector('.property-main-image');
    const thumbnailsContainer = document.querySelector('.property-thumbnails');
    
    if (property.images && property.images.length > 0) {
        // Use the first uploaded image as the main image
        mainImageElement.style.backgroundImage = `url('${property.images[0].content}')`;
        
        // Clear existing thumbnails
        thumbnailsContainer.innerHTML = '';
        
        // Add each uploaded image as a thumbnail
        property.images.forEach((image, index) => {
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'property-thumbnail';
            thumbnailDiv.style.backgroundImage = `url('${image.content}')`;
            
            // Mark the first thumbnail as active
            if (index === 0) {
                thumbnailDiv.classList.add('active');
            }
            
            thumbnailDiv.addEventListener('click', function() {
                // Update main image
                mainImageElement.style.backgroundImage = this.style.backgroundImage;
                
                // Remove active class from all thumbnails and add to clicked one
                document.querySelectorAll('.property-thumbnail').forEach(thumb => {
                    thumb.classList.remove('active');
                });
                this.classList.add('active');
            });
            
            thumbnailsContainer.appendChild(thumbnailDiv);
        });
        
        // If we have more than 4 images, create navigation buttons
        if (property.images.length > 5) {
            // Add navigation buttons
            const prevButton = document.createElement('button');
            prevButton.className = 'thumbnail-nav prev';
            prevButton.innerHTML = '&#10094;';
            prevButton.style.position = 'absolute';
            prevButton.style.left = '0';
            prevButton.style.top = '50%';
            prevButton.style.transform = 'translateY(-50%)';
            prevButton.style.zIndex = '2';
            prevButton.style.background = 'rgba(0,0,0,0.5)';
            prevButton.style.color = 'white';
            prevButton.style.border = 'none';
            prevButton.style.borderRadius = '50%';
            prevButton.style.width = '30px';
            prevButton.style.height = '30px';
            prevButton.style.cursor = 'pointer';
            
            const nextButton = document.createElement('button');
            nextButton.className = 'thumbnail-nav next';
            nextButton.innerHTML = '&#10095;';
            nextButton.style.position = 'absolute';
            nextButton.style.right = '0';
            nextButton.style.top = '50%';
            nextButton.style.transform = 'translateY(-50%)';
            nextButton.style.zIndex = '2';
            nextButton.style.background = 'rgba(0,0,0,0.5)';
            nextButton.style.color = 'white';
            nextButton.style.border = 'none';
            nextButton.style.borderRadius = '50%';
            nextButton.style.width = '30px';
            nextButton.style.height = '30px';
            nextButton.style.cursor = 'pointer';
            
            // Get parent container and set position relative
            const galleryContainer = thumbnailsContainer.parentElement;
            galleryContainer.style.position = 'relative';
            
            // Add buttons to container
            galleryContainer.appendChild(prevButton);
            galleryContainer.appendChild(nextButton);
            
            // Set variable to track current visible thumbnails
            let currentIndex = 0;
            
            // Function to update visible thumbnails
            const updateVisibleThumbnails = () => {
                const thumbnails = thumbnailsContainer.querySelectorAll('.property-thumbnail');
                thumbnails.forEach((thumb, idx) => {
                    // Show only 4 thumbnails at a time (indices 0-3 relative to currentIndex)
                    if (idx >= currentIndex && idx < currentIndex + 4) {
                        thumb.style.display = 'block';
                    } else {
                        thumb.style.display = 'none';
                    }
                });
            };
            
            // Initial thumbnail visibility
            updateVisibleThumbnails();
            
            // Add click handlers for navigation
            prevButton.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateVisibleThumbnails();
                }
            });
            
            nextButton.addEventListener('click', () => {
                if (currentIndex < property.images.length - 5) {
                    currentIndex++;
                    updateVisibleThumbnails();
                }
            });
        }
    } else {
        // No uploaded images, use default
        mainImageElement.style.backgroundImage = `url('../images/${defaultImage}')`;
    }
    
    // Update description
    const descriptionContainer = document.querySelector('.property-description');
    const descriptionParagraphs = descriptionContainer.querySelectorAll('p');
    if (descriptionParagraphs.length > 0) {
        descriptionParagraphs[0].textContent = property.description;
        if (descriptionParagraphs.length > 1) {
            descriptionParagraphs[1].remove(); // Remove the second paragraph if it exists
        }
    }
    
    // Update features list
    const featuresList = document.querySelector('.features-list');
    if (featuresList) {
        featuresList.innerHTML = ''; // Clear existing features
        
        // Add area as first feature
        const areaItem = document.createElement('li');
        areaItem.textContent = `${property.area} sq. ft. area`;
        featuresList.appendChild(areaItem);
        
        // Add beds and baths if they exist (for all property types except plots)
        if (property.type !== 'plot') {
            if (property.beds) {
                const bedsItem = document.createElement('li');
                bedsItem.textContent = `${property.beds} ${parseInt(property.beds) === 1 ? 'Bedroom' : 'Bedrooms'}`;
                featuresList.appendChild(bedsItem);
            }
            
            if (property.baths) {
                const bathsItem = document.createElement('li');
                bathsItem.textContent = `${property.baths} ${parseInt(property.baths) === 1 ? 'Bathroom' : 'Bathrooms'}`;
                featuresList.appendChild(bathsItem);
            }
        }
        
        // Add other features
        if (property.features && property.features.length > 0) {
            property.features.forEach(feature => {
                const featureItem = document.createElement('li');
                featureItem.textContent = feature.charAt(0).toUpperCase() + feature.slice(1);
                featuresList.appendChild(featureItem);
            });
        }
    }
    
    // Add nearby amenities section if amenities exist
    if (property.amenities && property.amenities.length > 0) {
        // Check if amenities section already exists
        let amenitiesSection = descriptionContainer.querySelector('.property-amenities');
        
        if (!amenitiesSection) {
            // Create amenities section
            amenitiesSection = document.createElement('div');
            amenitiesSection.className = 'property-amenities';
            amenitiesSection.style.marginTop = '30px';
            
            const amenitiesHeading = document.createElement('h3');
            amenitiesHeading.textContent = 'Nearby Amenities';
            amenitiesSection.appendChild(amenitiesHeading);
            
            const amenitiesList = document.createElement('ul');
            amenitiesList.className = 'amenities-list';
            
            // Map amenity values to display names
            const amenityLabels = {
                'convenience_store': 'Convenience Store',
                'market': 'Market',
                'supershop': 'Supershop',
                'mosque': 'Mosque',
                'school': 'School',
                'college': 'College',
                'university': 'University'
            };
            
            // Add amenities to list
            property.amenities.forEach(amenity => {
                const amenityItem = document.createElement('li');
                amenityItem.textContent = amenityLabels[amenity] || amenity;
                amenitiesList.appendChild(amenityItem);
            });
            
            amenitiesSection.appendChild(amenitiesList);
            
            // Add the amenities section before documents section
            const documentsSection = descriptionContainer.querySelector('.property-documents');
            descriptionContainer.insertBefore(amenitiesSection, documentsSection);
        }
    }
    
    // Update documents list
    const documentsContainer = document.querySelector('.property-documents');
    if (documentsContainer) {
        const documentsList = documentsContainer.querySelector('ul');
        
        if (documentsList) {
            documentsList.innerHTML = ''; // Clear existing document links
            
            if (property.documents && property.documents.length > 0) {
                // Add each uploaded document
                property.documents.forEach(doc => {
                    const docItem = document.createElement('li');
                    const docLink = document.createElement('a');
                    docLink.href = doc.content;
                    docLink.textContent = doc.name;
                    docLink.download = doc.name;
                    docLink.target = '_blank';
                    
                    docItem.appendChild(docLink);
                    documentsList.appendChild(docItem);
                });
            } else {
                // No documents uploaded, show default message
                const noDocsItem = document.createElement('li');
                noDocsItem.textContent = 'No documents have been uploaded for this property.';
                documentsList.appendChild(noDocsItem);
            }
        }
    }
    
    // Update contact form subject
    const subjectField = document.querySelector('#subject');
    if (subjectField) {
        subjectField.value = `Inquiry about ${property.title}`;
    }
    
    // Update seller email in contact form
    const contactForm = document.querySelector('.property-contact-form');
    if (contactForm && property.seller && property.seller.email) {
        contactForm.dataset.email = property.seller.email;
    }
    
    // Check if the user is logged in as a buyer to show booking buttons
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const bookPropertyBtn = document.getElementById('book-property');
    const scheduleVisitBtn = document.getElementById('schedule-visit');
    const bookingActionsContainer = document.querySelector('.booking-actions');
    
    if (bookPropertyBtn && scheduleVisitBtn && bookingActionsContainer) {
        console.log('User role:', userData.role); // Debug log
        
        if (userData.email && userData.role === 'buyer') {
            // Show the buttons for logged-in buyers
            bookPropertyBtn.style.display = 'inline-block';
            scheduleVisitBtn.style.display = 'inline-block';
            bookingActionsContainer.style.display = 'flex';
            
            // Prefill the form fields with user data
            const bookingForm = document.getElementById('booking-form');
            const visitForm = document.getElementById('visit-form');
            
            if (bookingForm) {
                const nameField = bookingForm.querySelector('#booking-name');
                const emailField = bookingForm.querySelector('#booking-email');
                
                if (nameField) nameField.value = userData.name || '';
                if (emailField) emailField.value = userData.email || '';
            }
            
            if (visitForm) {
                const nameField = visitForm.querySelector('#visit-name');
                const emailField = visitForm.querySelector('#visit-email');
                
                if (nameField) nameField.value = userData.name || '';
                if (emailField) emailField.value = userData.email || '';
            }
        } else {
            // Hide the buttons for non-buyers or not logged in users
            bookingActionsContainer.style.display = 'none';
            
            // Add a message suggesting to log in
            const propertyHeader = document.querySelector('.property-header');
            if (propertyHeader) {
                // Check if login message already exists
                let loginMsg = document.querySelector('.login-message');
                if (!loginMsg) {
                    loginMsg = document.createElement('p');
                    loginMsg.className = 'login-message';
                    loginMsg.innerHTML = 'Please <a href="login.html">log in as a buyer</a> to book this property or schedule a visit.';
                    loginMsg.style.fontStyle = 'italic';
                    loginMsg.style.margin = '10px 0';
                    loginMsg.style.padding = '8px 15px';
                    loginMsg.style.backgroundColor = '#f8f9fa';
                    loginMsg.style.borderRadius = '4px';
                    loginMsg.style.borderLeft = '3px solid #0d6efd';
                    
                    // Insert after property header
                    propertyHeader.parentNode.insertBefore(loginMsg, propertyHeader.nextSibling);
                }
            }
        }
    }
    
    // Set up booking modal events
    const bookingModal = document.getElementById('booking-modal');
    const visitModal = document.getElementById('visit-modal');
    
    if (bookingModal && bookPropertyBtn) {
        const closeButtons = bookingModal.querySelectorAll('.close');
        
        // Open modal when booking button is clicked
        bookPropertyBtn.addEventListener('click', function() {
            // Only allow logged in buyers to book
            if (userData.email && userData.role === 'buyer') {
                bookingModal.style.display = 'block';
            } else {
                alert('Please log in as a buyer to book this property');
                window.location.href = 'login.html';
            }
        });
        
        // Close modal when close button is clicked
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                bookingModal.style.display = 'none';
            });
        });
        
        // Handle booking form submission
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Only allow logged in buyers to submit
                if (!userData.email || userData.role !== 'buyer') {
                    alert('Please log in as a buyer to book this property');
                    return;
                }
                
                // Process booking form
                const bookingData = {
                    id: 'booking_' + Date.now(),
                    propertyId: propertyId,
                    propertyTitle: property.title,
                    buyerEmail: userData.email,
                    buyerName: userData.name || bookingForm.querySelector('#booking-name').value,
                    sellerEmail: property.seller?.email || '',
                    phone: bookingForm.querySelector('#booking-phone').value,
                    startDate: bookingForm.querySelector('#booking-start-date').value,
                    endDate: bookingForm.querySelector('#booking-end-date').value,
                    guests: bookingForm.querySelector('#booking-guests').value,
                    notes: bookingForm.querySelector('#booking-notes').value,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                // Save booking to localStorage
                const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                bookings.push(bookingData);
                localStorage.setItem('bookings', JSON.stringify(bookings));
                
                // Create notification for the seller
                if (property.seller && property.seller.email) {
                    createNotification(
                        property.seller.email,
                        'New Booking Request',
                        `A buyer has requested to book your property: ${property.title}`,
                        'booking-request',
                        bookingData.id
                    );
                }
                
                // Close modal and show success message
                bookingModal.style.display = 'none';
                alert('Booking request submitted successfully! The property owner will be notified.');
            });
        }
    }
    
    // Set up visit modal events
    if (visitModal && scheduleVisitBtn) {
        const closeButtons = visitModal.querySelectorAll('.close');
        
        // Open modal when visit button is clicked
        scheduleVisitBtn.addEventListener('click', function() {
            // Only allow logged in buyers to schedule visits
            if (userData.email && userData.role === 'buyer') {
                visitModal.style.display = 'block';
            } else {
                alert('Please log in as a buyer to schedule a visit to this property');
                window.location.href = 'login.html';
            }
        });
        
        // Close modal when close button is clicked
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                visitModal.style.display = 'none';
            });
        });
        
        // Handle visit form submission
        const visitForm = document.getElementById('visit-form');
        if (visitForm) {
            visitForm.addEventListener('submit', function(event) {
                event.preventDefault();
                
                // Only allow logged in buyers to submit
                if (!userData.email || userData.role !== 'buyer') {
                    alert('Please log in as a buyer to schedule a visit');
                    return;
                }
                
                // Process visit form
                const visitData = {
                    id: 'visit_' + Date.now(),
                    propertyId: propertyId,
                    propertyTitle: property.title,
                    buyerEmail: userData.email,
                    buyerName: userData.name || visitForm.querySelector('#visit-name').value,
                    sellerEmail: property.seller?.email || '',
                    phone: visitForm.querySelector('#visit-phone').value,
                    visitDate: visitForm.querySelector('#visit-date').value,
                    visitTime: visitForm.querySelector('#visit-time').value,
                    message: visitForm.querySelector('#visit-message').value,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                
                // Save visit to localStorage
                const visits = JSON.parse(localStorage.getItem('visits') || '[]');
                visits.push(visitData);
                localStorage.setItem('visits', JSON.stringify(visits));
                
                // Create notification for the seller
                if (property.seller && property.seller.email) {
                    createNotification(
                        property.seller.email,
                        'New Visit Request',
                        `A buyer has requested to visit your property: ${property.title}`,
                        'visit-request',
                        visitData.id
                    );
                }
                
                // Close modal and show success message
                visitModal.style.display = 'none';
                alert('Visit request submitted successfully! The property owner will be notified.');
            });
        }
    }
    
    // Update map location
    const mapElement = document.getElementById('property-map');
    if (mapElement && property.location) {
        // Update data attributes
        mapElement.dataset.lat = property.location.lat;
        mapElement.dataset.lng = property.location.lng;
        mapElement.dataset.title = property.title;
        
        // Create a new map for this property
        if (window.propertyMap) {
            window.propertyMap.remove(); // Remove existing map if it exists
        }
        
        // Ensure we're using the property's coordinates (parse as float)
        const latitude = parseFloat(property.location.lat);
        const longitude = parseFloat(property.location.lng);
        
        console.log('Creating map with coordinates:', latitude, longitude); // Debug log
        
        // Create the map
        window.propertyMap = L.map(mapElement).setView([latitude, longitude], 15);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(window.propertyMap);
        
        // Add marker for property location
        const marker = L.marker([latitude, longitude]).addTo(window.propertyMap);
        marker.bindPopup(property.title).openPopup();
        
        // Update directions button to use property coordinates
        const directionsButton = document.getElementById('get-directions');
        if (directionsButton) {
            directionsButton.addEventListener('click', function() {
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                window.open(googleMapsUrl, '_blank');
            });
        }
    }
}

// Initialize LeafletJS map
function initMap(mapElement) {
    const latitude = parseFloat(mapElement.dataset.lat) || 23.8103;
    const longitude = parseFloat(mapElement.dataset.lng) || 90.4125;
    
    console.log('initMap called with coordinates:', latitude, longitude); // Debug
    
    // Create map centered on property coordinates or default to Dhaka, Bangladesh
    const map = L.map(mapElement).setView([latitude, longitude], 15);
    
    // Add OpenStreetMap tiles (free and no API key required)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker for property location
    const marker = L.marker([latitude, longitude]).addTo(map);
    if (mapElement.dataset.title) {
        marker.bindPopup(mapElement.dataset.title).openPopup();
    }

    // Make marker draggable and update coordinates when dragged
    marker.dragging.enable();
    marker.on('dragend', function() {
        const position = marker.getLatLng();
        if (document.getElementById('property-lat') && document.getElementById('property-lng')) {
            document.getElementById('property-lat').value = position.lat;
            document.getElementById('property-lng').value = position.lng;
            console.log('Marker dragged to:', position.lat, position.lng); // Debug
        }
    });

    // Allow clicking on map to set marker position
    map.on('click', function(e) {
        marker.setLatLng(e.latlng);
        if (document.getElementById('property-lat') && document.getElementById('property-lng')) {
            document.getElementById('property-lat').value = e.latlng.lat;
            document.getElementById('property-lng').value = e.latlng.lng;
            console.log('Map clicked at:', e.latlng.lat, e.latlng.lng); // Debug
        }
    });
}

// Handle email form submission
function sendEmail(event, form) {
    event.preventDefault();
    
    const emailTo = form.dataset.email;
    const subject = form.querySelector('#subject').value;
    const message = form.querySelector('#message').value;
    const senderEmail = form.querySelector('#email').value;
    const senderName = form.querySelector('#name').value;
    const senderPhone = form.querySelector('#phone').value;
    
    // Get user data if logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Create message object
    const messageData = {
        id: 'msg_' + Date.now(),
        recipientEmail: emailTo,
        subject,
        message,
        senderEmail: userData.email || senderEmail,
        senderName: userData.name || senderName,
        senderPhone,
        createdAt: new Date().toISOString(),
        read: false
    };
    
    // Save message to localStorage
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push(messageData);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Show success message
    const formContainer = form.parentElement;
    form.style.display = 'none';
    
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <h3>Message Sent!</h3>
        <p>Your message has been sent to the property owner. They will contact you shortly.</p>
        <button class="btn" onclick="location.reload()">Send Another Message</button>
    `;
    
    formContainer.appendChild(successMessage);
    
    return false;
}

// Handle login form submission
function login(event, form) {
    event.preventDefault();
    
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const role = form.querySelector('#role').value;
    
    // Validate form
    if (!email || !password || !role) {
        alert('Please fill in all required fields.');
        return false;
    }

    // In a real application, you would validate against a server
    // For demo purposes, we'll check if the user exists in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === email);
    
    if (user && user.password === password && user.role === role) {
        // Store current user data for dashboard
        localStorage.setItem('userData', JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role
        }));
        
        // Redirect to appropriate dashboard
        if (role === 'seller') {
            window.location.href = 'seller-dashboard.html';
        } else if (role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'buyer-dashboard.html';
        }
    } else if (user && user.password !== password) {
        alert('Incorrect password. Please try again.');
    } else if (user && user.role !== role) {
        alert(`You're registered as a ${user.role}, not a ${role}. Please select the correct role.`);
    } else {
        alert('User not found. Please register first.');
    }
    
    return false;
}

// Handle registration form submission
function register(event, form) {
    event.preventDefault();
    
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const phone = form.querySelector('#phone').value;
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirm-password').value;
    const role = form.querySelector('#role').value;
    
    // Validate form
    if (!name || !email || !phone || !password || !confirmPassword || !role) {
        alert('Please fill in all required fields.');
        return false;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return false;
    }
    
    // In a real application, you would send this to a server
    // For demo purposes, we'll store in localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists
    if (registeredUsers.some(user => user.email === email)) {
        alert('A user with this email already exists.');
        return false;
    }
    
    // Add new user
    registeredUsers.push({
        name,
        email,
        phone,
        password,
        role
    });
    
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    alert('Registration successful! Please log in.');
    window.location.href = 'login.html';
    
    return false;
}

// Submit a new property
function submitProperty(form) {
    const title = form.querySelector('#property-title').value;
    const type = form.querySelector('#property-type').value;
    const listingType = form.querySelector('#listing-type').value;
    const price = form.querySelector('#property-price').value;
    const rent = form.querySelector('#property-rent').value;
    const serviceCharge = form.querySelector('#property-service-charge').value;
    const area = form.querySelector('#property-area').value;
    const address = form.querySelector('#property-address').value;
    const city = form.querySelector('#property-city').value;
    const description = form.querySelector('#property-description').value;
    const lat = form.querySelector('#property-lat').value;
    const lng = form.querySelector('#property-lng').value;
    
    // Get beds and baths if the property type is not a plot
    const beds = form.querySelector('#property-beds') ? form.querySelector('#property-beds').value : '';
    const baths = form.querySelector('#property-baths') ? form.querySelector('#property-baths').value : '';
    
    console.log('Saving property with coordinates:', lat, lng); // Debug log
    
    // Get selected features
    const features = [];
    const featureCheckboxes = form.querySelectorAll('input[name="features[]"]:checked');
    featureCheckboxes.forEach(checkbox => {
        features.push(checkbox.value);
    });
    
    // Get selected nearby amenities
    const amenities = [];
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities[]"]:checked');
    amenityCheckboxes.forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Generate a unique ID for the property
    const propertyId = 'prop_' + Date.now();
    
    // Process image files if available
    const imageInputElement = form.querySelector('#property-images');
    const imageFiles = imageInputElement ? imageInputElement.files : [];
    
    // Show image upload feedback
    const imageUploadFeedback = document.createElement('div');
    if (imageFiles.length > 0) {
        imageUploadFeedback.innerHTML = `<p>Processing ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}... This may take a moment for multiple high-resolution images.</p>`;
        imageUploadFeedback.style.color = '#666';
        imageUploadFeedback.style.fontSize = '0.9rem';
        imageUploadFeedback.style.marginTop = '5px';
        imageUploadFeedback.style.padding = '10px';
        imageUploadFeedback.style.backgroundColor = '#f8f9fa';
        imageUploadFeedback.style.borderRadius = '4px';
        imageUploadFeedback.style.borderLeft = '3px solid #007bff';
        
        const imageInputContainer = imageInputElement.parentElement;
        imageInputContainer.appendChild(imageUploadFeedback);
    }
    
    // Process document files if available
    const documentInputElement = form.querySelector('#property-papers');
    const documentFiles = documentInputElement ? documentInputElement.files : [];
    
    // Function to read files as base64
    const readFilesAsBase64 = async (files) => {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            const result = await new Promise((resolve) => {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: e.target.result
                    });
                };
                
                reader.readAsDataURL(file);
            });
            
            results.push(result);
        }
        
        return results;
    };

    // Create property object with basic info
    const propertyData = {
        id: propertyId,
        title,
        type,
        listingType,
        price: listingType === 'sale' ? price : '',
        rent: listingType === 'rent' ? rent : '',
        serviceCharge: listingType === 'rent' ? serviceCharge : '',
        area,
        address,
        city,
        description,
        beds: type !== 'plot' ? beds : '',
        baths: type !== 'plot' ? baths : '',
        location: {
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        },
        features,
        amenities,
        seller: {
            name: userData.name,
            email: userData.email
        },
        status: 'pending', // Properties start as pending and need admin approval
        featured: false, // Properties are not featured by default, admin can set this
        createdAt: new Date().toISOString(),
        images: [],
        documents: []
    };
    
    // Read the image files and document files, then save the property
    const savePropertyWithFiles = async () => {
        try {
            if (imageFiles.length > 0) {
                // Update feedback with loading progress
                imageUploadFeedback.innerHTML = `
                    <p>Compressing and processing ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...</p>
                    <div style="height: 5px; width: 100%; background-color: #e0e0e0; margin-top: 5px; border-radius: 5px; overflow: hidden;">
                        <div id="upload-progress-bar" style="height: 100%; width: 0%; background-color: #007bff; transition: width 0.3s;"></div>
                    </div>
                `;
                
                const progressBar = imageUploadFeedback.querySelector('#upload-progress-bar');
                
                // Process images with progress updates
                propertyData.images = [];
                for (let i = 0; i < imageFiles.length; i++) {
                    // Update progress bar
                    const progress = Math.round(((i) / imageFiles.length) * 100);
                    progressBar.style.width = `${progress}%`;
                    
                    // Process individual image
                    const file = imageFiles[i];
                    const result = await new Promise((resolve) => {
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            resolve({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                content: e.target.result
                            });
                        };
                        
                        reader.readAsDataURL(file);
                    });
                    
                    propertyData.images.push(result);
                }
                
                // Set progress to 100%
                progressBar.style.width = '100%';
                
                // Update feedback again when done
                imageUploadFeedback.innerHTML = `<p>${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} processed successfully!</p>`;
                imageUploadFeedback.style.color = '#28a745';
                imageUploadFeedback.style.borderLeft = '3px solid #28a745';
            }
            
            if (documentFiles.length > 0) {
                propertyData.documents = await readFilesAsBase64(documentFiles);
            }
            
            // Save to localStorage
            const properties = JSON.parse(localStorage.getItem('properties') || '[]');
            properties.push(propertyData);
            localStorage.setItem('properties', JSON.stringify(properties));
            
            alert('Property submitted for approval. An admin will review your listing soon. Check your dashboard for status updates.');
            
            // Reset form
            form.reset();
            
            // Clear preview images
            const imagePreviewContainer = document.getElementById('image-preview-container');
            if (imagePreviewContainer) {
                imagePreviewContainer.innerHTML = '';
            }
            
            // Remove feedback elements
            if (imageUploadFeedback.parentElement) {
                imageUploadFeedback.parentElement.removeChild(imageUploadFeedback);
            }
            
            // Reload seller properties if on seller dashboard
            if (window.location.href.includes('seller-dashboard.html')) {
                loadSellerProperties();
                updateSellerStats();
            }
            
            // Scroll back to top
            window.scrollTo(0, 0);
        } catch (error) {
            console.error('Error saving property:', error);
            
            // Update feedback on error
            if (imageUploadFeedback.parentElement) {
                imageUploadFeedback.innerHTML = `<p>Error processing images: ${error.message}</p>`;
                imageUploadFeedback.style.color = '#dc3545';
                imageUploadFeedback.style.borderLeft = '3px solid #dc3545';
            }
            
            alert('There was an error saving the property. Please try again.');
        }
    };
    
    // Call the async function to save the property with files
    savePropertyWithFiles();
    
    return false;
}

// Load properties for buyer dashboard
function loadPropertiesForBuyer() {
    const propertyContainer = document.getElementById('property-listings');
    if (!propertyContainer) return;
    
    // Get all approved properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const approvedProperties = properties.filter(prop => prop.status === 'approved');
    
    if (approvedProperties.length === 0) {
        propertyContainer.innerHTML = '<p>No properties available for sale yet.</p>';
        return;
    }
    
    // Clear container
    propertyContainer.innerHTML = '';
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get saved properties
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    // Add each property
    approvedProperties.forEach(property => {
        const propertyCard = document.createElement('div');
        propertyCard.className = 'property-card';
        
        // Choose default image based on property type
        let defaultImage = 'property1.jpg';
        if (property.type === 'apartment' || property.type === 'condo') {
            defaultImage = 'property2.jpg';
        } else if (property.type === 'warehouse') {
            defaultImage = 'property3.jpg';
        } else if (property.type === 'plot') {
            defaultImage = 'property4.jpg';
        }
        
        // Get main image from uploaded images or use default
        const mainImage = property.images && property.images.length > 0 
            ? property.images[0].content 
            : `../images/${defaultImage}`;
        
        // Format price display based on listing type
        let priceDisplay = '';
        if (property.listingType === 'rent') {
            priceDisplay = `
                <p class="price">৳${Number(property.rent).toLocaleString()} / month</p>
                <span class="listing-badge rent">For Rent</span>
            `;
        } else {
            priceDisplay = `
                <p class="price">৳${Number(property.price).toLocaleString()}</p>
                <span class="listing-badge sale">For Sale</span>
            `;
        }
        
        // Check if property is already saved
        const isSaved = savedProperties.some(item => 
            item.propertyId === property.id && item.userEmail === userData.email
        );
        
        // Create save button based on saved status
        const saveButton = isSaved
            ? `<button class="btn-small remove-saved" data-id="${property.id}" style="background-color: #f44336;">Unsave</button>`
            : `<button class="btn-small save-property" data-id="${property.id}" style="background-color: #4CAF50;">Save</button>`;
        
        // Create beds and baths display (if not a plot)
        let bedsAndBaths = '';
        if (property.type !== 'plot' && (property.beds || property.baths)) {
            bedsAndBaths = `<p class="property-details-meta">`;
            
            if (property.beds) {
                bedsAndBaths += `<span><strong>${property.beds}</strong> ${parseInt(property.beds) === 1 ? 'Bed' : 'Beds'}</span>`;
            }
            
            if (property.baths) {
                bedsAndBaths += property.beds ? ' • ' : '';
                bedsAndBaths += `<span><strong>${property.baths}</strong> ${parseInt(property.baths) === 1 ? 'Bath' : 'Baths'}</span>`;
            }
            
            bedsAndBaths += `</p>`;
        }
        
        propertyCard.innerHTML = `
            <div class="property-image" style="background-image: url('${mainImage}')"></div>
            <div class="property-details">
                <h3>${property.title}</h3>
                <p class="location">${property.address}, ${property.city}</p>
                ${priceDisplay}
                <p class="property-type">${getPropertyTypeLabel(property.type)}</p>
                ${bedsAndBaths}
                <div style="display: flex; gap: 10px;">
                    <a href="property-details.html?id=${property.id}" class="btn-small">View Details</a>
                    ${saveButton}
                </div>
            </div>
        `;
        
        propertyContainer.appendChild(propertyCard);
    });
    
    // Add event listeners for save buttons
    const saveButtons = document.querySelectorAll('.save-property');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            saveProperty(propertyId);
        });
    });
    
    // Add event listeners for unsave buttons
    const unsaveButtons = document.querySelectorAll('.remove-saved');
    unsaveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            removeSavedProperty(propertyId);
        });
    });
    
    // Add event filter handlers
    const filterSelects = document.querySelectorAll('.filter-group select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterProperties();
        });
    });
}

// Save a property to favorites
function saveProperty(propertyId) {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!userData.email) {
        alert('You must be logged in to save properties.');
        return;
    }
    
    // Get saved properties
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    // Check if already saved
    if (savedProperties.some(item => item.propertyId === propertyId && item.userEmail === userData.email)) {
        alert('This property is already saved.');
        return;
    }
    
    // Add to saved properties
    savedProperties.push({
        id: 'saved_' + Date.now(),
        propertyId,
        userEmail: userData.email,
        savedAt: new Date().toISOString()
    });
    
    // Save back to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(savedProperties));
    
    // Reload properties to update UI
    loadPropertiesForBuyer();
    
    alert('Property saved to your favorites.');
}

// Helper function to get property type label
function getPropertyTypeLabel(type) {
    const types = {
        'office': 'Office Space',
        'retail': 'Retail Space',
        'warehouse': 'Warehouse',
        'industrial': 'Industrial Property',
        'condo': 'Condominium',
        'apartment': 'Apartment',
        'plot': 'Plot for Sale'
    };
    
    return types[type] || type;
}

// Filter properties
function filterProperties() {
    const propertyType = document.querySelector('select[name="property-type"]')?.value;
    const location = document.querySelector('select[name="location"]')?.value;
    const priceRange = document.querySelector('select[name="price-range"]')?.value;
    
    // Get all approved properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    let filteredProperties = properties.filter(prop => prop.status === 'approved');
    
    // Apply filters
    if (propertyType) {
        filteredProperties = filteredProperties.filter(prop => prop.type === propertyType);
    }
    
    if (location) {
        filteredProperties = filteredProperties.filter(prop => prop.city.toLowerCase().includes(location.toLowerCase()));
    }
    
    if (priceRange) {
        const ranges = {
            'range1': { min: 0, max: 10000000 },
            'range2': { min: 10000000, max: 20000000 },
            'range3': { min: 20000000, max: 30000000 },
            'range4': { min: 30000000, max: Infinity }
        };
        
        const range = ranges[priceRange];
        if (range) {
            filteredProperties = filteredProperties.filter(prop => 
                Number(prop.price) >= range.min && Number(prop.price) <= range.max
            );
        }
    }
    
    // Update property listings
    const propertyContainer = document.getElementById('property-listings');
    if (propertyContainer) {
        if (filteredProperties.length === 0) {
            propertyContainer.innerHTML = '<p>No properties match your filter criteria.</p>';
            return;
        }
        
        // Clear container
        propertyContainer.innerHTML = '';
        
        // Add each property
        filteredProperties.forEach(property => {
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            
            // Choose default image based on property type
            let defaultImage = 'property1.jpg';
            if (property.type === 'apartment' || property.type === 'condo') {
                defaultImage = 'property2.jpg';
            } else if (property.type === 'warehouse') {
                defaultImage = 'property3.jpg';
            } else if (property.type === 'plot') {
                defaultImage = 'property4.jpg';
            }
            
            // Format price display based on listing type
            let priceDisplay = '';
            if (property.listingType === 'rent') {
                priceDisplay = `
                    <p class="price">৳${Number(property.rent).toLocaleString()} / month</p>
                    <span class="listing-badge rent">For Rent</span>
                `;
            } else {
                priceDisplay = `
                    <p class="price">৳${Number(property.price).toLocaleString()}</p>
                    <span class="listing-badge sale">For Sale</span>
                `;
            }
            
            // Create beds and baths display (if not a plot)
            let bedsAndBaths = '';
            if (property.type !== 'plot' && (property.beds || property.baths)) {
                bedsAndBaths = `<p class="property-details-meta">`;
                
                if (property.beds) {
                    bedsAndBaths += `<span><strong>${property.beds}</strong> ${parseInt(property.beds) === 1 ? 'Bed' : 'Beds'}</span>`;
                }
                
                if (property.baths) {
                    bedsAndBaths += property.beds ? ' • ' : '';
                    bedsAndBaths += `<span><strong>${property.baths}</strong> ${parseInt(property.baths) === 1 ? 'Bath' : 'Baths'}</span>`;
                }
                
                bedsAndBaths += `</p>`;
            }
            
            propertyCard.innerHTML = `
                <div class="property-image" style="background-image: url('../images/${defaultImage}')"></div>
                <div class="property-details">
                    <h3>${property.title}</h3>
                    <p class="location">${property.address}, ${property.city}</p>
                    ${priceDisplay}
                    <p class="property-type">${getPropertyTypeLabel(property.type)}</p>
                    ${bedsAndBaths}
                    <a href="property-details.html?id=${property.id}" class="btn-small">View Details</a>
                </div>
            `;
            
            propertyContainer.appendChild(propertyCard);
        });
    }
}

// Load properties for admin approval
function loadPropertiesForApproval() {
    const pendingContainer = document.getElementById('pending-properties');
    if (!pendingContainer) return;
    
    // Get all pending properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const pendingProperties = properties.filter(prop => prop.status === 'pending');
    
    if (pendingProperties.length === 0) {
        pendingContainer.innerHTML = '<p>No properties pending approval.</p>';
        return;
    }
    
    // Clear container
    pendingContainer.innerHTML = '';
    
    // Add each property
    pendingProperties.forEach(property => {
        const propertyRow = document.createElement('tr');
        
        propertyRow.innerHTML = `
            <td>${property.title}</td>
            <td>${property.address}, ${property.city}</td>
            <td>৳${Number(property.price).toLocaleString()}</td>
            <td>${property.seller.name}</td>
            <td>
                <button class="btn-small approve-property" data-id="${property.id}">Approve</button>
                <button class="btn-small reject-property" data-id="${property.id}">Reject</button>
            </td>
        `;
        
        pendingContainer.appendChild(propertyRow);
    });
    
    // Add event listeners to new buttons
    const approveButtons = document.querySelectorAll('.approve-property');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            approveProperty(propertyId);
        });
    });
    
    const rejectButtons = document.querySelectorAll('.reject-property');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            rejectProperty(propertyId);
        });
    });
}

// Approve a property
function approveProperty(propertyId) {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedProperties = properties.map(prop => {
        if (prop.id === propertyId) {
            return { ...prop, status: 'approved', approvedAt: new Date().toISOString() };
        }
        return prop;
    });
    
    localStorage.setItem('properties', JSON.stringify(updatedProperties));
    
    alert('Property has been approved and is now active for sale. Buyers can now view this listing.');
    
    // Reload the pending properties list
    loadPropertiesForApproval();
}

// Reject a property
function rejectProperty(propertyId) {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const updatedProperties = properties.map(prop => {
        if (prop.id === propertyId) {
            return { ...prop, status: 'rejected' };
        }
        return prop;
    });
    
    localStorage.setItem('properties', JSON.stringify(updatedProperties));
    
    alert('Property has been rejected.');
    
    // Reload the pending properties list
    loadPropertiesForApproval();
}

// Load properties for seller dashboard
function loadSellerProperties() {
    const propertyContainer = document.getElementById('seller-properties');
    if (!propertyContainer) return;
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) return;
    
    // Get all properties by this seller
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    let sellerProperties = properties.filter(prop => prop.seller && prop.seller.email === userData.email);
    
    // Get sort value
    const sortSelect = document.getElementById('seller-property-sort');
    if (sortSelect) {
        const sortValue = sortSelect.value;
        
        // Apply sorting
        switch (sortValue) {
            case 'newest':
                sellerProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'price-asc':
                sellerProperties.sort((a, b) => {
                    const priceA = a.listingType === 'rent' ? Number(a.rent) : Number(a.price);
                    const priceB = b.listingType === 'rent' ? Number(b.rent) : Number(b.price);
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                sellerProperties.sort((a, b) => {
                    const priceA = a.listingType === 'rent' ? Number(a.rent) : Number(a.price);
                    const priceB = b.listingType === 'rent' ? Number(b.rent) : Number(b.price);
                    return priceB - priceA;
                });
                break;
            case 'area-asc':
                sellerProperties.sort((a, b) => Number(a.area) - Number(b.area));
                break;
        }
    }
    
    if (sellerProperties.length === 0) {
        propertyContainer.innerHTML = '<tr><td colspan="5">You haven\'t listed any properties yet.</td></tr>';
        return;
    }
    
    // Clear container
    propertyContainer.innerHTML = '';
    
    // Add each property
    sellerProperties.forEach(property => {
        const propertyRow = document.createElement('tr');
        
        // Determine status badge style
        let statusBadge = '';
        if (property.status === 'approved') {
            statusBadge = '<span class="status-badge approved">Approved</span>';
        } else if (property.status === 'pending') {
            statusBadge = '<span class="status-badge pending">Pending Approval</span>';
        } else if (property.status === 'rejected') {
            statusBadge = '<span class="status-badge rejected">Rejected</span>';
        }
        
        // Determine price display based on listing type
        let priceDisplay = property.listingType === 'rent' 
            ? `৳${Number(property.rent).toLocaleString()}/month` 
            : `৳${Number(property.price).toLocaleString()}`;
        
        propertyRow.innerHTML = `
            <td>${property.title}</td>
            <td>${property.address}, ${property.city}</td>
            <td>${priceDisplay}</td>
            <td>${statusBadge}</td>
            <td>
                <a href="property-details.html?id=${property.id}" class="btn-small">View</a>
                <button class="btn-small edit-property" data-id="${property.id}">Edit</button>
                <button class="btn-small delete-property" data-id="${property.id}" style="background-color: #f44336;">Delete</button>
            </td>
        `;
        
        propertyContainer.appendChild(propertyRow);
    });
    
    // Add event listeners for edit and delete buttons
    addPropertyActionListeners();
}

// Add event listeners for property action buttons
function addPropertyActionListeners() {
    // Edit button listeners
    const editButtons = document.querySelectorAll('.edit-property');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            editProperty(propertyId);
        });
    });
    
    // Delete button listeners
    const deleteButtons = document.querySelectorAll('.delete-property');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            deleteProperty(propertyId);
        });
    });
}

// Delete a property
function deleteProperty(propertyId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        return;
    }
    
    // Get all properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    // Remove the property with the given ID
    const updatedProperties = properties.filter(prop => prop.id !== propertyId);
    
    // Save back to localStorage
    localStorage.setItem('properties', JSON.stringify(updatedProperties));
    
    // Update the UI
    loadSellerProperties();
    updateSellerStats();
    
    alert('Property has been deleted successfully.');
}

// Edit a property
function editProperty(propertyId) {
    // Get all properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const property = properties.find(prop => prop.id === propertyId);
    
    if (!property) {
        alert('Property not found.');
        return;
    }
    
    // Create edit modal
    createEditPropertyModal(property);
}

// Create edit property modal
function createEditPropertyModal(property) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '0';
    modalContainer.style.left = '0';
    modalContainer.style.width = '100%';
    modalContainer.style.height = '100%';
    modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modalContainer.style.display = 'flex';
    modalContainer.style.justifyContent = 'center';
    modalContainer.style.alignItems = 'center';
    modalContainer.style.zIndex = '1000';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = 'white';
    modalContent.style.padding = '30px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '800px';
    modalContent.style.maxHeight = '90vh';
    modalContent.style.overflowY = 'auto';
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '15px';
    closeButton.style.border = 'none';
    closeButton.style.background = 'none';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modalContainer);
    });
    
    // Determine if beds/baths fields should be visible
    const showBedsAndBaths = property.type !== 'plot';
    
    // Create a property image preview section if property has images
    let imagesPreviewHtml = '';
    if (property.images && property.images.length > 0) {
        imagesPreviewHtml = `
            <div class="form-group">
                <label>Current Images</label>
                <div class="current-images-preview" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${property.images.map((image, index) => `
                        <div class="image-preview" style="position: relative; width: 120px; height: 80px;">
                            <img src="${image.content}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">
                            <button type="button" class="remove-image-btn" data-index="${index}" style="position: absolute; top: -8px; right: -8px; background: #e74c3c; color: white; border: none; width: 20px; height: 20px; border-radius: 50%; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">×</button>
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="edit-removed-images" name="removed-images" value="">
            </div>
        `;
    }
    
    // Create form content
    const formContent = `
        <h2 style="margin-bottom: 20px; color: var(--primary-color);">Edit Property</h2>
        <form id="edit-property-form" class="auth-form" style="max-width: 100%;">
            <input type="hidden" id="edit-property-id" value="${property.id}">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group">
                    <label for="edit-property-title">Property Title</label>
                    <input type="text" id="edit-property-title" name="title" class="form-control" value="${property.title}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-property-type">Property Type</label>
                    <select id="edit-property-type" name="type" class="form-control" required>
                        <option value="office"${property.type === 'office' ? ' selected' : ''}>Office Space</option>
                        <option value="retail"${property.type === 'retail' ? ' selected' : ''}>Retail Space</option>
                        <option value="warehouse"${property.type === 'warehouse' ? ' selected' : ''}>Warehouse</option>
                        <option value="industrial"${property.type === 'industrial' ? ' selected' : ''}>Industrial Property</option>
                        <option value="condo"${property.type === 'condo' ? ' selected' : ''}>Condominium</option>
                        <option value="apartment"${property.type === 'apartment' ? ' selected' : ''}>Apartment</option>
                        <option value="plot"${property.type === 'plot' ? ' selected' : ''}>Plot for Sale</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="edit-listing-type">Listing Type</label>
                    <select id="edit-listing-type" name="listing-type" class="form-control" required>
                        <option value="sale"${property.listingType === 'sale' || !property.listingType ? ' selected' : ''}>For Sale</option>
                        <option value="rent"${property.listingType === 'rent' ? ' selected' : ''}>For Rent</option>
                    </select>
                </div>
                
                <div class="form-group edit-sale-field" ${property.listingType === 'rent' ? 'style="display: none;"' : ''}>
                    <label for="edit-property-price">Price (৳)</label>
                    <input type="number" id="edit-property-price" name="price" class="form-control" value="${property.price || ''}" ${property.listingType === 'rent' ? '' : 'required'}>
                </div>
                
                <div class="form-group edit-rent-field" ${property.listingType !== 'rent' ? 'style="display: none;"' : ''}>
                    <label for="edit-property-rent">Rent per Month (৳)</label>
                    <input type="number" id="edit-property-rent" name="rent" class="form-control" value="${property.rent || ''}" ${property.listingType === 'rent' ? 'required' : ''}>
                </div>
                
                <div class="form-group edit-rent-field" ${property.listingType !== 'rent' ? 'style="display: none;"' : ''}>
                    <label for="edit-property-service-charge">Service Charge (৳)</label>
                    <input type="number" id="edit-property-service-charge" name="service-charge" class="form-control" value="${property.serviceCharge || ''}">
                </div>
                
                <div class="form-group">
                    <label for="edit-property-area">Area (sq. ft)</label>
                    <input type="number" id="edit-property-area" name="area" class="form-control" value="${property.area}" required>
                </div>
                
                <div class="form-group edit-beds-field" ${showBedsAndBaths ? '' : 'style="display: none;"'}>
                    <label for="edit-property-beds">Bedrooms</label>
                    <input type="number" id="edit-property-beds" name="beds" class="form-control" value="${property.beds || ''}" min="0">
                </div>
                
                <div class="form-group edit-baths-field" ${showBedsAndBaths ? '' : 'style="display: none;"'}>
                    <label for="edit-property-baths">Bathrooms</label>
                    <input type="number" id="edit-property-baths" name="baths" class="form-control" value="${property.baths || ''}" min="0">
                </div>
                
                <div class="form-group">
                    <label for="edit-property-address">Address</label>
                    <input type="text" id="edit-property-address" name="address" class="form-control" value="${property.address}" required>
                </div>
                
                <div class="form-group">
                    <label for="edit-property-city">City</label>
                    <input type="text" id="edit-property-city" name="city" class="form-control" value="${property.city}" required>
                </div>
            </div>
            
            <div class="form-group">
                <label for="edit-property-description">Description</label>
                <textarea id="edit-property-description" name="description" class="form-control" rows="5" required>${property.description}</textarea>
            </div>
            
            ${imagesPreviewHtml}
            
            <div class="form-group">
                <label for="edit-property-images">Add More Images</label>
                <input type="file" id="edit-property-images" name="images[]" class="form-control" multiple accept="image/*">
                <p style="margin-top: 5px; font-size: 0.85rem; color: #666;">Select multiple images by holding Ctrl (or Cmd on Mac) while clicking, or by dragging multiple files at once.</p>
                <div class="new-images-preview" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;"></div>
            </div>
            
            <div class="form-group">
                <label>Features</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <label><input type="checkbox" name="features[]" value="parking" ${property.features && property.features.includes('parking') ? 'checked' : ''}> Parking</label>
                    <label><input type="checkbox" name="features[]" value="security" ${property.features && property.features.includes('security') ? 'checked' : ''}> 24/7 Security</label>
                    <label><input type="checkbox" name="features[]" value="elevator" ${property.features && property.features.includes('elevator') ? 'checked' : ''}> Elevator</label>
                    <label><input type="checkbox" name="features[]" value="ac" ${property.features && property.features.includes('ac') ? 'checked' : ''}> Air Conditioning</label>
                    <label><input type="checkbox" name="features[]" value="reception" ${property.features && property.features.includes('reception') ? 'checked' : ''}> Reception Area</label>
                    <label><input type="checkbox" name="features[]" value="internet" ${property.features && property.features.includes('internet') ? 'checked' : ''}> High-Speed Internet</label>
                </div>
            </div>
            
            <div class="form-group">
                <label>Nearby Amenities</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
                    <label><input type="checkbox" name="amenities[]" value="convenience_store" ${property.amenities && property.amenities.includes('convenience_store') ? 'checked' : ''}> Convenience Store</label>
                    <label><input type="checkbox" name="amenities[]" value="market" ${property.amenities && property.amenities.includes('market') ? 'checked' : ''}> Market</label>
                    <label><input type="checkbox" name="amenities[]" value="supershop" ${property.amenities && property.amenities.includes('supershop') ? 'checked' : ''}> Supershop</label>
                    <label><input type="checkbox" name="amenities[]" value="mosque" ${property.amenities && property.amenities.includes('mosque') ? 'checked' : ''}> Mosque</label>
                    <label><input type="checkbox" name="amenities[]" value="school" ${property.amenities && property.amenities.includes('school') ? 'checked' : ''}> School</label>
                    <label><input type="checkbox" name="amenities[]" value="college" ${property.amenities && property.amenities.includes('college') ? 'checked' : ''}> College</label>
                    <label><input type="checkbox" name="amenities[]" value="university" ${property.amenities && property.amenities.includes('university') ? 'checked' : ''}> University</label>
                </div>
            </div>
            
            <button type="submit" class="form-submit">Save Changes</button>
        </form>
    `;
    
    modalContent.innerHTML = formContent;
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);
    document.body.appendChild(modalContainer);
    
    // Handle property type change (to show/hide beds and baths fields)
    const propertyTypeSelect = document.getElementById('edit-property-type');
    if (propertyTypeSelect) {
        propertyTypeSelect.addEventListener('change', function() {
            const bedsField = document.querySelector('.edit-beds-field');
            const bathsField = document.querySelector('.edit-baths-field');
            
            if (this.value === 'plot') {
                bedsField.style.display = 'none';
                bathsField.style.display = 'none';
            } else {
                bedsField.style.display = 'block';
                bathsField.style.display = 'block';
            }
        });
    }
    
    // Handle listing type change in edit form
    const editListingTypeSelect = document.getElementById('edit-listing-type');
    if (editListingTypeSelect) {
        editListingTypeSelect.addEventListener('change', function() {
            const saleFields = document.querySelectorAll('.edit-sale-field');
            const rentFields = document.querySelectorAll('.edit-rent-field');
            
            if (this.value === 'rent') {
                // Show rent fields, hide sale fields
                saleFields.forEach(field => field.style.display = 'none');
                rentFields.forEach(field => field.style.display = 'block');
                
                // Make rent field required, price field not required
                document.getElementById('edit-property-rent').setAttribute('required', 'required');
                document.getElementById('edit-property-price').removeAttribute('required');
            } else {
                // Show sale fields, hide rent fields
                saleFields.forEach(field => field.style.display = 'block');
                rentFields.forEach(field => field.style.display = 'none');
                
                // Make price field required, rent field not required
                document.getElementById('edit-property-price').setAttribute('required', 'required');
                document.getElementById('edit-property-rent').removeAttribute('required');
            }
        });
    }
    
    // Handle form submission
    const editForm = document.getElementById('edit-property-form');
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        updateProperty(this);
    });
    
    // Preview new images when selected
    const imageInput = document.getElementById('edit-property-images');
    const previewContainer = document.querySelector('.new-images-preview');
    
    if (imageInput && previewContainer) {
        imageInput.addEventListener('change', function() {
            previewContainer.innerHTML = '';
            
            const selectedFiles = this.files;
            if (selectedFiles.length > 0) {
                // Display selected image count
                const countDisplay = document.createElement('div');
                countDisplay.style.width = '100%';
                countDisplay.innerHTML = `<p><strong>${selectedFiles.length} new image${selectedFiles.length > 1 ? 's' : ''} selected</strong></p>`;
                previewContainer.appendChild(countDisplay);
                
                // Show previews for each image (up to 6 previews to avoid overloading)
                const maxPreviews = Math.min(selectedFiles.length, 6);
                for (let i = 0; i < maxPreviews; i++) {
                    const file = selectedFiles[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const preview = document.createElement('div');
                        preview.className = 'image-preview';
                        preview.style.position = 'relative';
                        preview.style.width = '120px';
                        preview.style.height = '80px';
                        preview.style.overflow = 'hidden';
                        preview.style.borderRadius = '4px';
                        preview.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                        
                        preview.innerHTML = `
                            <img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover;">
                        `;
                        
                        previewContainer.appendChild(preview);
                    };
                    
                    reader.readAsDataURL(file);
                }
                
                // If there are more images than we're showing previews for
                if (selectedFiles.length > maxPreviews) {
                    const moreIndicator = document.createElement('div');
                    moreIndicator.style.width = '120px';
                    moreIndicator.style.height = '80px';
                    moreIndicator.style.display = 'flex';
                    moreIndicator.style.alignItems = 'center';
                    moreIndicator.style.justifyContent = 'center';
                    moreIndicator.style.background = '#f0f0f0';
                    moreIndicator.style.borderRadius = '4px';
                    moreIndicator.style.fontSize = '1.2rem';
                    moreIndicator.style.fontWeight = 'bold';
                    moreIndicator.style.color = '#666';
                    moreIndicator.textContent = `+${selectedFiles.length - maxPreviews} more`;
                    
                    previewContainer.appendChild(moreIndicator);
                }
            }
        });
    }
    
    // Handle removing existing images
    const removeButtons = document.querySelectorAll('.remove-image-btn');
    const removedImagesInput = document.getElementById('edit-removed-images');
    const removedIndices = [];
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            removedIndices.push(index);
            removedImagesInput.value = removedIndices.join(',');
            
            // Hide the image preview
            this.parentElement.style.display = 'none';
        });
    });
}

// Update property with edited data
function updateProperty(form) {
    const propertyId = form.querySelector('#edit-property-id').value;
    const title = form.querySelector('#edit-property-title').value;
    const type = form.querySelector('#edit-property-type').value;
    const listingType = form.querySelector('#edit-listing-type').value;
    const price = form.querySelector('#edit-property-price').value;
    const rent = form.querySelector('#edit-property-rent').value;
    const serviceCharge = form.querySelector('#edit-property-service-charge').value;
    const area = form.querySelector('#edit-property-area').value;
    const address = form.querySelector('#edit-property-address').value;
    const city = form.querySelector('#edit-property-city').value;
    const description = form.querySelector('#edit-property-description').value;
    
    // Get beds and baths if available and not a plot
    const beds = type !== 'plot' && form.querySelector('#edit-property-beds') ? form.querySelector('#edit-property-beds').value : '';
    const baths = type !== 'plot' && form.querySelector('#edit-property-baths') ? form.querySelector('#edit-property-baths').value : '';
    
    // Get selected features
    const features = [];
    const featureCheckboxes = form.querySelectorAll('input[name="features[]"]:checked');
    featureCheckboxes.forEach(checkbox => {
        features.push(checkbox.value);
    });
    
    // Get selected nearby amenities
    const amenities = [];
    const amenityCheckboxes = form.querySelectorAll('input[name="amenities[]"]:checked');
    amenityCheckboxes.forEach(checkbox => {
        amenities.push(checkbox.value);
    });
    
    // Get removed image indices
    const removedImagesInput = form.querySelector('#edit-removed-images');
    const removedIndices = removedImagesInput && removedImagesInput.value ? 
        removedImagesInput.value.split(',').map(Number) : [];
    
    // Process new image files if available
    const imageInputElement = form.querySelector('#edit-property-images');
    const imageFiles = imageInputElement ? imageInputElement.files : [];
    
    // Get all properties
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const propertyIndex = properties.findIndex(prop => prop.id === propertyId);
    
    if (propertyIndex === -1) {
        alert('Property not found.');
        return;
    }
    
    // Get existing property
    const existingProperty = properties[propertyIndex];
    
    // Create updated property object (without images yet)
    const updatedProperty = {
        ...existingProperty,
        title,
        type,
        listingType,
        price: listingType === 'sale' ? price : '',
        rent: listingType === 'rent' ? rent : '',
        serviceCharge: listingType === 'rent' ? serviceCharge : '',
        area,
        beds: type !== 'plot' ? beds : '',
        baths: type !== 'plot' ? baths : '',
        address,
        city,
        description,
        features,
        amenities,
        featured: existingProperty.featured // Preserve the featured flag
    };
    
    // Function to read files as base64
    const readFilesAsBase64 = async (files) => {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            const result = await new Promise((resolve) => {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    resolve({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        content: e.target.result
                    });
                };
                
                reader.readAsDataURL(file);
            });
            
            results.push(result);
        }
        
        return results;
    };
    
    // Process images and update property
    const processImagesAndUpdate = async () => {
        try {
            // Filter out removed images
            if (existingProperty.images && existingProperty.images.length > 0) {
                updatedProperty.images = existingProperty.images.filter((_, index) => 
                    !removedIndices.includes(index.toString())
                );
            } else {
                updatedProperty.images = [];
            }
            
            // Add new images
            if (imageFiles.length > 0) {
                const newImages = await readFilesAsBase64(imageFiles);
                updatedProperty.images = [...updatedProperty.images, ...newImages];
            }
            
            // If status was approved, set it back to pending after edit
            if (updatedProperty.status === 'approved') {
                updatedProperty.status = 'pending';
                updatedProperty.updatedAt = new Date().toISOString();
            }
            
            // Update the property in the array
            properties[propertyIndex] = updatedProperty;
            
            // Save back to localStorage
            localStorage.setItem('properties', JSON.stringify(properties));
            
            // Remove modal
            const modalContainer = document.querySelector('.modal-container');
            if (modalContainer) {
                document.body.removeChild(modalContainer);
            }
            
            // Update UI
            loadSellerProperties();
            updateSellerStats();
            
            alert('Property has been updated successfully. If you modified an approved property, it will need to be re-approved by an admin.');
        } catch (error) {
            console.error('Error updating property:', error);
            alert('There was an error updating the property. Please try again.');
        }
    };
    
    // Start processing images and update
    processImagesAndUpdate();
}

// Show buyer profile section
function showBuyerProfile() {
    // Hide all sections
    hideAllBuyerSections();
    
    // Update page header
    document.querySelector('.dashboard-header h2').textContent = 'My Profile';
    
    // Get the dashboard content area
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = registeredUsers.find(u => u.email === userData.email);
    
    // Create profile section
    const profileSection = document.createElement('div');
    profileSection.id = 'profile-section';
    
    // Create profile form
    profileSection.innerHTML = `
        <form id="profile-form" class="auth-form" style="max-width: 600px; margin: 0 auto;">
            <div class="form-group">
                <label for="profile-name">Full Name</label>
                <input type="text" id="profile-name" name="name" class="form-control" value="${user?.name || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="profile-email">Email</label>
                <input type="email" id="profile-email" name="email" class="form-control" value="${user?.email || ''}" disabled>
                <p style="margin-top: 5px; font-size: 0.85rem; color: #666;">Email cannot be changed</p>
            </div>
            
            <div class="form-group">
                <label for="profile-phone">Phone Number</label>
                <input type="tel" id="profile-phone" name="phone" class="form-control" value="${user?.phone || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="profile-password">New Password (leave blank to keep current)</label>
                <input type="password" id="profile-password" name="password" class="form-control">
            </div>
            
            <div class="form-group">
                <label for="profile-confirm-password">Confirm New Password</label>
                <input type="password" id="profile-confirm-password" name="confirm-password" class="form-control">
            </div>
            
            <button type="submit" class="form-submit">Update Profile</button>
        </form>
    `;
    
    // Add profile section to dashboard content
    dashboardContent.appendChild(profileSection);
    
    // Handle profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(event) {
        event.preventDefault();
        updateUserProfile(this);
    });
    
    // Highlight the active nav item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#profile') {
            link.classList.add('active');
        }
    });
}

// Show buyer messages section
function showBuyerMessages() {
    // Hide all sections
    hideAllBuyerSections();
    
    // Update page header
    document.querySelector('.dashboard-header h2').textContent = 'My Messages';
    
    // Get the dashboard content area
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // Create messages section
    const messagesSection = document.createElement('div');
    messagesSection.id = 'messages-section';
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get messages for this user
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    const userMessages = messages.filter(msg => msg.recipientEmail === userData.email);
    
    if (userMessages.length === 0) {
        messagesSection.innerHTML = `
            <div style="text-align: center; margin-top: 50px;">
                <h3>No Messages</h3>
                <p>You don't have any messages yet.</p>
            </div>
        `;
    } else {
        // Create messages list
        const messagesList = document.createElement('div');
        messagesList.className = 'messages-list';
        
        userMessages.forEach(message => {
            const messageCard = document.createElement('div');
            messageCard.className = 'message-card';
            messageCard.style.backgroundColor = 'white';
            messageCard.style.padding = '20px';
            messageCard.style.borderRadius = '8px';
            messageCard.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            messageCard.style.marginBottom = '20px';
            
            messageCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                        <strong>From:</strong> ${message.senderName} (${message.senderEmail})
                    </div>
                    <div style="color: #666; font-size: 0.9rem;">
                        ${new Date(message.createdAt).toLocaleString()}
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Subject:</strong> ${message.subject}
                </div>
                <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
                    ${message.message}
                </div>
                <button class="btn-small delete-message" data-id="${message.id}">Delete</button>
            `;
            
            messagesList.appendChild(messageCard);
        });
        
        messagesSection.appendChild(messagesList);
    }
    
    // Add messages section to dashboard content
    dashboardContent.appendChild(messagesSection);
    
    // Add delete message functionality
    const deleteButtons = document.querySelectorAll('.delete-message');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const messageId = this.dataset.id;
            deleteMessage(messageId);
        });
    });
    
    // Highlight the active nav item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#messages') {
            link.classList.add('active');
        }
    });
}

// Show available properties section
function showAvailableProperties() {
    // Hide all sections
    hideAllBuyerSections();
    
    // Update page header
    document.querySelector('.dashboard-header h2').textContent = 'Available Properties';
    
    // Get the dashboard content area
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // Create available properties section
    const propertiesSection = document.createElement('div');
    propertiesSection.id = 'available-properties-section';
    
    // Create filters section
    propertiesSection.innerHTML = `
        <div class="properties-filters" style="display: flex; justify-content: space-between; margin-bottom: 30px;">
            <div class="filter-group" style="display: flex; gap: 15px;">
                <select class="form-control" name="property-type">
                    <option value="">All Property Types</option>
                    <option value="office">Office Space</option>
                    <option value="retail">Retail Space</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="industrial">Industrial Property</option>
                    <option value="condo">Condominium</option>
                    <option value="apartment">Apartment</option>
                    <option value="plot">Plot for Sale</option>
                </select>
                
                <select class="form-control" name="location">
                    <option value="">All Locations</option>
                    <option value="dhaka">Dhaka</option>
                    <option value="chittagong">Chittagong</option>
                    <option value="khulna">Khulna</option>
                    <option value="rajshahi">Rajshahi</option>
                </select>
                
                <select class="form-control" name="price-range">
                    <option value="">Price Range</option>
                    <option value="range1">Below ৳10,000,000</option>
                    <option value="range2">৳10,000,000 - ৳20,000,000</option>
                    <option value="range3">৳20,000,000 - ৳30,000,000</option>
                    <option value="range4">Above ৳30,000,000</option>
                </select>
            </div>
            
            <div class="sort-group">
                <select class="form-control">
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="area-asc">Area: Small to Large</option>
                </select>
            </div>
        </div>
        
        <div class="property-grid" id="property-listings">
            <p>Loading properties...</p>
        </div>
    `;
    
    // Add properties section to dashboard content
    dashboardContent.appendChild(propertiesSection);
    
    // Load properties
    loadPropertiesForBuyer();
    
    // Add event filter handlers
    const filterSelects = document.querySelectorAll('.filter-group select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            filterProperties();
        });
    });
    
    // Highlight the active nav item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#available-properties') {
            link.classList.add('active');
        }
    });
}

// Show saved properties section
function showSavedProperties() {
    // Hide all sections
    hideAllBuyerSections();
    
    // Update page header
    document.querySelector('.dashboard-header h2').textContent = 'Saved Properties';
    
    // Get the dashboard content area
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // Create saved properties section
    const savedPropertiesSection = document.createElement('div');
    savedPropertiesSection.id = 'saved-properties-section';
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get saved properties for this user
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const userSavedProperties = savedProperties.filter(item => item.userEmail === userData.email);
    
    if (userSavedProperties.length === 0) {
        savedPropertiesSection.innerHTML = `
            <div style="text-align: center; margin-top: 50px;">
                <h3>No Saved Properties</h3>
                <p>You haven't saved any properties yet. Browse available properties and click "Save" to add them to your saved list.</p>
                <button class="btn" onclick="showAvailableProperties()">Browse Properties</button>
            </div>
        `;
    } else {
        // Create saved properties grid
        const propertyGrid = document.createElement('div');
        propertyGrid.className = 'property-grid';
        
        // Get all properties
        const properties = JSON.parse(localStorage.getItem('properties') || '[]');
        
        // Add each saved property
        userSavedProperties.forEach(savedProperty => {
            const property = properties.find(p => p.id === savedProperty.propertyId);
            if (!property) return;
            
            const propertyCard = document.createElement('div');
            propertyCard.className = 'property-card';
            
            // Choose default image based on property type
            let defaultImage = 'property1.jpg';
            if (property.type === 'apartment' || property.type === 'condo') {
                defaultImage = 'property2.jpg';
            } else if (property.type === 'warehouse') {
                defaultImage = 'property3.jpg';
            } else if (property.type === 'plot') {
                defaultImage = 'property4.jpg';
            }
            
            // Get main image from uploaded images or use default
            const mainImage = property.images && property.images.length > 0 
                ? property.images[0].content 
                : `../images/${defaultImage}`;
            
            // Format price display based on listing type
            let priceDisplay = '';
            if (property.listingType === 'rent') {
                priceDisplay = `
                    <p class="price">৳${Number(property.rent).toLocaleString()} / month</p>
                    <span class="listing-badge rent">For Rent</span>
                `;
            } else {
                priceDisplay = `
                    <p class="price">৳${Number(property.price).toLocaleString()}</p>
                    <span class="listing-badge sale">For Sale</span>
                `;
            }
            
            propertyCard.innerHTML = `
                <div class="property-image" style="background-image: url('${mainImage}')"></div>
                <div class="property-details">
                    <h3>${property.title}</h3>
                    <p class="location">${property.address}, ${property.city}</p>
                    ${priceDisplay}
                    <p class="property-type">${getPropertyTypeLabel(property.type)}</p>
                    <div style="display: flex; gap: 10px;">
                        <a href="property-details.html?id=${property.id}" class="btn-small">View Details</a>
                        <button class="btn-small remove-saved" data-id="${property.id}" style="background-color: #f44336;">Remove</button>
                    </div>
                </div>
            `;
            
            propertyGrid.appendChild(propertyCard);
        });
        
        savedPropertiesSection.appendChild(propertyGrid);
    }
    
    // Add saved properties section to dashboard content
    dashboardContent.appendChild(savedPropertiesSection);
    
    // Add remove saved property functionality
    const removeButtons = document.querySelectorAll('.remove-saved');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const propertyId = this.dataset.id;
            removeSavedProperty(propertyId);
        });
    });
    
    // Highlight the active nav item
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#saved-properties') {
            link.classList.add('active');
        }
    });
}

// Hide all buyer dashboard sections
function hideAllBuyerSections() {
    const dashboardContent = document.querySelector('.dashboard-content');
    
    // Remove all sections except dashboard header and stats
    const sections = [
        '#profile-section', 
        '#messages-section', 
        '#available-properties-section', 
        '#saved-properties-section'
    ];
    
    sections.forEach(section => {
        const element = document.querySelector(section);
        if (element) {
            dashboardContent.removeChild(element);
        }
    });
    
    // Remove property-grid if it exists directly under dashboard-content
    const propertyGrid = dashboardContent.querySelector('.property-grid');
    if (propertyGrid) {
        propertyGrid.remove();
    }
}

// Update user profile
function updateUserProfile(form) {
    const name = form.querySelector('#profile-name').value;
    const phone = form.querySelector('#profile-phone').value;
    const password = form.querySelector('#profile-password').value;
    const confirmPassword = form.querySelector('#profile-confirm-password').value;
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get all registered users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = registeredUsers.findIndex(u => u.email === userData.email);
    
    if (userIndex === -1) {
        alert('User not found.');
        return;
    }
    
    // Update user data
    registeredUsers[userIndex].name = name;
    registeredUsers[userIndex].phone = phone;
    
    // Update password if provided
    if (password) {
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }
        
        registeredUsers[userIndex].password = password;
    }
    
    // Save changes
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Update userData in localStorage
    userData.name = name;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    document.querySelector('.sidebar-header p:first-of-type').textContent = name;
    
    alert('Profile updated successfully.');
}

// Delete a message
function deleteMessage(messageId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this message?')) {
        return;
    }
    
    // Get all messages
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    
    // Remove the message with the given ID
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    
    // Save back to localStorage
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    
    // Check which dashboard we're on and refresh accordingly
    if (window.location.href.includes('buyer-dashboard.html')) {
        showBuyerMessages();
    } else if (window.location.href.includes('seller-dashboard.html')) {
        showSellerMessages();
    }
    
    alert('Message deleted successfully.');
}

// Remove a saved property
function removeSavedProperty(propertyId) {
    // Confirm removal
    if (!confirm('Are you sure you want to remove this property from your saved list?')) {
        return;
    }
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Get all saved properties
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    
    // Remove the saved property
    const updatedSavedProperties = savedProperties.filter(item => 
        !(item.propertyId === propertyId && item.userEmail === userData.email)
    );
    
    // Save back to localStorage
    localStorage.setItem('savedProperties', JSON.stringify(updatedSavedProperties));
    
    // Refresh the saved properties section
    showSavedProperties();
}

// Load bookings for seller properties
function loadSellerBookings() {
    const bookingsContainer = document.getElementById('property-bookings');
    if (!bookingsContainer) {
        // Create bookings section if it doesn't exist
        createBookingsSection();
        return;
    }
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) return;
    
    // Get all properties owned by this seller
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const sellerProperties = properties.filter(prop => prop.sellerEmail === userData.email);
    
    if (sellerProperties.length === 0) {
        bookingsContainer.innerHTML = '<p>You have no properties listed to receive bookings.</p>';
        return;
    }
    
    // Get property IDs
    const propertyIds = sellerProperties.map(p => p.id);
    
    // Get bookings for these properties
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    
    // Combine both types of requests
    const allRequests = [
        ...bookings.filter(b => propertyIds.includes(b.propertyId)),
        ...visits.filter(v => propertyIds.includes(v.propertyId))
    ];
    
    // Sort by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (allRequests.length === 0) {
        bookingsContainer.innerHTML = '<p>You have no booking or visit requests yet.</p>';
        return;
    }
    
    // Create table to display bookings
    let html = `
        <h3>Booking & Visit Requests</h3>
        <table class="property-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    allRequests.forEach(request => {
        // Find property details
        const property = properties.find(p => p.id === request.propertyId);
        
        // Determine date to display based on request type
        let dateDisplay = '';
        if (request.type === 'booking') {
            dateDisplay = `${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}`;
        } else {
            dateDisplay = `${new Date(request.visitDate).toLocaleDateString()} at ${request.visitTime}`;
        }
        
        // Add row for this request
        html += `
            <tr>
                <td>${property ? property.title : 'Unknown Property'}</td>
                <td>${request.type === 'booking' ? 'Booking' : 'Visit'}</td>
                <td>${request.name}<br><small>${request.email}</small></td>
                <td>${dateDisplay}</td>
                <td>
                    <span class="status-badge ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                </td>
                <td>
                    <button class="btn-small view-request" data-id="${request.id}" data-type="${request.type}">View</button>
                    ${request.status === 'pending' ? 
                        `<button class="btn-small approve-request" data-id="${request.id}" data-type="${request.type}">Approve</button>
                         <button class="btn-small reject-request" data-id="${request.id}" data-type="${request.type}">Reject</button>` 
                        : ''
                    }
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    bookingsContainer.innerHTML = html;
    
    // Add event listeners for action buttons
    addBookingActionListeners();
}

// Create a new bookings section in the seller dashboard
function createBookingsSection() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    // Create new section
    const bookingsSection = document.createElement('div');
    bookingsSection.id = 'property-bookings';
    bookingsSection.className = 'dashboard-section';
    
    // Add heading
    const heading = document.createElement('h2');
    heading.textContent = 'Property Bookings & Visits';
    
    // Add to dashboard
    bookingsSection.appendChild(heading);
    dashboardContent.appendChild(bookingsSection);
    
    // Now load the bookings
    loadSellerBookings();
}

// Add event listeners for booking action buttons
function addBookingActionListeners() {
    // View request details
    document.querySelectorAll('.view-request').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.id;
            const requestType = this.dataset.type;
            viewRequestDetails(requestId, requestType);
        });
    });
    
    // Approve request
    document.querySelectorAll('.approve-request').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.id;
            const requestType = this.dataset.type;
            updateRequestStatus(requestId, requestType, 'approved');
        });
    });
    
    // Reject request
    document.querySelectorAll('.reject-request').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.id;
            const requestType = this.dataset.type;
            updateRequestStatus(requestId, requestType, 'rejected');
        });
    });
}

// View detailed info about a booking or visit request
function viewRequestDetails(requestId, requestType) {
    // Get request data from localStorage
    let requestData;
    if (requestType === 'booking') {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        requestData = bookings.find(b => b.id === requestId);
    } else {
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        requestData = visits.find(v => v.id === requestId);
    }
    
    if (!requestData) {
        alert('Request not found');
        return;
    }
    
    // Get property details
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const property = properties.find(p => p.id === requestData.propertyId);
    
    // Create modal to show details
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    let modalContent = `
        <div class="modal-content" style="max-width: 600px;">
            <span class="close">&times;</span>
            <h2>${requestType === 'booking' ? 'Booking' : 'Visit'} Request Details</h2>
            
            <div style="margin-bottom: 20px;">
                <h3>Property Information</h3>
                <p><strong>Property:</strong> ${property ? property.title : 'Unknown Property'}</p>
                <p><strong>Location:</strong> ${property ? property.address + ', ' + property.city : 'N/A'}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>Client Information</h3>
                <p><strong>Name:</strong> ${requestData.name}</p>
                <p><strong>Email:</strong> ${requestData.email}</p>
                <p><strong>Phone:</strong> ${requestData.phone}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3>${requestType === 'booking' ? 'Booking' : 'Visit'} Information</h3>
                ${requestType === 'booking' ? 
                    `<p><strong>Start Date:</strong> ${new Date(requestData.startDate).toLocaleDateString()}</p>
                     <p><strong>End Date:</strong> ${new Date(requestData.endDate).toLocaleDateString()}</p>
                     <p><strong>Number of Occupants:</strong> ${requestData.guests}</p>` 
                    : 
                    `<p><strong>Visit Date:</strong> ${new Date(requestData.visitDate).toLocaleDateString()}</p>
                     <p><strong>Visit Time:</strong> ${requestData.visitTime}</p>`
                }
                <p><strong>Special Requests/Notes:</strong> ${requestData.notes || 'None'}</p>
                <p><strong>Status:</strong> <span class="status-badge ${requestData.status}">${requestData.status.charAt(0).toUpperCase() + requestData.status.slice(1)}</span></p>
            </div>
            
            ${requestData.status === 'pending' ? 
                `<div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-small approve-modal-request" data-id="${requestData.id}" data-type="${requestType}" style="background-color: #2ecc71;">Approve</button>
                    <button class="btn-small reject-modal-request" data-id="${requestData.id}" data-type="${requestType}" style="background-color: #e74c3c;">Reject</button>
                </div>` 
                : ''
            }
        </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeBtn = modal.querySelector('.close');
    closeBtn.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // Click outside to close
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add event listeners for action buttons in modal
    const approveBtn = modal.querySelector('.approve-modal-request');
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            updateRequestStatus(this.dataset.id, this.dataset.type, 'approved');
            document.body.removeChild(modal);
        });
    }
    
    const rejectBtn = modal.querySelector('.reject-modal-request');
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            updateRequestStatus(this.dataset.id, this.dataset.type, 'rejected');
            document.body.removeChild(modal);
        });
    }
}

// Update the status of a booking or visit request
function updateRequestStatus(requestId, requestType, newStatus) {
    let requestData;
    let customerEmail;
    let propertyTitle = "the property";
    
    // Get property details for the notification
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    if (requestType === 'booking') {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === requestId);
        
        if (bookingIndex !== -1) {
            requestData = bookings[bookingIndex];
            customerEmail = requestData.email;
            
            // Get property title
            const property = properties.find(p => p.id === requestData.propertyId);
            if (property) {
                propertyTitle = property.title;
            }
            
            // Update the booking status
            bookings[bookingIndex].status = newStatus;
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    } else {
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        const visitIndex = visits.findIndex(v => v.id === requestId);
        
        if (visitIndex !== -1) {
            requestData = visits[visitIndex];
            customerEmail = requestData.email;
            
            // Get property title
            const property = properties.find(p => p.id === requestData.propertyId);
            if (property) {
                propertyTitle = property.title;
            }
            
            // Update the visit status
            visits[visitIndex].status = newStatus;
            localStorage.setItem('visits', JSON.stringify(visits));
        }
    }
    
    // Create a notification for the customer
    if (customerEmail) {
        let notificationTitle = '';
        let notificationMessage = '';
        
        if (newStatus === 'approved') {
            notificationTitle = `Your ${requestType} request has been approved`;
            if (requestType === 'booking') {
                notificationMessage = `Great news! Your booking request for "${propertyTitle}" has been approved. Please check your bookings for more details.`;
            } else {
                notificationMessage = `Great news! Your visit request for "${propertyTitle}" has been approved. Please check your visits for more details.`;
            }
        } else if (newStatus === 'rejected') {
            notificationTitle = `Your ${requestType} request has been declined`;
            if (requestType === 'booking') {
                notificationMessage = `Unfortunately, your booking request for "${propertyTitle}" has been declined. Please contact the property owner for more information.`;
            } else {
                notificationMessage = `Unfortunately, your visit request for "${propertyTitle}" has been declined. Please contact the property owner for more information.`;
            }
        }
        
        // Create the notification
        console.log(`Creating notification for customer ${customerEmail}:`, notificationTitle);
        
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const newNotification = {
            id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            recipientEmail: customerEmail,
            title: notificationTitle,
            message: notificationMessage,
            type: requestType,
            referenceId: requestId,
            createdAt: new Date().toISOString(),
            read: false
        };
        
        // Add to notifications array
        notifications.push(newNotification);
        
        // Save to localStorage
        localStorage.setItem('notifications', JSON.stringify(notifications));
        
        console.log('Notification saved. All notifications:', notifications);
    }
    
    // Show confirmation message
    alert(`The ${requestType} request has been ${newStatus}.`);
    
    // Reload bookings
    loadSellerBookings();
}

// Load all bookings for admin dashboard
function loadAllBookings() {
    const bookingsContainer = document.getElementById('admin-bookings');
    if (!bookingsContainer) {
        // Create bookings section if it doesn't exist
        createAdminBookingsSection();
        return;
    }
    
    // Get all bookings and visits
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    
    // Combine both types of requests
    const allRequests = [...bookings, ...visits];
    
    // Sort by creation date (newest first)
    allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (allRequests.length === 0) {
        bookingsContainer.innerHTML = '<p>There are no booking or visit requests yet.</p>';
        return;
    }
    
    // Get all properties for reference
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    // Create table to display bookings
    let html = `
        <h3>All Booking & Visit Requests</h3>
        <table class="property-table">
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Client</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    allRequests.forEach(request => {
        // Find property details
        const property = properties.find(p => p.id === request.propertyId);
        
        // Determine date to display based on request type
        let dateDisplay = '';
        if (request.type === 'booking') {
            dateDisplay = `${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()}`;
        } else {
            dateDisplay = `${new Date(request.visitDate).toLocaleDateString()} at ${request.visitTime}`;
        }
        
        // Add row for this request
        html += `
            <tr>
                <td>${property ? property.title : 'Unknown Property'}</td>
                <td>${request.type === 'booking' ? 'Booking' : 'Visit'}</td>
                <td>${request.name}<br><small>${request.email}</small></td>
                <td>${dateDisplay}</td>
                <td>
                    <span class="status-badge ${request.status}">${request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                </td>
                <td>
                    <button class="btn-small view-request" data-id="${request.id}" data-type="${request.type}">View</button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    bookingsContainer.innerHTML = html;
    
    // Add event listeners for action buttons
    document.querySelectorAll('.view-request').forEach(button => {
        button.addEventListener('click', function() {
            const requestId = this.dataset.id;
            const requestType = this.dataset.type;
            viewRequestDetails(requestId, requestType);
        });
    });
}

// Create a new bookings section in the admin dashboard
function createAdminBookingsSection() {
    const dashboardContent = document.querySelector('.dashboard-content');
    if (!dashboardContent) return;
    
    // Create new section
    const bookingsSection = document.createElement('div');
    bookingsSection.id = 'admin-bookings';
    bookingsSection.className = 'dashboard-section';
    
    // Add heading
    const heading = document.createElement('h2');
    heading.textContent = 'All Bookings & Visits';
    
    // Add to dashboard
    bookingsSection.appendChild(heading);
    dashboardContent.appendChild(bookingsSection);
    
    // Now load the bookings
    loadAllBookings();
}

// Initialize notification system
function initializeNotifications() {
    const notificationBell = document.getElementById('notification-bell');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const notificationBadge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    const markAllReadBtn = document.getElementById('mark-all-read');
    
    if (!notificationBell || !notificationDropdown || !notificationBadge || !notificationList) {
        console.log('Notification elements not found');
        return;
    }
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) {
        console.log('User not logged in');
        return;
    }
    
    // Debug logs to help troubleshoot
    console.log('Initializing notifications for user:', userData.email);
    
    // Create a test notification for this user (for testing purposes)
    createTestNotification(userData.email);
    
    // Load notifications
    loadNotifications();
    
    // Toggle notification dropdown
    notificationBell.addEventListener('click', function(event) {
        event.stopPropagation();
        console.log('Notification bell clicked');
        
        if (notificationDropdown.style.display === 'block') {
            notificationDropdown.style.display = 'none';
        } else {
            notificationDropdown.style.display = 'block';
            loadNotifications(); // Reload notifications when opening
        }
    });
    
    // Close dropdown when clicking outside
    window.addEventListener('click', function(event) {
        if (notificationDropdown.style.display === 'block' && !notificationDropdown.contains(event.target)) {
            notificationDropdown.style.display = 'none';
        }
    });
    
    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', function() {
        markAllNotificationsAsRead();
    });
}

// Create a test notification for the user
function createTestNotification(userEmail) {
    // Get all notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Check if we already created a test notification in the last day
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentTestNotification = notifications.some(n => 
        n.recipientEmail === userEmail && 
        n.title === 'Welcome to PropertyHub' && 
        new Date(n.createdAt) > oneDayAgo
    );
    
    if (recentTestNotification) {
        console.log('Test notification already exists');
        return; // Don't create duplicate test notifications
    }
    
    // Create test notification
    const newNotification = {
        id: 'notif_test_' + Date.now(),
        recipientEmail: userEmail,
        title: 'Welcome to PropertyHub',
        message: 'Thank you for using our platform. Explore available properties or list your own!',
        type: 'system',
        createdAt: new Date().toISOString(),
        read: false
    };
    
    console.log('Creating test notification:', newNotification);
    
    // Add to notifications
    notifications.push(newNotification);
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Load notifications for the current user
function loadNotifications() {
    const notificationBadge = document.getElementById('notification-badge');
    const notificationList = document.getElementById('notification-list');
    
    if (!notificationBadge || !notificationList) {
        console.log('Notification elements not found in loadNotifications');
        return;
    }
    
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) {
        console.log('User not logged in in loadNotifications');
        return;
    }
    
    console.log('Loading notifications for user:', userData.email);
    
    // Get notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    console.log('All notifications in storage:', notifications);
    
    const userNotifications = notifications.filter(n => n.recipientEmail === userData.email);
    
    console.log('Found notifications for this user:', userNotifications.length);
    console.log('User notifications:', userNotifications);
    
    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Count unread notifications
    const unreadCount = userNotifications.filter(n => !n.read).length;
    
    // Update badge
    if (unreadCount > 0) {
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
    
    // Clear notification list
    notificationList.innerHTML = '';
    
    // Display notifications or empty message
    if (userNotifications.length === 0) {
        notificationList.innerHTML = '<li class="notification-empty">No notifications yet</li>';
    } else {
        userNotifications.forEach(notification => {
            const notificationItem = document.createElement('li');
            notificationItem.className = 'notification-item';
            if (!notification.read) {
                notificationItem.classList.add('unread');
            }
            
            // Format date
            const notificationDate = new Date(notification.createdAt);
            const timeAgo = getTimeAgo(notificationDate);
            
            notificationItem.innerHTML = `
                <div class="notification-item-title">${notification.title}</div>
                <div class="notification-item-message">${notification.message}</div>
                <div class="notification-item-time">${timeAgo}</div>
            `;
            
            // Add click event to view the notification
            notificationItem.addEventListener('click', function() {
                viewNotification(notification);
            });
            
            notificationList.appendChild(notificationItem);
        });
    }
}

// Format time to "time ago" (e.g., "5 minutes ago")
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// View notification details and mark as read
function viewNotification(notification) {
    // Mark as read
    markNotificationAsRead(notification.id);
    
    // Close notification dropdown
    document.getElementById('notification-dropdown').style.display = 'none';
    
    // If it's a booking or visit notification, show details
    if (notification.type === 'booking' && notification.referenceId) {
        // Find booking data
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const booking = bookings.find(b => b.id === notification.referenceId);
        
        if (booking) {
            viewRequestDetails(booking.id, 'booking');
            return;
        }
    } else if (notification.type === 'visit' && notification.referenceId) {
        // Find visit data
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        const visit = visits.find(v => v.id === notification.referenceId);
        
        if (visit) {
            viewRequestDetails(visit.id, 'visit');
            return;
        }
    }
    
    // If we couldn't show details, just show an alert
    alert(notification.message);
}

// Mark a notification as read
function markNotificationAsRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Update the notification
    const updatedNotifications = notifications.map(notification => {
        if (notification.id === notificationId) {
            return {...notification, read: true};
        }
        return notification;
    });
    
    // Save changes
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Reload notifications
    loadNotifications();
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) return;
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Update all notifications for this user
    const updatedNotifications = notifications.map(notification => {
        if (notification.recipientEmail === userData.email) {
            return {...notification, read: true};
        }
        return notification;
    });
    
    // Save changes
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
    
    // Reload notifications
    loadNotifications();
}

// Create notification function
function createNotification(recipientEmail, title, message, type, referenceId) {
    // Get all notifications
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    // Create new notification
    const notification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        recipientEmail,
        title,
        message,
        type,
        referenceId,
        createdAt: new Date().toISOString(),
        read: false
    };
    
    // Add to notifications
    notifications.push(notification);
    
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Initialize notifications for buyer dashboard too
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // If we're on the buyer dashboard, initialize notifications
    if (window.location.href.includes('buyer-dashboard.html')) {
        initializeNotifications();
        // Load bookings and visits for the buyer
        loadUserBookingsAndVisits();
    }
    
    // ... existing code ...
});

// Function to load bookings and visits for the current user
function loadUserBookingsAndVisits() {
    // Get user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.email) return;
    
    // Get bookings and visits
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const visits = JSON.parse(localStorage.getItem('visits') || '[]');
    
    // Filter by user email
    const userBookings = bookings.filter(b => b.email === userData.email);
    const userVisits = visits.filter(v => v.email === userData.email);
    
    // Update stats
    const savedProperties = JSON.parse(localStorage.getItem('savedProperties') || '[]');
    const userSavedProperties = savedProperties.filter(item => item.userEmail === userData.email);
    
    // Update dashboard stats
    const statCards = document.querySelectorAll('.stat-card p');
    if (statCards.length >= 4) {
        statCards[0].textContent = userSavedProperties.length;
        statCards[1].textContent = userBookings.length + userVisits.length;
        
        // Count unread messages
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const userMessages = messages.filter(msg => msg.recipientEmail === userData.email);
        const unreadMessages = userMessages.filter(msg => !msg.read).length;
        statCards[2].textContent = unreadMessages;
        
        // Count property alerts (notifications)
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const userNotifications = notifications.filter(n => n.recipientEmail === userData.email);
        const unreadNotifications = userNotifications.filter(n => !n.read).length;
        statCards[3].textContent = unreadNotifications;
    }
}

// Function to toggle beds and baths fields based on property type
function toggleBedsAndBathsFields(propertyType) {
    const bedsField = document.querySelector('.property-beds-field');
    const bathsField = document.querySelector('.property-baths-field');
    
    if (!bedsField || !bathsField) return;
    
    if (propertyType === 'plot') {
        bedsField.style.display = 'none';
        bathsField.style.display = 'none';
        
        // Clear values when hiding
        document.getElementById('property-beds').value = '';
        document.getElementById('property-baths').value = '';
    } else {
        bedsField.style.display = 'block';
        bathsField.style.display = 'block';
    }
}

// ... existing code ... 