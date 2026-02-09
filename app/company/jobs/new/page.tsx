"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function CompanyJobNewPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [notes, setNotes] = useState("");

  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }
      setCompanyId(auth.user.id);

      const { data: prof } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", auth.user.id)
        .single();

      if ((prof?.user_type ?? "") !== "company") {
        window.location.href = "/dashboard";
        return;
      }

      setLoading(false);
    })();
  }, []);

  async function createJob() {
    if (!companyId) return;
    setError(null);

    if (!title.trim()) return setError("Inserisci un titolo.");
    if (!city.trim()) return setError("Inserisci una città.");
    if (!date) return setError("Inserisci una data.");

    setSaving(true);

    const rate = hourlyRate.trim() ? Number(hourlyRate.trim()) : null;
    if (hourlyRate.trim() && Number.isNaN(rate)) {
      setSaving(false);
      setError("Paga oraria non valida.");
      return;
    }

    const { error } = await supabase.from("jobs").insert({
      company_id: companyId,
      title: title.trim(),
      city: city.trim() || null,
      address: address.trim() || null,
      date: date || null,
      start_time: startTime || null,
      end_time: endTime || null,
      hourly_rate: rate,
      notes: notes.trim() || null,
      status: "open",
    });

    if (error) {
      setSaving(false);
      setError(error.message);
      return;
    }

    setSaving(false);
    window.location.href = "/company/jobs";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Crea job</h2>

      {error && (
        <div className="small" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}

      <label>Titolo *</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Città *</label>
      <input value={city} onChange={(e) => setCity(e.target.value)} />

      <label>Indirizzo</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />

      <label>Data *</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label>Ora inizio</label>
      <input value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="es. 09:00" />

      <label>Ora fine</label>
      <input value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="es. 13:00" />

      <label>Paga oraria (€/h)</label>
      <input value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} placeholder="es. 12" />

      <label>Note</label>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button onClick={() => (window.location.href = "/company/jobs")}>Annulla</button>
        <button onClick={createJob} disabled={saving}>
          {saving ? "Creo..." : "Crea job"}
        </button>
      </div>
    </div>
  );
}
