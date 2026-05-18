import { createFileRoute } from "@tanstack/react-router";
import { getAllBuses, updateBusGPS, isSimulationActive, setSimulationState, resetBusesToDefault, getBusById } from "@/lib/gps-store";

export const Route = createFileRoute("/api/gps")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const busId = url.searchParams.get("busId");

        // If busId is supplied, return single bus details
        if (busId) {
          const bus = getBusById(busId);
          if (!bus) {
            return new Response(JSON.stringify({ error: `Bus with ID ${busId} not found` }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ success: true, bus }), {
            headers: { "Content-Type": "application/json" },
          });
        }

        // Otherwise, return all active buses
        return new Response(
          JSON.stringify({
            success: true,
            simulationActive: isSimulationActive(),
            count: getAllBuses().length,
            buses: getAllBuses(),
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      },
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as {
            action?: "update" | "simulate" | "reset";
            busId?: string;
            progress?: number;
            speed?: number;
            status?: "on-time" | "delayed" | "boarding";
            active?: boolean;
          };

          const { action } = body;

          if (action === "simulate") {
            const active = typeof body.active === "boolean" ? body.active : true;
            setSimulationState(active);
            return new Response(JSON.stringify({ success: true, simulationActive: active }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          if (action === "reset") {
            resetBusesToDefault();
            return new Response(JSON.stringify({ success: true, message: "Buses reset to default positions" }), {
              headers: { "Content-Type": "application/json" },
            });
          }

          // Default action is update GPS coordinates
          if (!body.busId || typeof body.progress !== "number") {
            return new Response(
              JSON.stringify({ error: "Missing required fields: busId and progress (0.0 to 1.0)" }),
              {
                status: 400,
                headers: { "Content-Type": "application/json" },
              }
            );
          }

          const ok = updateBusGPS(body.busId, body.progress, body.speed, body.status);
          if (!ok) {
            return new Response(JSON.stringify({ error: `Bus with ID ${body.busId} not found` }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify({ success: true, message: "GPS position updated successfully" }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: "Invalid JSON body payload" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
