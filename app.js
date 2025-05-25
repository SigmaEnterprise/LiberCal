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

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      startEditing(idx);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      deleteEvent(idx);
    });
  });
}

function startEditing(idx) {
  const events = getEvents();
  const e = events[idx];

  eventForm.title.value = e.title;
  eventForm.date.value = e.date;
  eventForm.time.value = e.time;

  eventForm.querySelector('button').textContent = 'Update Event';

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

  if ('editIndex' in eventForm.dataset) {
    const idx = Number(eventForm.dataset.editIndex);
    events[idx] = { title, date, time };
    saveEvents(events);
    alert('Event updated!');
    clearEditing();
    renderEvents(events);
  } else {
    addEvent(title, date, time);
    alert('Event added!');
    eventForm.reset();
    renderEvents(getEvents());
  }
});

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
  monday.setHours(0, 0, 0, 0);
  monday.setDate(dateObj.getDate() + diffToMonday);

  const weekEnd = new Date(monday);
  weekEnd.setDate(monday.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const events = getEvents().filter(e => {
    const eDate = new Date(e.date);
    return eDate >= monday && eDate <= weekEnd;
  });
  renderEvents(events);
});

// On load, render all events
renderEvents(getEvents());

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then(() => {
      console.log('Service Worker registered');
    });
  });
}
