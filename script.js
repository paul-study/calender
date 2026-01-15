// Appointment Booking System

const MAX_CUSTOMERS_PER_SLOT = 4;

// Generate time slots for the day (11 AM to 2 PM, 15-minute slots)
const TIME_SLOTS = [
    '11:00 AM',
    '11:15 AM',
    '11:30 AM',
    '11:45 AM',
    '12:00 PM',
    '12:15 PM',
    '12:30 PM',
    '12:45 PM',
    '01:00 PM',
    '01:15 PM',
    '01:30 PM',
    '01:45 PM',
    '02:00 PM'
];

// Storage for bookings (using Firebase)
let bookings = {};
let selectedSlot = null;
let selectedDate = null;

// Load bookings from Firebase
async function loadBookingsFromFirebase() {
    try {
        const snapshot = await db.collection('bookings').get();
        bookings = {};
        snapshot.forEach(doc => {
            const booking = doc.data();
            booking.id = doc.id;
            const slotKey = `${booking.date}_${booking.time}`;
            if (!bookings[slotKey]) {
                bookings[slotKey] = [];
            }
            bookings[slotKey].push(booking);
        });
        return bookings;
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Error loading bookings', 'error');
        return {};
    }
}

// Utility function to generate unique IDs
function generateUniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Confirm dialog
function showConfirm(message) {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        
        const content = document.createElement('div');
        content.className = 'confirm-content';
        
        const text = document.createElement('p');
        text.textContent = message;
        
        const buttons = document.createElement('div');
        buttons.className = 'confirm-buttons';
        
        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'submit-btn';
        confirmBtn.textContent = 'Confirm';
        confirmBtn.onclick = () => {
            dialog.remove();
            resolve(true);
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'cancel-btn';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
            dialog.remove();
            resolve(false);
        };
        
        buttons.appendChild(confirmBtn);
        buttons.appendChild(cancelBtn);
        content.appendChild(text);
        content.appendChild(buttons);
        dialog.appendChild(content);
        document.body.appendChild(dialog);
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    await loadBookingsFromFirebase();
    initializeDatePicker();
    setupEventListeners();
    displayBookings();
});

// Set up date picker with today as minimum date
function initializeDatePicker() {
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
    selectedDate = today;
    generateTimeSlots(today);
}

// Set up event listeners
function setupEventListeners() {
    const dateInput = document.getElementById('appointment-date');
    const appointmentForm = document.getElementById('appointment-form');
    const cancelBtn = document.getElementById('cancel-btn');
    
    dateInput.addEventListener('change', function() {
        selectedDate = this.value;
        selectedSlot = null;
        generateTimeSlots(this.value);
        hideBookingForm();
    });
    
    appointmentForm.addEventListener('submit', handleBookingSubmit);
    cancelBtn.addEventListener('click', hideBookingForm);
}

// Generate time slots for selected date
function generateTimeSlots(date) {
    const timeSlotsContainer = document.getElementById('time-slots');
    timeSlotsContainer.innerHTML = '';
    
    TIME_SLOTS.forEach(time => {
        const slotKey = `${date}_${time}`;
        const bookedCount = getBookedCount(slotKey);
        const availableSpots = MAX_CUSTOMERS_PER_SLOT - bookedCount;
        
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        
        // Determine slot status
        if (bookedCount >= MAX_CUSTOMERS_PER_SLOT) {
            slotElement.classList.add('full');
        } else if (bookedCount >= MAX_CUSTOMERS_PER_SLOT - 1) {
            slotElement.classList.add('limited');
        } else {
            slotElement.classList.add('available');
        }
        
        slotElement.innerHTML = `
            <div class="time">${time}</div>
            <div class="availability">
                ${bookedCount >= MAX_CUSTOMERS_PER_SLOT ? 
                    'FULL' : 
                    `${availableSpots} spot${availableSpots !== 1 ? 's' : ''} left`}
            </div>
        `;
        
        // Add click event if not full
        if (bookedCount < MAX_CUSTOMERS_PER_SLOT) {
            slotElement.addEventListener('click', function() {
                selectTimeSlot(time, slotElement);
            });
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

// Get number of bookings for a specific slot
function getBookedCount(slotKey) {
    return bookings[slotKey] ? bookings[slotKey].length : 0;
}

// Select a time slot
function selectTimeSlot(time, element) {
    // Remove previous selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    
    // Select new slot
    element.classList.add('selected');
    selectedSlot = time;
    
    // Update form
    document.getElementById('selected-time').textContent = `${selectedDate} at ${time}`;
    
    // Show booking form
    showBookingForm();
}

// Show booking form
function showBookingForm() {
    const form = document.getElementById('booking-form');
    form.classList.add('active');
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Hide booking form
function hideBookingForm() {
    const form = document.getElementById('booking-form');
    form.classList.remove('active');
    
    // Clear form
    document.getElementById('appointment-form').reset();
    
    // Clear selection
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    selectedSlot = null;
}

// Handle booking submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!selectedSlot || !selectedDate) {
        showNotification('Please select a time slot', 'error');
        return;
    }
    
    const slotKey = `${selectedDate}_${selectedSlot}`;
    const bookedCount = getBookedCount(slotKey);
    
    // Double-check availability
    if (bookedCount >= MAX_CUSTOMERS_PER_SLOT) {
        showNotification('This slot is now full. Please select another time.', 'error');
        hideBookingForm();
        generateTimeSlots(selectedDate);
        return;
    }
    
    // Get form data
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const phone = document.getElementById('customer-phone').value;
    
    // Create booking object
    const booking = {
        date: selectedDate,
        time: selectedSlot,
        name: name,
        email: email,
        phone: phone,
        createdAt: new Date().toISOString()
    };
    
    try {
        // Save to Firebase
        const docRef = await db.collection('bookings').add(booking);
        booking.id = docRef.id;
        
        // Add booking to local cache
        if (!bookings[slotKey]) {
            bookings[slotKey] = [];
        }
        bookings[slotKey].push(booking);
        
        // Show success message
        showNotification(`Appointment booked successfully! ${selectedDate} at ${selectedSlot}`, 'success');
    } catch (error) {
        console.error('Error saving booking:', error);
        showNotification('Error saving booking. Please try again.', 'error');
        return;
    }
    
    // Reset form and update UI
    hideBookingForm();
    generateTimeSlots(selectedDate);
    displayBookings();
}

// Display all bookings
function displayBookings() {
    const container = document.getElementById('bookings-container');
    container.innerHTML = '';
    
    // Get all bookings and flatten them
    const allBookings = [];
    Object.keys(bookings).forEach(slotKey => {
        bookings[slotKey].forEach(booking => {
            allBookings.push(booking);
        });
    });
    
    // Sort bookings by date and time
    allBookings.sort((a, b) => {
        const dateCompare = new Date(a.date) - new Date(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
    });
    
    if (allBookings.length === 0) {
        container.innerHTML = '<div class="no-bookings">No bookings yet</div>';
        return;
    }
    
    // Display each booking
    allBookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-item';
        
        const bookingInfo = document.createElement('div');
        bookingInfo.className = 'booking-info';
        
        const dateP = document.createElement('p');
        dateP.innerHTML = '<strong>Date:</strong> ';
        dateP.appendChild(document.createTextNode(booking.date));
        
        const timeP = document.createElement('p');
        timeP.innerHTML = '<strong>Time:</strong> ';
        timeP.appendChild(document.createTextNode(booking.time));
        
        const nameP = document.createElement('p');
        nameP.innerHTML = '<strong>Name:</strong> ';
        nameP.appendChild(document.createTextNode(booking.name));
        
        const emailP = document.createElement('p');
        emailP.innerHTML = '<strong>Email:</strong> ';
        emailP.appendChild(document.createTextNode(booking.email));
        
        const phoneP = document.createElement('p');
        phoneP.innerHTML = '<strong>Phone:</strong> ';
        phoneP.appendChild(document.createTextNode(booking.phone));
        
        bookingInfo.appendChild(dateP);
        bookingInfo.appendChild(timeP);
        bookingInfo.appendChild(nameP);
        bookingInfo.appendChild(emailP);
        bookingInfo.appendChild(phoneP);
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'cancel-booking';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            cancelBooking(booking.id, booking.date, booking.time);
        });
        
        bookingElement.appendChild(bookingInfo);
        bookingElement.appendChild(cancelBtn);
        container.appendChild(bookingElement);
    });
}

// Cancel a booking
async function cancelBooking(bookingId, date, time) {
    const confirmed = await showConfirm('Are you sure you want to cancel this booking?');
    
    if (!confirmed) {
        return;
    }
    
    const slotKey = `${date}_${time}`;
    
    try {
        // Delete from Firebase
        await db.collection('bookings').doc(bookingId).delete();
        
        if (bookings[slotKey]) {
            // Remove the booking from local cache
            bookings[slotKey] = bookings[slotKey].filter(b => b.id !== bookingId);
            
            // Clean up empty slots
            if (bookings[slotKey].length === 0) {
                delete bookings[slotKey];
            }
        }
        
        // Update UI
        generateTimeSlots(selectedDate);
        displayBookings();
        
        showNotification('Booking cancelled successfully!', 'success');
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showNotification('Error cancelling booking. Please try again.', 'error');
    }
}
