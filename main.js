// public/js/main.js

document.getElementById('hotelSearchForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const destination = document.getElementById('destination').value;
    const checkInDate = document.getElementById('checkInDate').value;
    const checkOutDate = document.getElementById('checkOutDate').value;
    const minBudget = document.getElementById('minBudget').value;
    const maxBudget = document.getElementById('maxBudget').value;

    fetchHotels(destination, checkInDate, checkOutDate, minBudget, maxBudget);
});

function fetchHotels(destination, checkInDate, checkOutDate, minBudget, maxBudget) {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            const response = JSON.parse(this.responseText);
            const resultsContainer = document.getElementById('hotelResults');

            resultsContainer.innerHTML = '';

            // Check if response contains hotels
            if (response.hotels && response.hotels.length > 0) {
                response.hotels.forEach(hotel => {
                    const hotelDiv = document.createElement('div');
                    hotelDiv.innerHTML = `
                        <h3>${hotel.name}</h3>
                        <p>Price: ${hotel.price} INR per night</p>
                        <a href="${hotel.link}" target="_blank">View Details</a>
                    `;
                    resultsContainer.appendChild(hotelDiv);
                });
            } else {
                resultsContainer.innerHTML = '<p>No hotels found within the given budget.</p>';
            }
        }
    });

    // Construct the URL with parameters
    const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?destination=${destination}&checkin_date=${checkInDate}&checkout_date=${checkOutDate}&min_price=${minBudget}&max_price=${maxBudget}`;

    xhr.open('GET', url);
    xhr.setRequestHeader('x-rapidapi-key', 'your_api_key'); // Replace with your actual API key
    xhr.setRequestHeader('x-rapidapi-host', 'booking-com.p.rapidapi.com');

    xhr.send(null);
}
