export type BusRoute = {
  id: string;
  code: string;
  name: string;
  from: string;
  to: string;
  stops: string[];
  fare: number; // RWF
  duration: number; // mins
  color: string;
};

export type Bus = {
  id: string;
  plate: string;
  routeId: string;
  driver: string;
  occupancy: number; // 0..100
  speed: number; // km/h
  eta: number; // mins
  status: "on-time" | "delayed" | "boarding";
  // position along route 0..1
  progress: number;
};

export const ROUTES: BusRoute[] = [
  {
    id: "r-302",
    code: "302",
    name: "Nyabugogo ↔ Kimironko",
    from: "Nyabugogo Bus Park",
    to: "Kimironko Market",
    stops: ["Nyabugogo", "Downtown", "Kacyiru", "Kimihurura", "Remera", "Kimironko"],
    fare: 400,
    duration: 38,
    color: "#00A1DE",
  },
  {
    id: "r-216",
    code: "216",
    name: "Remera ↔ Nyamirambo",
    from: "Remera Taxi Park",
    to: "Nyamirambo",
    stops: ["Remera", "Kimihurura", "Downtown", "Biryogo", "Nyamirambo"],
    fare: 350,
    duration: 32,
    color: "#FAD201",
  },
  {
    id: "r-118",
    code: "118",
    name: "Kicukiro ↔ Nyabugogo",
    from: "Kicukiro Centre",
    to: "Nyabugogo Bus Park",
    stops: ["Kicukiro", "Sonatube", "Downtown", "Nyabugogo"],
    fare: 350,
    duration: 28,
    color: "#20603D",
  },
  {
    id: "r-405",
    code: "405",
    name: "Kanombe Airport ↔ Downtown",
    from: "Kanombe Airport",
    to: "Downtown CBD",
    stops: ["Airport", "Kanombe", "Remera", "Kimihurura", "Downtown"],
    fare: 600,
    duration: 42,
    color: "#E04F5F",
  },
];

export const BUSES: Bus[] = [
  { id: "b1", plate: "RAB 234 K", routeId: "r-302", driver: "Jean Bosco U.", occupancy: 72, speed: 34, eta: 4, status: "on-time", progress: 0.42 },
  { id: "b2", plate: "RAC 891 L", routeId: "r-302", driver: "Aline M.", occupancy: 38, speed: 28, eta: 9, status: "on-time", progress: 0.18 },
  { id: "b3", plate: "RAD 102 M", routeId: "r-216", driver: "Patrick H.", occupancy: 91, speed: 12, eta: 14, status: "delayed", progress: 0.62 },
  { id: "b4", plate: "RAE 776 N", routeId: "r-118", driver: "Claudine I.", occupancy: 22, speed: 41, eta: 6, status: "on-time", progress: 0.55 },
  { id: "b5", plate: "RAF 314 P", routeId: "r-405", driver: "Eric N.", occupancy: 64, speed: 47, eta: 11, status: "on-time", progress: 0.30 },
  { id: "b6", plate: "RAB 559 Q", routeId: "r-216", driver: "Sandrine K.", occupancy: 15, speed: 0, eta: 2, status: "boarding", progress: 0.05 },
];

export function fmtRWF(n: number) {
  return new Intl.NumberFormat("en-RW").format(n) + " RWF";
}

export const KIGALI_DEMAND = [
  { hour: "5a", riders: 320 },
  { hour: "6a", riders: 980 },
  { hour: "7a", riders: 2140 },
  { hour: "8a", riders: 2680 },
  { hour: "9a", riders: 1420 },
  { hour: "10a", riders: 880 },
  { hour: "12p", riders: 1260 },
  { hour: "2p", riders: 1180 },
  { hour: "4p", riders: 1990 },
  { hour: "5p", riders: 2880 },
  { hour: "6p", riders: 2410 },
  { hour: "8p", riders: 920 },
];

export const REVENUE_WEEK = [
  { day: "Mon", revenue: 1240000 },
  { day: "Tue", revenue: 1380000 },
  { day: "Wed", revenue: 1310000 },
  { day: "Thu", revenue: 1480000 },
  { day: "Fri", revenue: 1820000 },
  { day: "Sat", revenue: 2110000 },
  { day: "Sun", revenue: 1530000 },
];
