import { Download } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { reportApi } from '../api/endpoints.js';
import { useFetch } from '../hooks/useFetch.js';
import { currency, number } from '../lib/format.js';
import { PageHeader, Button, Card } from '../components/ui.jsx';
import { DataTable } from '../components/DataTable.jsx';

export default function Reports() {
  const { data: rows, loading } = useFetch(() => reportApi.reports(), []);

  const download = () => {
    const token = localStorage.getItem('transitops_token');
    fetch(reportApi.exportCsvUrl(), { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transitops-report.csv';
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const data = rows || [];
  const opCostData = data.map((r) => ({ name: r.registrationNumber, cost: r.operationalCost }));
  const effData = data.filter((r) => r.fuelEfficiency > 0).map((r) => ({ name: r.registrationNumber, kmpl: r.fuelEfficiency }));

  const columns = [
    { key: 'name', header: 'Vehicle', render: (r) => <span className="font-medium">{r.registrationNumber}</span> },
    { key: 'distanceTravelled', header: 'Distance (km)', render: (r) => number(r.distanceTravelled) },
    { key: 'litersConsumed', header: 'Fuel (L)', render: (r) => number(r.litersConsumed, 1) },
    { key: 'fuelEfficiency', header: 'km/L', render: (r) => number(r.fuelEfficiency, 2) },
    { key: 'operationalCost', header: 'Op cost', render: (r) => currency(r.operationalCost) },
    { key: 'revenue', header: 'Revenue', render: (r) => currency(r.revenue) },
    { key: 'roi', header: 'ROI', render: (r) => number(r.roi, 2) },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Efficiency, cost & ROI per vehicle">
        <Button variant="secondary" onClick={download}>
          <Download size={16} /> Export CSV
        </Button>
      </PageHeader>

      {loading && !rows ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Operational cost per vehicle</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={opCostData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <Tooltip formatter={(v) => currency(v)} />
                  <Bar dataKey="cost" fill="#2775CA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-medium text-ink mb-3">Fuel efficiency (km/L)</h3>
              {effData.length ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={effData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF0F3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                    <Tooltip formatter={(v) => `${v} km/L`} />
                    <Line type="monotone" dataKey="kmpl" stroke="#0F6E56" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted py-16 text-center">No completed trips with fuel data yet.</p>
              )}
            </Card>
          </div>

          <DataTable columns={columns} rows={data} searchKeys={['name', 'registrationNumber']} emptyMessage="No report data yet." />
        </>
      )}
    </div>
  );
}
