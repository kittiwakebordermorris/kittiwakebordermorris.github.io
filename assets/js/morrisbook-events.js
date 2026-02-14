/*	Morris Book JavaScript for Kittiwake Border Morris	*/

const apiUrl = "https://morrisbook.co.uk/api/v1/events?token=QyPD58QmuJvQefgGbL4Jhwmzn6tdkwzz&from=today&status=1";

// ==============================
// MorrisBook Events Loader
// Kittiwake Border Morris
// ==============================

const MORRISBOOK_API_TOKEN = "QyPD58QmuJvQefgGbL4Jhwmzn6tdkwzz";
const MORRISBOOK_API_URL = "https://morrisbook.co.uk/api/events";
// const MORRISBOOK_API_URL = "https://morrisbook.co.uk/api/v1/events";

// ==============================
// Fetch Events
// ==============================

async function fetchMorrisBookEvents() {
    try {
        const response = await fetch(`${MORRISBOOK_API_URL}?token=${MORRISBOOK_API_TOKEN}`);
        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error("Error fetching MorrisBook events:", error);
        return [];
    }
}

// ==============================
// Main Loader Function
// ==============================

async function loadMorrisBookEvents(options) {

    const {
        containerId,
        type = "future",        // "future" | "past"
        limit = "all",          // number or "all"
        status = "confirmed"    // event status filter
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "<p>Loading events...</p>";

    let events = await fetchMorrisBookEvents();

    const now = new Date();

    // Filter by status
    events = events.filter(event => 
        event.status && event.status.toLowerCase() === status.toLowerCase()
    );

    // Convert event date
    events.forEach(event => {
        event._eventDate = new Date(event.startdate);
    });

    // Filter future / past
    if (type === "future") {
        events = events.filter(event => event._eventDate >= now);
        events.sort((a, b) => a._eventDate - b._eventDate);
    }

    if (type === "past") {
        events = events.filter(event => event._eventDate < now);
        events.sort((a, b) => b._eventDate - a._eventDate);
    }

    // Apply limit
    if (limit !== "all") {
        events = events.slice(0, limit);
    }

    if (events.length === 0) {
        container.innerHTML = "<p>No events found.</p>";
        return;
    }

    container.innerHTML = "";

    events.forEach((event, index) => {

        const eventDiv = document.createElement("div");
        eventDiv.className = "mbevent";
        eventDiv.id = `mbevent-${containerId}-${index}`;

        const eventDate = event._eventDate.toLocaleDateString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        eventDiv.innerHTML = `
            <div class="mbevent-date">${eventDate}</div>
            <div class="mbevent-title">${event.name}</div>
            <div class="mbevent-location">${event.location || ""}</div>
            <div class="mbevent-description">${event.description || ""}</div>
        `;

        container.appendChild(eventDiv);
    });
}
