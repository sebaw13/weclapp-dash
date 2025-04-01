"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  number: string;
  fullName: string;
  email: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/weclapp/customers");

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "Unknown error");
          return;
        }

        const json = await res.json();
        setRawResponse(json); // 👈 komplettes JSON speichern
        setCustomers(json.result || []);
      } catch (e) {
        setError("Netzwerkfehler oder ungültige Antwort");
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Weclapp Kunden</h1>

      {error && <p className="text-red-500">Fehler: {error}</p>}
      {!customers && !error && <p>Lade Daten...</p>}

      {customers && customers.length > 0 ? (
        <ul className="space-y-2 mt-4">
          {customers.map((c) => (
            <li key={c.id} className="border rounded p-3 text-sm">
              <strong>{c.fullName}</strong> ({c.number})<br />
              {c.email}
            </li>
          ))}
        </ul>
      ) : customers?.length === 0 ? (
        <p>Keine Kunden gefunden.</p>
      ) : null}

      {rawResponse && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">API Response (Debug)</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
