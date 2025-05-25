const eventForm = document.getElementById('event-form');
const eventsList = document.getElementById('events-list');
const viewDateInput = document.getElementById('view-date');
const viewDayBtn = document.getElementById('view-day-btn');
const viewWeekBtn = document.getElementById('view-week-btn');

function getEvents() {
  return JSON.parse(localStorage.getItem('events') || '[]');
}

function saveEvents(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

function addEvent(title, date, time) {
  const events = getEvents();
  events.push({ title, date, time });
  saveEvents(events);
}

function clearEventsList() {
  eventsList.innerHTML = '';
}

// ... previous code ...

function renderEvents(events) {
  clearEventsList();
  if (events.length === 0) {
    eventsList.innerHTML = '<p>No events found.</p>';
    return;
  }
  events.sort((a, b) => {
    if (a.date === b.date) return a.time.localeCompare(b.time);
    return a.date.localeCompare(b.date);
  });
  events.forEach((e, idx) => {
    const div = document.createElement('div');
    div.className = 'event-item';

    div.innerHTML = `
      <strong>${e.date} ${e.time}</strong> - ${e.title} 
      <button class="edit-btn" data-index="${idx}">Edit</button>
      <button class="delete-btn" data-index="${idx}">Delete</button>
    `;
    eventsList.appendChild(div);
  });

  // Attach event listeners for buttons after rendering
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-index');
      startEditing(idx);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = btn.getAttribute('data-index');
      deleteEvent(idx);
    });
  });
}

function startEditing(idx) {
  const events = getEvents();
  const e = events[idx];

  // Fill form with existing data
  eventForm.title.value = e.title;
  eventForm.date.value = e.date;
  eventForm.time.value = e.time;

  // Change form button text
  eventForm.querySelector('button').textContent = 'Update Event';

  // Add editing index
  eventForm.dataset.editIndex = idx;
}

function deleteEvent(idx) {
  if (!confirm('Delete this event?')) return;
  const events = getEvents();
  events.splice(idx, 1);
  saveEvents(events);
  alert('Event deleted!');
  clearEditing();
  renderEvents(events);
}

function clearEditing() {
  delete eventForm.dataset.editIndex;
  eventForm.reset();
  eventForm.querySelector('button').textContent = 'Add Event';
}

// Update form submit event to handle add/edit
eventForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = eventForm.title.value.trim();
  const date = eventForm.date.value;
  const time = eventForm.time.value;
  if (!title || !date || !time) {
    alert('Please fill all fields.');
    return;
  }

  const events = getEvents();

  if (eventForm.dataset.editIndex !== undefined) {
    // Update existing event
    const idx = eventForm.dataset.editIndex;
    events[idx] = { title, date, time };
    saveEvents(events);
    alert('Event updated!');
    clearEditing();
    renderEvents(events);
  } else {
    // Add new event
    addEvent(title, date, time);
    alert('Event added!');
    eventForm.reset();
  }
});

// When viewing day/week, clear any editing state
viewDayBtn.addEventListener('click', () => {
  clearEditing();
  const date = viewDateInput.value;
  if (!date) {
    alert('Please select a date.');
    return;
  }
  const events = getEvents().filter(e => e.date === date);
  renderEvents(events);
});

viewWeekBtn.addEventListener('click', () => {
  clearEditing();
  const selectedDate = viewDateInput.value;
  if (!selectedDate) {
    alert('Please select a date.');
    return;
  }
  const dateObj = new Date(selectedDate);
  const day = dateObj.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(dateObj);
  monday.setDate(dateObj.getDate() + diffToMonday);

  const events = getEvents().filter(e => {
    const eDate = new Date(e.date);
    return eDate >= monday && eDate <= new Date(monday.getTime() + 6 * 86400000);
  });
  renderEvents(events);
});


viewWeekBtn.addEventListener('click', () => {
  const selectedDate = viewDateInput.value;
  if (!selectedDate) {
    alert('Please select a date.');
    return;
  }
  const dateObj = new Date(selectedDate);
  const day = dateObj.getDay();
  // Get Monday of current week (Sunday = 0, Monday = 1)
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(dateObj);
  monday.setDate(dateObj.getDate() + diffToMonday);

  const events = getEvents().filter(e => {
    const eDate = new Date(e.date);
    return eDate >= monday && eDate <= new Date(monday.getTime() + 6 * 86400000);
  });
  renderEvents(events);
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker registered');
    });
  });
}
