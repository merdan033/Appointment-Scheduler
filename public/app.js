// State
let appointments = [];
let currentAppointmentId = null;

// DOM Elements
const appointmentsContainer = document.getElementById('appointmentsContainer');
const emptyState = document.getElementById('emptyState');
const modal = document.getElementById('appointmentModal');
const modalTitle = document.getElementById('modalTitle');
const appointmentForm = document.getElementById('appointmentForm');
const newAppointmentBtn = document.getElementById('newAppointmentBtn');
const closeModalBtn = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const filterStatus = document.getElementById('filterStatus');
const filterDoctor = document.getElementById('filterDoctor');
const filterDate = document.getElementById('filterDate');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchAppointments();
  attachEventListeners();
});

// Event Listeners
function attachEventListeners() {
  newAppointmentBtn.addEventListener('click', openNewAppointmentModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  appointmentForm.addEventListener('submit', handleFormSubmit);
  filterStatus.addEventListener('change', applyFilters);
  filterDoctor.addEventListener('input', debounce(applyFilters, 300));
  filterDate.addEventListener('change', applyFilters);
  clearFiltersBtn.addEventListener('click', clearFilters);
  
  // Close modal on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}

// API Functions
async function fetchAppointments(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.doctorName) params.append('doctorName', filters.doctorName);
    if (filters.date) params.append('date', filters.date);

    const url = `/api/appointments${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      appointments = data.data;
      renderAppointments();
    } else {
      showError('Failed to fetch appointments');
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    showError('Error loading appointments');
  }
}

async function createAppointment(appointmentData) {
  try {
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (data.success) {
      await fetchAppointments();
      closeModal();
      showSuccess('Appointment created successfully');
    } else {
      showError(data.error || 'Failed to create appointment');
    }
  } catch (error) {
    console.error('Error creating appointment:', error);
    showError('Error creating appointment');
  }
}

async function updateAppointment(id, appointmentData) {
  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (data.success) {
      await fetchAppointments();
      closeModal();
      showSuccess('Appointment updated successfully');
    } else {
      showError(data.error || 'Failed to update appointment');
    }
  } catch (error) {
    console.error('Error updating appointment:', error);
    showError('Error updating appointment');
  }
}

async function deleteAppointment(id) {
  if (!confirm('Are you sure you want to delete this appointment?')) {
    return;
  }

  try {
    const response = await fetch(`/api/appointments/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (data.success) {
      await fetchAppointments();
      showSuccess('Appointment deleted successfully');
    } else {
      showError(data.error || 'Failed to delete appointment');
    }
  } catch (error) {
    console.error('Error deleting appointment:', error);
    showError('Error deleting appointment');
  }
}

// Render Functions
function renderAppointments() {
  if (appointments.length === 0) {
    emptyState.style.display = 'block';
    appointmentsContainer.innerHTML = '';
    appointmentsContainer.appendChild(emptyState);
    return;
  }

  emptyState.style.display = 'none';
  appointmentsContainer.innerHTML = '';

  appointments.forEach(appointment => {
    const card = createAppointmentCard(appointment);
    appointmentsContainer.appendChild(card);
  });
}

function createAppointmentCard(appointment) {
  const card = document.createElement('div');
  card.className = 'appointment-card';
  card.dataset.id = appointment._id;

  const formattedDate = formatDate(appointment.appointmentDate);
  
  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(appointment.patientName)}</h3>
      <span class="status-badge status-${appointment.status}">${appointment.status}</span>
    </div>
    
    <div class="card-body">
      <div class="card-info">
        <span class="label">Doctor:</span>
        <span class="value">${escapeHtml(appointment.doctorName)}</span>
      </div>
      
      <div class="card-info">
        <span class="label">Date:</span>
        <span class="value">${formattedDate} at ${appointment.appointmentTime}</span>
      </div>
      
      <div class="card-info">
        <span class="label">Email:</span>
        <span class="value">${escapeHtml(appointment.patientEmail)}</span>
      </div>
      
      <div class="card-info">
        <span class="label">Phone:</span>
        <span class="value">${escapeHtml(appointment.patientPhone)}</span>
      </div>
      
      <div class="card-info">
        <span class="label">Reason:</span>
        <span class="value">${escapeHtml(appointment.reason)}</span>
      </div>
      
      ${appointment.notes ? `
        <div class="card-info">
          <span class="label">Notes:</span>
          <span class="value">${escapeHtml(appointment.notes)}</span>
        </div>
      ` : ''}
    </div>
    
    <div class="card-footer">
      <button class="btn btn-sm btn-secondary edit-btn" data-id="${appointment._id}">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn" data-id="${appointment._id}">Delete</button>
    </div>
  `;

  // Attach event listeners to buttons
  card.querySelector('.edit-btn').addEventListener('click', () => openEditModal(appointment));
  card.querySelector('.delete-btn').addEventListener('click', () => deleteAppointment(appointment._id));

  return card;
}

// Modal Functions
function openNewAppointmentModal() {
  currentAppointmentId = null;
  modalTitle.textContent = 'New Appointment';
  appointmentForm.reset();
  document.getElementById('status').value = 'scheduled';
  modal.classList.add('active');
}

function openEditModal(appointment) {
  currentAppointmentId = appointment._id;
  modalTitle.textContent = 'Edit Appointment';
  
  // Populate form
  document.getElementById('patientName').value = appointment.patientName;
  document.getElementById('patientEmail').value = appointment.patientEmail;
  document.getElementById('patientPhone').value = appointment.patientPhone;
  document.getElementById('doctorName').value = appointment.doctorName;
  document.getElementById('appointmentDate').value = formatDateForInput(appointment.appointmentDate);
  document.getElementById('appointmentTime').value = appointment.appointmentTime;
  document.getElementById('reason').value = appointment.reason;
  document.getElementById('status').value = appointment.status;
  document.getElementById('notes').value = appointment.notes || '';
  
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  appointmentForm.reset();
  currentAppointmentId = null;
}

// Form Handling
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(appointmentForm);
  const appointmentData = {
    patientName: formData.get('patientName'),
    patientEmail: formData.get('patientEmail'),
    patientPhone: formData.get('patientPhone'),
    doctorName: formData.get('doctorName'),
    appointmentDate: formData.get('appointmentDate'),
    appointmentTime: formData.get('appointmentTime'),
    reason: formData.get('reason'),
    status: formData.get('status'),
    notes: formData.get('notes'),
  };

  if (currentAppointmentId) {
    await updateAppointment(currentAppointmentId, appointmentData);
  } else {
    await createAppointment(appointmentData);
  }
}

// Filter Functions
function applyFilters() {
  const filters = {
    status: filterStatus.value,
    doctorName: filterDoctor.value,
    date: filterDate.value,
  };

  fetchAppointments(filters);
}

function clearFilters() {
  filterStatus.value = '';
  filterDoctor.value = '';
  filterDate.value = '';
  fetchAppointments();
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateForInput(dateString) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function showSuccess(message) {
  alert(message); // In a real app, use a toast notification library
}

function showError(message) {
  alert('Error: ' + message); // In a real app, use a toast notification library
}

