# Appointment Booking Calendar

A static website for booking appointments with a beautiful white and gold design.

## Features

- 📅 **Date Selection**: Choose any date from today onwards
- ⏰ **Time Slots**: 9 hourly slots from 9:00 AM to 5:00 PM
- 👥 **Capacity Management**: Maximum 4 customers per time slot
- 🚫 **Full Slot Prevention**: Cannot book when slot is full
- ✅ **Real-time Availability**: See available spots for each time slot
- 💾 **Local Storage**: Bookings persist in browser
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **White & Gold Theme**: Clean white background with gold (#FFD700) accents

## How to Use

1. Open `index.html` in your web browser
2. Select a date using the date picker
3. Click on an available time slot (shows number of spots left)
4. Fill in your information:
   - Name
   - Email
   - Phone number
5. Click "Book Appointment" to confirm
6. Your booking will appear in the "Your Bookings" section
7. You can cancel bookings by clicking the "Cancel" button

## Technical Details

- **Frontend Only**: Pure HTML, CSS, and JavaScript - no server required
- **Storage**: Uses browser's localStorage for data persistence
- **Security**: XSS-protected with proper DOM manipulation
- **Notifications**: Custom gold-themed notifications instead of alerts

## Files

- `index.html` - Main page structure
- `styles.css` - Styling with white background and gold theme
- `script.js` - Booking logic and slot management

## Opening the Site

Simply open `index.html` in any modern web browser. No installation or server setup required!