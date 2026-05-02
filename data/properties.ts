export type PropertyStatus = 'good' | 'warning' | 'alert';

export interface Issue {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  fixSuggestion: string;
  estimatedCost: string;
  location: string;
  detectedAt: string;
  vendorAssigned: boolean;
  vendorName?: string;
}

export interface BookingEntry {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: 'confirmed' | 'pending' | 'completed';
}

export interface ActivityEntry {
  id: string;
  event: string;
  time: string;
  type: 'issue' | 'booking' | 'maintenance' | 'ai';
}

export interface Property {
  id: string;
  name: string;
  address: string;
  occupancy: 'Occupied' | 'Vacant';
  issues: Issue[];
  status: PropertyStatus;
  rating: number;
  monthlyRevenue: string;
  bookings: BookingEntry[];
  activity: ActivityEntry[];
  aiInsight: string;
  vrImageDay: string;
  vrImageNight: string;
  noiseLevel: 'Low' | 'Moderate' | 'High';
  sunlightInfo: string;
  noiseInfo: string;
}

export const PROPERTIES: Property[] = [
  {
    id: '1',
    name: 'Downtown Penthouse',
    address: '42 Skyline Ave, Floor 28',
    occupancy: 'Occupied',
    status: 'good',
    rating: 4.9,
    monthlyRevenue: '$4,200',
    aiInsight: 'Top performer this month. Guest satisfaction at 98%. No action needed.',
    vrImageDay: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000',
    vrImageNight: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000',
    sunlightInfo: 'This penthouse gets direct sunlight from 7am to 2pm. Floor-to-ceiling windows flood the living area with natural light.',
    noiseInfo: 'Being on the 28th floor, street noise is minimal. Occasional helicopter traffic in the morning.',
    noiseLevel: 'Low',
    issues: [],
    bookings: [
      { id: 'b1', guestName: 'James Whitfield', checkIn: 'May 1', checkOut: 'May 8', status: 'confirmed' },
      { id: 'b2', guestName: 'Priya Sharma', checkIn: 'May 12', checkOut: 'May 19', status: 'pending' },
    ],
    activity: [
      { id: 'a1', event: 'Guest checked in', time: '2 days ago', type: 'booking' },
      { id: 'a2', event: 'AI: All systems normal', time: '1 day ago', type: 'ai' },
    ],
  },
  {
    id: '2',
    name: 'Seaview Villa',
    address: '7 Coastal Road, Malibu',
    occupancy: 'Vacant',
    status: 'alert',
    rating: 4.6,
    monthlyRevenue: '$6,800',
    aiInsight: 'Property #2 at risk of complaint. 2 unresolved maintenance issues. Assign vendors before next booking.',
    vrImageDay: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000',
    vrImageNight: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=2000',
    sunlightInfo: 'Ocean-facing rooms receive golden hour light from 4pm to sunset. Morning rooms face east toward the hills.',
    noiseInfo: 'Ocean waves provide a constant ambient sound. Street noise increases on weekends due to coastal traffic.',
    noiseLevel: 'Moderate',
    issues: [
      {
        id: 'i1',
        type: 'Water Leak',
        severity: 'High',
        description: 'Active water leak detected under kitchen sink. Moisture spreading to cabinet floor.',
        fixSuggestion: 'Replace P-trap seal and inspect supply lines. Check for mold growth.',
        estimatedCost: '$150–$300',
        location: 'Kitchen',
        detectedAt: '3 hours ago',
        vendorAssigned: false,
      },
      {
        id: 'i2',
        type: 'Wall Crack',
        severity: 'Medium',
        description: 'Hairline crack detected on exterior-facing wall. Possible moisture ingress risk.',
        fixSuggestion: 'Apply epoxy filler and repaint. Monitor for expansion over 30 days.',
        estimatedCost: '$80–$200',
        location: 'Master Bedroom',
        detectedAt: '1 day ago',
        vendorAssigned: true,
        vendorName: 'FixIt Pro Services',
      },
    ],
    bookings: [
      { id: 'b3', guestName: 'Carlos Mendez', checkIn: 'May 10', checkOut: 'May 17', status: 'confirmed' },
    ],
    activity: [
      { id: 'a3', event: 'AR scan: Water leak detected', time: '3 hours ago', type: 'issue' },
      { id: 'a4', event: 'Vendor assigned for wall crack', time: '1 day ago', type: 'maintenance' },
      { id: 'a5', event: 'AI: Risk of complaint flagged', time: '2 hours ago', type: 'ai' },
    ],
  },
  {
    id: '3',
    name: 'Cozy Loft',
    address: '15 Artisan Quarter, Brooklyn',
    occupancy: 'Occupied',
    status: 'warning',
    rating: 4.7,
    monthlyRevenue: '$2,900',
    aiInsight: 'Maintenance overdue for HVAC unit. Schedule service before summer season begins.',
    vrImageDay: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000',
    vrImageNight: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=2000',
    sunlightInfo: 'North-facing loft has diffused natural light throughout the day — ideal for artists and remote workers.',
    noiseInfo: 'Located above a café. Morning coffee crowd creates moderate noise from 7–10am. Evenings are quiet.',
    noiseLevel: 'Moderate',
    issues: [
      {
        id: 'i3',
        type: 'Broken Appliance',
        severity: 'Medium',
        description: 'HVAC unit making grinding noise. Cooling efficiency reduced by ~40%.',
        fixSuggestion: 'Inspect fan motor and compressor. Likely needs belt replacement or refrigerant recharge.',
        estimatedCost: '$200–$500',
        location: 'Living Room',
        detectedAt: '2 days ago',
        vendorAssigned: false,
      },
    ],
    bookings: [
      { id: 'b4', guestName: 'Aisha Okonkwo', checkIn: 'Apr 28', checkOut: 'May 5', status: 'confirmed' },
    ],
    activity: [
      { id: 'a6', event: 'Guest reported HVAC noise', time: '2 days ago', type: 'issue' },
      { id: 'a7', event: 'AI: Maintenance overdue alert', time: '1 day ago', type: 'ai' },
    ],
  },
  {
    id: '4',
    name: 'Urban Studio',
    address: '88 Metro Lane, Chicago',
    occupancy: 'Vacant',
    status: 'good',
    rating: 4.5,
    monthlyRevenue: '$1,800',
    aiInsight: 'Property is vacant and in good condition. Consider a promotional rate to fill the May gap.',
    vrImageDay: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=2000',
    vrImageNight: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=2000',
    sunlightInfo: 'East-facing studio gets bright morning sun from 6am to noon. Afternoon is naturally shaded.',
    noiseInfo: 'Metro line runs nearby. Train frequency peaks at rush hours (7–9am, 5–7pm). Nights are very quiet.',
    noiseLevel: 'High',
    issues: [],
    bookings: [
      { id: 'b5', guestName: 'Tom Eriksen', checkIn: 'May 20', checkOut: 'May 25', status: 'pending' },
    ],
    activity: [
      { id: 'a8', event: 'Cleaning completed', time: '3 days ago', type: 'maintenance' },
      { id: 'a9', event: 'AI: Vacancy gap detected', time: '1 day ago', type: 'ai' },
    ],
  },
];

export const AI_NARRATIONS: Record<string, { day: string; night: string }> = {
  '1': {
    day: 'This penthouse gets direct sunlight from 7am to 2pm. Floor-to-ceiling windows flood the living area with natural light — perfect for a productive morning.',
    night: 'At night, the city skyline transforms into a breathtaking light show. Street noise is minimal at this elevation. Ideal for a peaceful evening.',
  },
  '2': {
    day: 'Ocean-facing rooms receive golden hour light from 4pm to sunset. The sea breeze keeps temperatures comfortable throughout the day.',
    night: 'Ocean waves provide a soothing ambient sound at night. Coastal traffic increases on weekends, but the villa\'s insulation keeps it serene inside.',
  },
  '3': {
    day: 'North-facing diffused light makes this loft ideal for creative work. The café below adds a lively morning energy to the neighborhood.',
    night: 'The Artisan Quarter quiets down beautifully after 9pm. Warm Edison bulb lighting in the loft creates a cozy, intimate atmosphere.',
  },
  '4': {
    day: 'East-facing windows bring in bright morning sun from 6am to noon. The compact layout is efficiently designed for solo travelers.',
    night: 'Metro trains run until midnight, with a distinct rhythm that some guests find charming. After midnight, the studio is perfectly quiet.',
  },
};
