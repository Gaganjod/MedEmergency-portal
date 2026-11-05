export const mockHospitals = [
  {
    id: "1",
    name: "City General Hospital",
    address: "123 Main Street, Downtown",
    distance: 2.5,
    availableBeds: {
      icu: 5,
      general: 20,
      emergency: 3,
    },
    specialties: ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
    rating: 4.5,
    waitTime: 15,
    phone: "+1-555-0101",
    coordinates: { lat: 40.7128, lng: -74.006 },
    image: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=200",
    isEmergencyAvailable: true,
  },
  {
    id: "2",
    name: "St. Mary's Medical Center",
    address: "456 Oak Avenue, Midtown",
    distance: 3.8,
    availableBeds: {
      icu: 2,
      general: 15,
      emergency: 5,
    },
    specialties: ["Pediatrics", "Oncology", "Surgery", "Emergency Medicine"],
    rating: 4.8,
    waitTime: 25,
    phone: "+1-555-0102",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200",
    isEmergencyAvailable: true,
  },
  {
    id: "3",
    name: "Regional Trauma Center",
    address: "789 Emergency Lane, Westside",
    distance: 5.2,
    availableBeds: {
      icu: 8,
      general: 30,
      emergency: 10,
    },
    specialties: ["Trauma", "Burns", "Emergency Medicine", "Critical Care"],
    rating: 4.9,
    waitTime: 10,
    phone: "+1-555-0103",
    coordinates: { lat: 40.7484, lng: -73.9857 },
    image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200",
    isEmergencyAvailable: true,
  },
]

export const mockAmbulances = [
  {
    id: "AMB-001",
    status: "available",
    location: { lat: 40.7128, lng: -74.006 },
    driver: "John Smith",
    driverName: "John Smith",
    driverPhone: "+1-555-0201",
    vehicleNumber: "AMB-001",
    eta: null,
  },
  {
    id: "AMB-002",
    status: "en_route",
    location: { lat: 40.7589, lng: -73.9851 },
    driver: "Sarah Johnson",
    driverName: "Sarah Johnson",
    driverPhone: "+1-555-0202",
    vehicleNumber: "AMB-002",
    eta: 8,
  },
  {
    id: "AMB-003",
    status: "at_scene",
    location: { lat: 40.7484, lng: -73.9857 },
    driver: "Mike Davis",
    driverName: "Mike Davis",
    driverPhone: "+1-555-0203",
    vehicleNumber: "AMB-003",
    eta: null,
  },
]

export const mockEmergencies = [
  {
    id: "EM-001",
    type: "cardiac",
    severity: "critical",
    location: "123 Oak St",
    patient: "John Doe",
    status: "in_progress",
    assignedAmbulance: "AMB-002",
    assignedHospital: "City General Hospital",
    timestamp: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "EM-002",
    type: "accident",
    severity: "high",
    location: "456 Main Ave",
    patient: "Jane Smith",
    status: "dispatched",
    assignedAmbulance: "AMB-003",
    assignedHospital: "Regional Trauma Center",
    timestamp: new Date("2024-01-15T11:15:00"),
  },
]

export const mockBloodBank = [
  { type: "A+", units: 45, status: "adequate" },
  { type: "A-", units: 12, status: "low" },
  { type: "B+", units: 30, status: "adequate" },
  { type: "B-", units: 8, status: "critical" },
  { type: "AB+", units: 15, status: "adequate" },
  { type: "AB-", units: 5, status: "low" },
  { type: "O+", units: 50, status: "adequate" },
  { type: "O-", units: 10, status: "low" },
]

export const mockBloodDonors = [
  { id: "1", bloodType: "A+", isAvailable: true, totalDonations: 12, lastDonationDate: "2024-10-15" },
  { id: "2", bloodType: "O-", isAvailable: true, totalDonations: 8, lastDonationDate: "2024-11-02" },
  { id: "3", bloodType: "B+", isAvailable: false, totalDonations: 5, lastDonationDate: "2024-09-20" },
  { id: "4", bloodType: "AB+", isAvailable: true, totalDonations: 3, lastDonationDate: "2024-11-10" },
  { id: "5", bloodType: "O+", isAvailable: true, totalDonations: 15, lastDonationDate: "2024-10-28" },
  { id: "6", bloodType: "A-", isAvailable: true, totalDonations: 7, lastDonationDate: "2024-11-05" },
  { id: "7", bloodType: "B-", isAvailable: false, totalDonations: 4, lastDonationDate: "2024-08-15" },
  { id: "8", bloodType: "AB-", isAvailable: true, totalDonations: 2, lastDonationDate: "2024-11-12" },
]

export const symptomAnalysisData = {
  commonSymptoms: [
    "Chest pain",
    "Difficulty breathing",
    "Severe headache",
    "Abdominal pain",
    "Dizziness",
    "High fever",
    "Loss of consciousness",
    "Severe bleeding",
    "Numbness in limbs",
    "Severe allergic reaction",
  ],
  severityLevels: [
    { level: "critical", color: "red", action: "Immediate emergency response" },
    { level: "high", color: "orange", action: "Urgent medical attention needed" },
    { level: "moderate", color: "yellow", action: "Schedule appointment soon" },
    { level: "low", color: "green", action: "Self-care or routine checkup" },
  ],
}

export const mockDoctors = [
  {
    id: "doc-1",
    name: "Dr. Sarah Wilson",
    specialization: "Cardiologist",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
    rating: 4.9,
    experience: 15,
    hospital: "City General Hospital",
  },
  {
    id: "doc-2",
    name: "Dr. Michael Chen",
    specialization: "Neurologist",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100",
    rating: 4.8,
    experience: 12,
    hospital: "St. Mary's Medical Center",
  },
  {
    id: "doc-3",
    name: "Dr. Emily Brown",
    specialization: "General Physician",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100",
    rating: 4.7,
    experience: 8,
    hospital: "Regional Trauma Center",
  },
]

export const mockAppointments = [
  {
    id: "apt-1",
    doctorId: "doc-1",
    date: "2024-12-15",
    time: "10:00 AM",
    status: "scheduled",
    type: "Follow-up",
    notes: "Regular checkup",
  },
  {
    id: "apt-2",
    doctorId: "doc-2",
    date: "2024-12-18",
    time: "2:30 PM",
    status: "scheduled",
    type: "Consultation",
    notes: "Initial consultation",
  },
  {
    id: "apt-3",
    doctorId: "doc-3",
    date: "2024-12-10",
    time: "11:00 AM",
    status: "completed",
    type: "Checkup",
    notes: "Annual physical",
  },
]

export const mockMedicalRecords = [
  {
    id: "rec-1",
    title: "Blood Test Results",
    date: "2024-12-01",
    type: "lab_report",
    doctor: "Dr. Sarah Wilson",
  },
  {
    id: "rec-2",
    title: "ECG Report",
    date: "2024-11-28",
    type: "diagnostic",
    doctor: "Dr. Sarah Wilson",
  },
  {
    id: "rec-3",
    title: "Prescription - Hypertension",
    date: "2024-11-25",
    type: "prescription",
    doctor: "Dr. Michael Chen",
  },
  {
    id: "rec-4",
    title: "X-Ray Report",
    date: "2024-11-20",
    type: "diagnostic",
    doctor: "Dr. Emily Brown",
  },
]

export const mockNotifications = [
  {
    id: "notif-1",
    title: "Appointment Reminder",
    message: "Your appointment with Dr. Sarah Wilson is tomorrow at 10:00 AM",
    type: "appointment",
    isRead: false,
    timestamp: new Date(),
  },
  {
    id: "notif-2",
    title: "Prescription Ready",
    message: "Your prescription is ready for pickup at City Pharmacy",
    type: "prescription",
    isRead: false,
    timestamp: new Date(),
  },
  {
    id: "notif-3",
    title: "Health Tip",
    message: "Remember to stay hydrated and get 8 hours of sleep",
    type: "general",
    isRead: true,
    timestamp: new Date(),
  },
]

export const mockUsers = [
  {
    id: "user-1",
    email: "patient@demo.com",
    name: "John Patient",
    role: "patient",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
  },
  {
    id: "user-2",
    email: "doctor@demo.com",
    name: "Dr. Sarah Wilson",
    role: "doctor",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100",
  },
  {
    id: "user-3",
    email: "hospital@demo.com",
    name: "City General Admin",
    role: "hospital",
    avatar: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=100",
  },
  {
    id: "user-4",
    email: "admin@demo.com",
    name: "System Admin",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
  },
]

export const mockAnalytics = {
  totalUsers: 15847,
  totalEmergencies: 3256,
  totalHospitals: 127,
  totalDoctors: 892,
  averageResponseTime: 8.5,
  satisfactionRate: 94.2,
  emergenciesByMonth: [
    { month: "Jan", count: 245 },
    { month: "Feb", count: 312 },
    { month: "Mar", count: 289 },
    { month: "Apr", count: 356 },
    { month: "May", count: 298 },
    { month: "Jun", count: 321 },
    { month: "Jul", count: 378 },
    { month: "Aug", count: 345 },
    { month: "Sep", count: 312 },
    { month: "Oct", count: 267 },
    { month: "Nov", count: 289 },
    { month: "Dec", count: 234 },
  ],
  emergenciesByType: [
    { type: "Cardiac", count: 856 },
    { type: "Trauma", count: 723 },
    { type: "Respiratory", count: 512 },
    { type: "Stroke", count: 445 },
    { type: "Burns", count: 234 },
    { type: "Other", count: 486 },
  ],
}