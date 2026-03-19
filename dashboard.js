// ─── DASHBOARD.JS ────────────────────────────────────
// Handles: job tracker, save/edit/delete jobs, stats

// Load all jobs for current user from Supabase
async function loadJobs() {
  const { data, error } = await sb
    .from('jobs')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    jobs = data;
    renderDashboard();
  }
}

// Save a new job to Supabase
async function saveJob() {
  const company = document.getElementById('a-company').value.trim();
  const title   = document.getElementById('a-title').value.trim();

  if (!company || !title) {
    document.getElementById('a-status').textContent = '⚠ Add company & title first';
    return;
  }

  const job = {
    user_id:  currentUser.id,
    company,
    title,
    type:     document.getElementById('a-type').value,
    location: document.getElementById('a-location').value || 'Remote',
    status:   'Saved',
    date:     new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    jd:       document.getElementById('a-jd').value
  };

  const { data, error } = await sb.from('jobs').insert(job).select().single();

  if (error) {
    document.getElementById('a-status').textContent = '⚠ Error: ' + error.message;
    return;
  }

  jobs.unshift(data);
  document.getElementById('a-status').textContent = '✓ Saved to tracker!';
  setTimeout(() => document.getElementById('a-status').textContent = '', 2500);
}

// Update job status (from dropdown in table)
async function updateStatus(id, status) {
  await sb.from('jobs').update({ status }).eq('id', id).eq('user_id', currentUser.id);
  const j = jobs.find(x => x.id === id);
  if (j) j.status = status;
  renderDashboard();
}

// Delete a job
async function deleteJob(id) {
  if (!confirm('Remove this job from tracker?')) return;
  await sb.from('jobs').delete().eq('id', id).eq('user_id', currentUser.id);
  jobs = jobs.filter(x => x.id !== id);
  renderDashboard();
}

// Open the edit modal and populate fields
function openEdit(id) {
  const j = jobs.find(x => x.id === id);
  if (!j) return;

  document.getElementById('edit-id').value       = id;
  document.getElementById('edit-company').value  = j.company;
  document.getElementById('edit-title').value    = j.title;
  document.getElementById('edit-location').value = j.location || '';
  document.getElementById('edit-type').value     = j.type;
  document.getElementById('edit-status').value   = j.status;
  document.getElementById('edit-notes').value    = j.notes || '';

  document.getElementById('edit-modal').style.display = 'flex';
}

// Save edited job back to Supabase
async function saveEdit() {
  const id = +document.getElementById('edit-id').value;

  const updates = {
    company:  document.getElementById('edit-company').value.trim(),
    title:    document.getElementById('edit-title').value.trim(),
    location: document.getElementById('edit-location').value.trim(),
    type:     document.getElementById('edit-type').value,
    status:   document.getElementById('edit-status').value,
    notes:    document.getElementById('edit-notes').value.trim()
  };

  await sb.from('jobs').update(updates).eq('id', id).eq('user_id', currentUser.id);

  const j = jobs.find(x => x.id === id);
  if (j) Object.assign(j, updates);

  closeEdit();
  renderDashboard();
}

// Close the edit modal
function closeEdit() {
  document.getElementById('edit-modal').style.display = 'none';
}

// Return color based on status
function statusColor(s) {
  if (s === 'Applied')   return 'var(--accent)';
  if (s === 'Interview') return 'var(--amber)';
  if (s === 'Offer')     return 'var(--green)';
  if (s === 'Rejected')  return 'var(--accent2)';
  return 'var(--muted)';
}

// Render the full dashboard (stats + table)
function renderDashboard() {
  const statusFilter = document.getElementById('filter-status').value;
  const typeFilter   = document.getElementById('filter-type').value;

  const filtered = jobs.filter(j => {
    if (statusFilter && j.status !== statusFilter) return false;
    if (typeFilter   && j.type   !== typeFilter)   return false;
    return true;
  });

  // Update stat cards
  document.getElementById('s-total').textContent    = jobs.length;
  document.getElementById('s-applied').textContent  = jobs.filter(j => j.status === 'Applied').length;
  document.getElementById('s-interview').textContent = jobs.filter(j => j.status === 'Interview').length;
  document.getElementById('s-offer').textContent    = jobs.filter(j => j.status === 'Offer').length;
  document.getElementById('s-rejected').textContent = jobs.filter(j => j.status === 'Rejected').length;

  const list = document.getElementById('job-list');

  if (!filtered.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">◎</div>
        <div>No jobs tracked yet</div>
        <div style="font-size:12px;margin-top:6px">Analyze a job and click "Save to Tracker"</div>
      </div>`;
    return;
  }

  list.innerHTML = `
    <table class="job-table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Role</th>
          <th>Type</th>
          <th>Status</th>
          <th>Date</th>
          <th>Notes</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(j => `
          <tr>
            <td>
              <div class="job-company">${j.company}</div>
              <div class="job-role">${j.location || ''}</div>
            </td>
            <td style="font-size:13px">${j.title}</td>
            <td>
              ${j.type === 'Internship'
                ? '<span class="badge badge-internship">Internship</span>'
                : `<span style="font-size:12px;color:var(--muted)">${j.type}</span>`}
            </td>
            <td>
              <select
                onchange="updateStatus(${j.id}, this.value)"
                style="width:auto;padding:4px 8px;font-size:12px;border-radius:20px;color:${statusColor(j.status)}">
                ${['Saved','Applied','Interview','Offer','Rejected']
                  .map(s => `<option ${j.status === s ? 'selected' : ''}>${s}</option>`)
                  .join('')}
              </select>
            </td>
            <td style="font-size:12px;color:var(--muted)">${j.date || ''}</td>
            <td style="font-size:12px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
              ${j.notes || '—'}
            </td>
            <td style="display:flex;gap:6px">
              <button class="btn btn-secondary btn-sm" onclick="openEdit(${j.id})" title="Edit">✎</button>
              <button class="btn btn-danger btn-sm" onclick="deleteJob(${j.id})" title="Delete">✕</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}
