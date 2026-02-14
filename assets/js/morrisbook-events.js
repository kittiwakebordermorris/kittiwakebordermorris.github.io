// ======================================
// MorrisBook Events Loader
// Kittiwake Border Morris
// ======================================

const MORRISBOOK_API_TOKEN = "QyPD58QmuJvQefgGbL4Jhwmzn6tdkwzz";
const MORRISBOOK_BASE_URL = "https://morrisbook.co.uk/api/v1/events";

// ======================================
// Fetch Events From MorrisBook
// ======================================

async function fetchMorrisBookEvents(params = "") {
    try {
        const response = await fetch(
            `${MORRISBOOK_BASE_URL}?token=${MORRISBOOK_API_TOKEN}${params}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("MorrisBook API error:", error);
        return [];
    }
}

// ======================================
// Main Loader Function
// ======================================

async function loadMorrisBookEvents(options) {

    const {
        containerId,
        type = "future",      // "future" | "past"
        limit = "all",        // number or "all"
        status = 1            // numeric status (1 = confirmed)
    } = options;

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "<p>Loading events...</p>";

    let query = "";

    if (type === "future") {
        query += `&from=today`;
    }

    if (status !== undefined) {
        query += `&status=${status}`;
    }

    let events = await fetchMorrisBookEvents(query);

    const today = new Date();
    today.setHours(0,0,0,0);

    // Filter past events manually (API doesn't support "before today")
    if (type === "past") {
        events = events.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate < today;
        });

        // Sort newest first for past events
        events.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
    }

    if (type === "future") {
        events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
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

        const eventDateObj = new Date(event.start_date);

		// ======================================
		// START - Format Dates
		// ======================================

		function formatDisplayDate(dateStr) {
			if (!dateStr) return "";
			const d = new Date(dateStr);
			return d.toLocaleDateString("en-GB", {
				weekday: "long",
				day: "numeric",
				month: "long",
				year: "numeric"
			});
		}

		function formatDisplayTime(timeStr) {
			if (!timeStr) return "";
			return timeStr.substring(0,5); // 15:00:00 → 15:00
		}

		const startDateFormatted = formatDisplayDate(event.start_date);
		const endDateFormatted = formatDisplayDate(event.end_date);

		let dateLine = startDateFormatted;

		if (event.end_date && event.end_date !== event.start_date) {
			dateLine += " - " + endDateFormatted;
		}
		// ======================================
		// START - Format Dates
		// ======================================


		// ======================================
		// START - Format Times
		// ======================================

		const startTimeFormatted = formatDisplayTime(event.start_time);
		const endTimeFormatted = formatDisplayTime(event.end_time);

		let timeLine = "";

		if (startTimeFormatted && endTimeFormatted) {
			timeLine = `${startTimeFormatted} - ${endTimeFormatted}`;
		} 
		else if (startTimeFormatted) {
			timeLine = startTimeFormatted;
		}

		// ======================================
		// END - Format Times
		// ======================================


        const eventDiv = document.createElement("div");
        eventDiv.className = "mbevent";

		// ======================================
		// START # Build Unique Event ID
		// ======================================

		function formatDate(dateStr) {
			if (!dateStr) return "";
			return dateStr.replace(/-/g, ""); // 2024-05-10 → 20240510
		}

		function formatTime(timeStr) {
			if (!timeStr) return "";
			return timeStr.substring(0,5).replace(":", ""); // 10:30:00 → 1030
		}

		const startDate = formatDate(event.start_date);
		const endDate = formatDate(event.end_date);
		const startTime = formatTime(event.start_time);
		const endTime = formatTime(event.end_time);

		let eventId = type + "-event_" + startDate;

		// Add start time if present
		if (startTime) {
			eventId += "." + startTime;
		}

		// If there is an end date AND it differs from start date
		if (endDate && endDate !== startDate) {

			eventId += "_" + endDate;

			if (endTime) {
				eventId += "." + endTime;
			}

		} else {

			// No end date (single day event)
			// But if there is an end time, add it
			if (endTime) {
				eventId += "_" + endTime;
			}
		}

		eventDiv.id = eventId;

		// ======================================
		// END # Build Unique Event ID
		// ======================================

		eventDiv.innerHTML = `
		<div class="mbevent-date">${dateLine}</div>
			${timeLine ? `<div class="mbevent-time">${timeLine}</div>` : ""}
			<div class="mbevent-title">${event.name}</div>
			${event.location ? `<div class="mbevent-location">${event.location}</div>` : ""}
			${event.description ? `<div class="mbevent-description">${event.description}</div>` : ""}
		`;

        container.appendChild(eventDiv);
    });
}
