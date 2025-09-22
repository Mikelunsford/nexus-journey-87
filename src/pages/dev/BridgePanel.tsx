import React from "react";
import { ulid } from "@/lib/ids";
import PageSection from "@/components/layout/PageSection";
import { EventV1, EventType } from "@/lib/events";

const targetsList = ["toInternal", "toProduction", "toSnR", "toCustomer"] as const;
type Target = typeof targetsList[number];

export default function BridgePanel() {
  const [targets, setTargets] = React.useState<Target[]>(["toInternal"]);
  const [outgoing, setOutgoing] = React.useState<EventV1[]>([]);
  const [incoming, setIncoming] = React.useState<EventV1[]>([]);
  const dedupe = React.useRef<Set<string>>(new Set());

  const emit = (type: EventType) => {
    const ev: EventV1 = {
      version: "1",
      id: ulid(),
      ts: new Date().toISOString(),
      type,
      source: "portal.web",
      targets: [...targets],
      actor: { role: "developer" as any },
      org: { id: ulid(), name: "Demo Org" },
      data: sample(type),
      meta: { trace_id: ulid(), env: "demo" }
    };
    if (dedupe.current.has(ev.id)) return;
    dedupe.current.add(ev.id);
    setOutgoing(o => [ev, ...o].slice(0, 200));
  };

  const copyLast = async () => {
    if (!outgoing[0]) return;
    await navigator.clipboard.writeText(JSON.stringify(outgoing[0], null, 2));
  };

  const simulateReceive = (json: string) => {
    try {
      const ev = JSON.parse(json) as EventV1;
      if (dedupe.current.has(ev.id)) return;
      dedupe.current.add(ev.id);
      setIncoming(i => [ev, ...i].slice(0, 200));
    } catch {}
  };

  return (
    <PageSection title="Bridge Panel" subtitle="Dev event feed and simulator.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: controls + outgoing */}
        <div className="space-y-4">
          <div className="card-surface panel panel-body">
            <div className="t-dim mb-2">Targets</div>
            <div className="flex flex-wrap gap-2">
              {targetsList.map(t => {
                const active = targets.includes(t);
                return (
                  <button 
                    key={t} 
                    onClick={() =>
                      setTargets(s => active ? s.filter(x => x !== t) : [...s, t])
                    }
                    className={active
                      ? "px-3 py-1 rounded-pill bg-t1-blue/20 t1-blue"
                      : "px-3 py-1 rounded-pill qa-item"}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(["quote.submitted", "quote.sent", "production.qty_reported", "shipment.delivered", "labor.entry_created"] as EventType[])
               .map(t => (
                 <button 
                   key={t} 
                   onClick={() => emit(t)} 
                   className="qa-item px-3 py-2 text-sm"
                 >
                   {t}
                 </button>
               ))}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={copyLast} className="qa-item px-3 py-2 text-sm">
                Copy Last JSON
              </button>
              <button 
                onClick={() => { 
                  setOutgoing([]); 
                  setIncoming([]); 
                  dedupe.current.clear(); 
                }} 
                className="qa-item px-3 py-2 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="card-surface panel panel-body">
            <div className="font-medium mb-2">Outgoing Feed</div>
            <pre className="max-h-64 overflow-auto text-xs t-dim">
              {JSON.stringify(outgoing, null, 2)}
            </pre>
          </div>
        </div>
        {/* Right: incoming */}
        <div className="space-y-4">
          <div className="card-surface panel panel-body">
            <div className="font-medium mb-2">Simulate Receive</div>
            <textarea className="w-full h-32 qa-item p-3" id="rx"></textarea>
            <div className="mt-2">
              <button 
                className="qa-item px-3 py-2 text-sm" 
                onClick={() => {
                  const el = document.getElementById("rx") as HTMLTextAreaElement;
                  simulateReceive(el.value);
                  el.value = "";
                }}
              >
                Append
              </button>
            </div>
          </div>
          <div className="card-surface panel panel-body">
            <div className="font-medium mb-2">Incoming Feed</div>
            <pre className="max-h-64 overflow-auto text-xs t-dim">
              {JSON.stringify(incoming, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </PageSection>
  );
}

function sample(type: EventType) {
  switch (type) {
    case "quote.submitted": 
      return { quoteId: ulid(), customer: "ACME", amount: 12000 };
    case "quote.sent": 
      return { quoteId: ulid(), channel: "email" };
    case "production.qty_reported": 
      return { workOrderId: ulid(), qty: 25, uom: "ea" };
    case "shipment.delivered": 
      return { shipmentId: ulid(), deliveredAt: new Date().toISOString() };
    case "labor.entry_created": 
      return { userId: ulid(), minutes: 90, projectId: ulid() };
  }
}