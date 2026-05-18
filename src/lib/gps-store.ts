import { BUSES, type Bus } from "./mock-data";

// In-memory store for real-time GPS locations and active bus data.
// Initialize with default mock data.
let activeBuses: Bus[] = [...BUSES];
let simulationEnabled = true;

// Active coordinates of stops for interpolation or simulation.
export const STOP_COORDINATES: Record<string, { x: number; y: number }> = {
  "Downtown": { x: 50, y: 50 },
  "Nyabugogo": { x: 10, y: 80 },
  "Kimironko": { x: 92, y: 22 },
  "Remera": { x: 12, y: 22 },
  "Airport": { x: 88, y: 90 },
  "Nyamirambo": { x: 92, y: 50 },
};

// Simulation loop that updates progress / locations of buses periodically.
if (typeof globalThis !== "undefined") {
  // Check if loop already exists to prevent duplicate intervals in hot-reloading dev environments
  const globalObj = globalThis as any;
  if (!globalObj.__gpsSimulationInterval) {
    globalObj.__gpsSimulationInterval = setInterval(() => {
      if (!simulationEnabled) return;
      
      activeBuses = activeBuses.map((b) => {
        if (b.status === "boarding") {
          // 5% chance to finish boarding and start moving
          if (Math.random() < 0.05) {
            return {
              ...b,
              status: "on-time",
              speed: 25 + Math.floor(Math.random() * 25),
              progress: 0.01,
            };
          }
          return b;
        }

        // Calculate progress increments based on speed
        const speedFactor = 0.001 + b.speed / 60000;
        let progress = b.progress + speedFactor;
        
        if (progress >= 1) {
          // Arrived! Reset progress and set status
          progress = 0;
          const rand = Math.random();
          const nextStatus = rand < 0.2 ? "boarding" : rand < 0.35 ? "delayed" : "on-time";
          const nextSpeed = nextStatus === "boarding" ? 0 : 20 + Math.floor(Math.random() * 35);
          return {
            ...b,
            progress: 0,
            status: nextStatus,
            speed: nextSpeed,
            eta: 10 + Math.floor(Math.random() * 20),
          };
        }

        // Dynamic dynamic ETA prediction based on remaining distance and current speed
        const remaining = 1 - progress;
        const eta = Math.max(1, Math.round(remaining * 25));

        // Small speed variance for realism
        let speed = b.speed;
        if (Math.random() < 0.2) {
          speed = Math.max(15, Math.min(65, b.speed + (Math.random() > 0.5 ? 2 : -2)));
        }

        return {
          ...b,
          progress,
          speed,
          eta,
        };
      });
    }, 1500); // simulation tick every 1.5 seconds
  }
}

export function getAllBuses(): Bus[] {
  return activeBuses;
}

export function getBusById(id: string): Bus | undefined {
  return activeBuses.find((b) => b.id === id);
}

export function updateBusGPS(id: string, progress: number, speed?: number, status?: Bus["status"]): boolean {
  const index = activeBuses.findIndex((b) => b.id === id);
  if (index === -1) return false;

  activeBuses[index] = {
    ...activeBuses[index],
    progress: Math.max(0, Math.min(1, progress)),
    speed: speed !== undefined ? speed : activeBuses[index].speed,
    status: status || activeBuses[index].status,
  };

  return true;
}

export function isSimulationActive(): boolean {
  return simulationEnabled;
}

export function setSimulationState(active: boolean) {
  simulationEnabled = active;
}

export function resetBusesToDefault() {
  activeBuses = [...BUSES];
}
