"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CompanyOnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [vat, setVat] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [cap, setCap] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      const { data: prof, error } = await supabase
        .from("profiles")
        .select("id,user_type,company_name,company_vat,company_phone,company_address,company_data")
        .eq("id", data.user.id)
        .single();

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      const t = prof?.user_type ?? null;
      if (t !== "company") {
        window.location.href = "/profile";
        return;
      }

      setCompanyName(prof?.company_name ?? "");
      setVat(prof?.company_vat ?? "");
      setPhone(prof?.company_phone ?? "");
      setAddress(prof?.company_address ?? "");

      const cd = (prof as any)?.company_data || {};
      setCity(cd.city ?? "");
      setProvince(cd.province ?? "");
      setCap(cd.cap ?? "");

      setLoading(false);
    })();
  }, []);

  async function save() {
    setErr(null);
    setSaving(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const company_data = {
      city,
      province,
      cap,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        company_name: companyName,
        company_vat: vat,
        company_phone: phone,
        company_address: address,
        company_data,
        profile_status: "complete",
        onboarding_step: 3,
      })
      .eq("id", user.id);

    if (error) {
      setErr(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    window.location.href = "/company";
  }

  if (loading) return <div>Caricamento...</div>;

  return (
    <div className="card">
      <h2>Onboarding Azienda</h2>

      {err && (
        <div className="small" style={{ marginTop: 10 }}>
          {err}
        </div>
      )}

      <label>Ragione sociale</label>
      <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />

      <label>Partita IVA</label>
      <input value={vat} onChange={(e) => setVat(e.target.value)} />

      <label>Telefono</label>
      <input value={phone} onChange={(e) => setPhone(e.target.value)} />

      <label>Indirizzo (via, civico)</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />

      <label>Città</label>
      <input value={city} onChange={(e) => setCity(e.target.value)} />

      <label>Provincia</label>
      <input value={province} onChange={(e) => setProvince(e.target.value)} />

      <label>CAP</label>
      <input value={cap} onChange={(e) => setCap(e.target.value)} />

      <button
        onClick={save}
        disabled={saving || !companyName.trim() || !vat.trim()}
        style={{ marginTop: 12 }}
      >
        {saving ? "Salvo..." : "Completa e vai all’area azienda"}
      </button>

      <div className="small" style={{ marginTop: 10 }}>
        (MVP: chiediamo subito i dati essenziali, poi aggiungiamo gli altri.)
      </div>
    </div>
  );
}
