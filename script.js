// Appointment Booking System

const MAX_CUSTOMERS_PER_SLOT = 4;

// Generate time slots for the day (9 AM to 5 PM, hourly slots)
const TIME_SLOTS = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM'
];

// Storage for bookings (using localStorage)
let bookings = JSON.parse(localStorage.getItem('bookings')) || {};
let selectedSlot = null;
let selectedDate = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
function handleBookingSubmit(e) {
    e.preventDefault();
    
    if (!selectedSlot || !selectedDate) {
        alert('Please select a time slot');
        return;
    }
    
    const slotKey = `${selectedDate}_${selectedSlot}`;
    const bookedCount = getBookedCount(slotKey);
    
    // Double-check availability
    if (bookedCount >= MAX_CUSTOMERS_PER_SLOT) {
        alert('This slot is now full. Please select another time.');
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
        id: Date.now().toString(),
        date: selectedDate,
        time: selectedSlot,
        name: name,
        email: email,
        phone: phone
    };
    
    // Add booking to storage
    if (!bookings[slotKey]) {
        bookings[slotKey] = [];
    }
    bookings[slotKey].push(booking);
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Show success message
    alert(`Appointment booked successfully!\nDate: ${selectedDate}\nTime: ${selectedSlot}\nName: ${name}`);
    
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
        bookingElement.innerHTML = `
            <div class="booking-info">
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
                <p><strong>Name:</strong> ${booking.name}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
            </div>
            <button class="cancel-booking" onclick="cancelBooking('${booking.id}', '${booking.date}', '${booking.time}')">
                Cancel
            </button>
        `;
        container.appendChild(bookingElement);
    });
}

// Cancel a booking
function cancelBooking(bookingId, date, time) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    const slotKey = `${date}_${time}`;
    
    if (bookings[slotKey]) {
        // Remove the booking
        bookings[slotKey] = bookings[slotKey].filter(b => b.id !== bookingId);
        
        // Clean up empty slots
        if (bookings[slotKey].length === 0) {
            delete bookings[slotKey];
        }
        
        // Save to localStorage
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Update UI
        generateTimeSlots(selectedDate);
        displayBookings();
        
        alert('Booking cancelled successfully!');
    }
}
