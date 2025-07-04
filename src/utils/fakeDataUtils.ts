// Utility for generating fake data for HMS with image generation
  const realMedicines = [
    // Antibiotics
    { name: "Amoxicillin", category: "Antibiotic", unit: "capsule", commonDosage: "500mg", description: "Broad-spectrum antibiotic for bacterial infections" },
    { name: "Azithromycin", category: "Antibiotic", unit: "tablet", commonDosage: "250mg", description: "Macrolide antibiotic for respiratory infections" },
    { name: "Ciprofloxacin", category: "Antibiotic", unit: "tablet", commonDosage: "500mg", description: "Fluoroquinolone antibiotic for UTIs and respiratory infections" },
    { name: "Doxycycline", category: "Antibiotic", unit: "capsule", commonDosage: "100mg", description: "Tetracycline antibiotic for various infections" },
    { name: "Cephalexin", category: "Antibiotic", unit: "capsule", commonDosage: "500mg", description: "Cephalosporin antibiotic for skin and soft tissue infections" },
    { name: "Clindamycin", category: "Antibiotic", unit: "capsule", commonDosage: "150mg", description: "Lincosamide antibiotic for anaerobic infections" },
    
    // Painkillers
    { name: "Ibuprofen", category: "Painkiller", unit: "tablet", commonDosage: "400mg", description: "NSAID for pain and inflammation" },
    { name: "Paracetamol", category: "Painkiller", unit: "tablet", commonDosage: "500mg", description: "Analgesic and antipyretic for pain and fever" },
    { name: "Aspirin", category: "Painkiller", unit: "tablet", commonDosage: "325mg", description: "Salicylate for pain, fever, and blood thinning" },
    { name: "Diclofenac", category: "Painkiller", unit: "tablet", commonDosage: "50mg", description: "NSAID for arthritis and musculoskeletal pain" },
    { name: "Naproxen", category: "Painkiller", unit: "tablet", commonDosage: "220mg", description: "NSAID for long-lasting pain relief" },
    { name: "Tramadol", category: "Painkiller", unit: "tablet", commonDosage: "50mg", description: "Opioid analgesic for moderate to severe pain" },
    
    // Antipyretics
    { name: "Acetaminophen", category: "Antipyretic", unit: "tablet", commonDosage: "500mg", description: "Fever reducer and pain reliever" },
    { name: "Ibuprofen Suspension", category: "Antipyretic", unit: "syrup", commonDosage: "100mg/5ml", description: "Liquid fever reducer for children" },
    { name: "Aspirin Effervescent", category: "Antipyretic", unit: "tablet", commonDosage: "500mg", description: "Fast-acting fever reducer" },
    
    // Antiseptics
    { name: "Povidone Iodine", category: "Antiseptic", unit: "bottle", commonDosage: "10%", description: "Topical antiseptic for wound care" },
    { name: "Chlorhexidine", category: "Antiseptic", unit: "bottle", commonDosage: "0.5%", description: "Antiseptic solution for skin disinfection" },
    { name: "Hydrogen Peroxide", category: "Antiseptic", unit: "bottle", commonDosage: "3%", description: "Antiseptic for minor cuts and wounds" },
    
    // Vaccines
    { name: "Hepatitis B Vaccine", category: "Vaccine", unit: "vial", commonDosage: "1ml", description: "Prevents hepatitis B infection" },
    { name: "Tetanus Toxoid", category: "Vaccine", unit: "vial", commonDosage: "0.5ml", description: "Prevents tetanus infection" },
    { name: "Influenza Vaccine", category: "Vaccine", unit: "vial", commonDosage: "0.5ml", description: "Annual flu prevention" },
    { name: "COVID-19 Vaccine", category: "Vaccine", unit: "vial", commonDosage: "0.3ml", description: "Prevents COVID-19 infection" },
    
    // Antivirals
    { name: "Acyclovir", category: "Antiviral", unit: "tablet", commonDosage: "400mg", description: "Antiviral for herpes infections" },
    { name: "Oseltamivir", category: "Antiviral", unit: "capsule", commonDosage: "75mg", description: "Antiviral for influenza treatment" },
    { name: "Ribavirin", category: "Antiviral", unit: "tablet", commonDosage: "200mg", description: "Antiviral for hepatitis C" },
    
    // Antifungals
    { name: "Fluconazole", category: "Antifungal", unit: "tablet", commonDosage: "150mg", description: "Antifungal for yeast infections" },
    { name: "Ketoconazole", category: "Antifungal", unit: "tablet", commonDosage: "200mg", description: "Antifungal for systemic infections" },
    { name: "Terbinafine", category: "Antifungal", unit: "tablet", commonDosage: "250mg", description: "Antifungal for nail and skin infections" },
    
    // Supplements
    { name: "Vitamin C", category: "Supplement", unit: "tablet", commonDosage: "1000mg", description: "Immune system support" },
    { name: "Vitamin D3", category: "Supplement", unit: "tablet", commonDosage: "1000IU", description: "Bone health and immune support" },
    { name: "Multivitamin", category: "Supplement", unit: "tablet", commonDosage: "1 daily", description: "Complete vitamin and mineral supplement" },
    { name: "Calcium Carbonate", category: "Supplement", unit: "tablet", commonDosage: "500mg", description: "Bone health supplement" },
    { name: "Iron Sulfate", category: "Supplement", unit: "tablet", commonDosage: "65mg", description: "Iron deficiency supplement" },
    
    // Antihistamines
    { name: "Cetirizine", category: "Antihistamine", unit: "tablet", commonDosage: "10mg", description: "Allergy relief medication" },
    { name: "Loratadine", category: "Antihistamine", unit: "tablet", commonDosage: "10mg", description: "Non-drowsy allergy relief" },
    { name: "Diphenhydramine", category: "Antihistamine", unit: "tablet", commonDosage: "25mg", description: "Allergy relief with sedative effect" },
    { name: "Fexofenadine", category: "Antihistamine", unit: "tablet", commonDosage: "180mg", description: "Long-acting allergy relief" },
    
    // Steroids
    { name: "Prednisolone", category: "Steroid", unit: "tablet", commonDosage: "5mg", description: "Corticosteroid for inflammation" },
    { name: "Dexamethasone", category: "Steroid", unit: "tablet", commonDosage: "0.5mg", description: "Potent corticosteroid" },
    { name: "Hydrocortisone", category: "Steroid", unit: "cream", commonDosage: "1%", description: "Topical steroid for skin conditions" },
    
    // Cardiovascular
    { name: "Lisinopril", category: "Cardiovascular", unit: "tablet", commonDosage: "10mg", description: "ACE inhibitor for blood pressure" },
    { name: "Amlodipine", category: "Cardiovascular", unit: "tablet", commonDosage: "5mg", description: "Calcium channel blocker" },
    { name: "Atorvastatin", category: "Cardiovascular", unit: "tablet", commonDosage: "20mg", description: "Statin for cholesterol management" },
    { name: "Metoprolol", category: "Cardiovascular", unit: "tablet", commonDosage: "50mg", description: "Beta-blocker for heart conditions" },
    
    // Diabetes
    { name: "Metformin", category: "Diabetes", unit: "tablet", commonDosage: "500mg", description: "First-line diabetes medication" },
    { name: "Insulin Glargine", category: "Diabetes", unit: "vial", commonDosage: "100U/ml", description: "Long-acting insulin" },
    { name: "Glipizide", category: "Diabetes", unit: "tablet", commonDosage: "5mg", description: "Sulfonylurea for diabetes" },
    
    // Respiratory
    { name: "Salbutamol", category: "Respiratory", unit: "inhaler", commonDosage: "100mcg", description: "Bronchodilator for asthma" },
    { name: "Montelukast", category: "Respiratory", unit: "tablet", commonDosage: "10mg", description: "Leukotriene receptor antagonist" },
    { name: "Dextromethorphan", category: "Respiratory", unit: "syrup", commonDosage: "15mg/5ml", description: "Cough suppressant" },
    
    // Gastrointestinal
    { name: "Omeprazole", category: "Gastrointestinal", unit: "capsule", commonDosage: "20mg", description: "Proton pump inhibitor for acid reflux" },
    { name: "Loperamide", category: "Gastrointestinal", unit: "tablet", commonDosage: "2mg", description: "Anti-diarrheal medication" },
    { name: "Simethicone", category: "Gastrointestinal", unit: "tablet", commonDosage: "40mg", description: "Anti-gas medication" },
  ]
export function generateFakeData() {
  const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
  const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
  const randomFrom = <T,>(arr: T[]): T => arr[randomInt(0, arr.length - 1)]
  
  const names = ["Sokha", "Dara", "Sophea", "Vannak", "Rith", "Sreyneang", "Linda", "Sokun", "Piseth", "Chenda", "Sokchea", "Sokunthea", "Sokheng", "Sokly", "Sokunthy", "Sokunthida", "Sokunthyda", "Sokunthida", "Sokunthyda", "Sokunthida"]
  const surnames = ["Chan", "Kim", "Lim", "Yim", "Phan", "Chea", "Khim", "Chhim", "Chum", "Chhun", "Chhay", "Chhor", "Chhoeun", "Chhorn", "Chhoun", "Chhuon", "Chim", "Chin", "Chiv", "Chong"]
  const genders = ["Male", "Female"]
  const specialties = ["Cardiology", "Pediatrics", "General Medicine", "Orthopedics", "Dermatology", "Neurology", "Oncology", "Radiology", "Surgery", "ENT"]
  // Real medicine data with categories

  const appointmentStatuses: Array<'Scheduled' | 'Completed' | 'Cancelled'> = ["Scheduled", "Completed", "Cancelled"]
  const appointmentReasons = ["Regular checkup", "Follow-up", "Emergency", "Consultation", "Vaccination", "Blood test", "X-ray", "Surgery consultation", "Medication review", "Physical therapy"]
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const allergies = ["None", "Penicillin", "Peanuts", "Shellfish", "Latex", "Dust", "Pollen", "Eggs", "Milk", "Soy"]
  const medicalConditions = ["Hypertension", "Diabetes", "Asthma", "Arthritis", "Heart disease", "Migraine", "Allergies", "Back pain", "Anxiety", "Depression"]
  const insuranceProviders = ["National Health Insurance", "Private Health Plus", "Cambodia Health Care", "Universal Coverage", "Premium Health", "Basic Coverage"]

  // Image generation utilities
  const generateProfilePicture = (name: string, gender: string): string => {
    // Using multiple working avatar services for profile pictures
    const avatarServices = [
      // DiceBear API alternatives that work reliably
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`,
      // Robohash for fun robot avatars
      `https://robohash.org/${encodeURIComponent(name)}?set=set1&size=200x200`,
      `https://robohash.org/${encodeURIComponent(name)}?set=set2&size=200x200`,
      `https://robohash.org/${encodeURIComponent(name)}?set=set3&size=200x200`,
      // UI Avatars (text-based)
      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`,
      // Boring Avatars
      `https://source.boringavatars.com/marble/200/${encodeURIComponent(name)}`,
      `https://source.boringavatars.com/beam/200/${encodeURIComponent(name)}`,
      `https://source.boringavatars.com/pixel/200/${encodeURIComponent(name)}`,
      // Multiavatar
      `https://api.multiavatar.com/${encodeURIComponent(name)}.svg`,
    ]
    
    // Use hash of name to ensure consistent avatar for same person
    const hashCode = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const serviceIndex = Math.abs(hashCode) % avatarServices.length
    return avatarServices[serviceIndex]
  }

  const generateMedicationImage = (medName: string, category: string, unit: string): string => {
    // Enhanced medication image generation with working image services
    const medicineImages = [
      // Real pharmaceutical images from Unsplash
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1550572017-edd951aa8ca5?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1563213126-a4273aed2016?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1550572017-edd951aa8ca5?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586152146374-b4badfef8065?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=250&h=180&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1550572017-edd951aa8ca5?w=250&h=180&fit=crop&crop=center',
      // Picsum Photos for additional variety
      'https://picsum.photos/250/180?random=1',
      'https://picsum.photos/250/180?random=2',
      'https://picsum.photos/250/180?random=3',
      'https://picsum.photos/250/180?random=4',
      'https://picsum.photos/250/180?random=5',
      'https://picsum.photos/250/180?random=6',
      'https://picsum.photos/250/180?random=7',
      'https://picsum.photos/250/180?random=8',
      'https://picsum.photos/250/180?random=9',
      'https://picsum.photos/250/180?random=10',
      // Placeholder.pics (alternative to via.placeholder.com)
      'https://placeholder.pics/svg/250x180/4CAF50/FFFFFF/Medicine',
      'https://placeholder.pics/svg/250x180/2196F3/FFFFFF/Pills',
      'https://placeholder.pics/svg/250x180/FF9800/FFFFFF/Tablets',
      'https://placeholder.pics/svg/250x180/9C27B0/FFFFFF/Capsules',
      'https://placeholder.pics/svg/250x180/00BCD4/FFFFFF/Vaccine',
      'https://placeholder.pics/svg/250x180/F44336/FFFFFF/Antiviral',
      'https://placeholder.pics/svg/250x180/795548/FFFFFF/Antifungal',
      'https://placeholder.pics/svg/250x180/CDDC39/FFFFFF/Supplement',
      'https://placeholder.pics/svg/250x180/FF5722/FFFFFF/Antihistamine',
      'https://placeholder.pics/svg/250x180/607D8B/FFFFFF/Steroid',
      // DummyImage.com as another alternative
      'https://dummyimage.com/250x180/4CAF50/ffffff&text=Medicine',
      'https://dummyimage.com/250x180/2196F3/ffffff&text=Pills',
      'https://dummyimage.com/250x180/FF9800/ffffff&text=Tablets',
      'https://dummyimage.com/250x180/9C27B0/ffffff&text=Capsules',
      'https://dummyimage.com/250x180/00BCD4/ffffff&text=Vaccine',
    ]
    
    // Use hash of medicine name to ensure consistent image for same medicine
    const hashCode = medName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    const imageIndex = Math.abs(hashCode) % medicineImages.length
    return medicineImages[imageIndex]
  }

  // Enhanced data generation with proper typing
  const patients = Array.from({ length: 100 }, (_, i) => {
    const gender = randomFrom(genders)
    const firstName = randomFrom(names)
    const lastName = randomFrom(surnames)
    const fullName = `${firstName} ${lastName}`
    const age = randomInt(18, 80)
    const dobYear = new Date().getFullYear() - age
    
    return {
      id: `P${(i + 1).toString().padStart(3, '0')}`,
      name: fullName,
      age,
      gender,
      dob: new Date(dobYear, randomInt(0, 11), randomInt(1, 28)).toISOString(),
      contact: `012${randomInt(100000, 999999)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      address: `Street ${randomInt(1, 500)}, District ${randomInt(1, 12)}, Phnom Penh`,
      bloodType: randomFrom(bloodTypes),
      allergies: randomFrom(allergies),
      medicalHistory: Array.from({ length: randomInt(0, 3) }, () => randomFrom(medicalConditions)).join(', '),
      emergencyContact: `098${randomInt(100000, 999999)}`,
      insuranceProvider: randomFrom(insuranceProviders),
      profilePicture: generateProfilePicture(fullName, gender),
      description: `Patient with ${randomInt(1, 10)} years of medical history`,
      assignedDoctor: '', // Will be populated when creating appointments
      createdAt: randomDate(new Date(2022, 0, 1), new Date()),
    }
  })

  // Doctors with enhanced data
  const doctors = Array.from({ length: 20 }, (_, i) => {
    const gender = randomFrom(genders)
    const firstName = randomFrom(names)
    const lastName = randomFrom(surnames)
    const fullName = `Dr. ${firstName} ${lastName}`
    
    return {
      id: `D${(i + 1).toString().padStart(3, '0')}`,
      name: fullName,
      gender,
      specialty: randomFrom(specialties),
      contact: `088${randomInt(100000, 999999)}`,
      email: `dr.${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospital.com`,
      address: `Medical Center ${randomInt(1, 10)}, Phnom Penh`,
      profilePicture: generateProfilePicture(fullName, gender),
      createdAt: randomDate(new Date(2022, 0, 1), new Date()),
    }
  })

  // Get real medicine images as a map for fast lookup
  const realMedicineImagesArr = generateRealMedicineImages();
  const realMedicineImageMap = Object.fromEntries(realMedicineImagesArr.map(img => [img.name, img.imageUrl]));

  // Enhanced medications with real medicine names and data
  const medications = Array.from({ length: 150 }, (_, i) => {
    const medicine = randomFrom(realMedicines)
    const basePrice = randomInt(5, 200)
    const stockQuantity = randomInt(50, 1000)
    const expiryDate = randomDate(new Date(), new Date(2027, 11, 31))
    const lastRestocked = randomDate(new Date(2023, 0, 1), new Date())
    // Add some variation to medicine names for realism
    const nameVariations = [
      medicine.name,
      `${medicine.name} ${medicine.commonDosage}`,
      `${medicine.name} (${medicine.commonDosage})`,
      `${medicine.name} ${medicine.commonDosage} ${medicine.unit}`,
    ]
    const finalName = randomFrom(nameVariations)
    // Use real image if available, else fallback, else use a default placeholder
    let imageUrl = realMedicineImageMap[medicine.name]
    if (!imageUrl) {
      imageUrl = generateMedicationImage(medicine.name, medicine.category, medicine.unit)
    }
    // If still no image, use a generic placeholder
    if (!imageUrl) {
      imageUrl = "https://dummyimage.com/250x180/cccccc/ffffff&text=No+Image";
    }
    return {
      id: `M${(i + 1).toString().padStart(3, '0')}`,
      name: finalName,
      category: medicine.category,
      unitPrice: basePrice,
      stockQuantity,
      remainingStock: randomInt(Math.floor(stockQuantity * 0.1), stockQuantity),
      expiryDate,
      lastRestocked,
      imageUrl,
      description: medicine.description,
      dosage: medicine.commonDosage,
      unit: medicine.unit,
      createdAt: randomDate(new Date(2022, 0, 1), new Date()),
    }
  })

  // Enhanced appointments with better relationships
  const appointments = Array.from({ length: 200 }, (_, i) => {
    const patient = randomFrom(patients)
    const doctor = randomFrom(doctors)
    const appointmentDate = randomDate(new Date(2023, 0, 1), new Date(2025, 11, 31))
    const appointmentTime = `${randomInt(8, 17).toString().padStart(2, '0')}:${randomFrom(['00', '15', '30', '45'])}`
    
    return {
      id: `A${(i + 1).toString().padStart(3, '0')}`,
      patientId: patient.id,
      doctorId: doctor.id,
      date: appointmentDate.split('T')[0], // Date only
      time: appointmentTime,
      reason: randomFrom(appointmentReasons),
      status: randomFrom(appointmentStatuses),
      patientName: patient.name,
      doctorName: doctor.name,
      createdAt: randomDate(new Date(2022, 0, 1), new Date()),
    }
  })

  // Update patients with assigned doctors based on recent appointments
  patients.forEach(patient => {
    const recentAppointments = appointments
      .filter(apt => apt.patientId === patient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    if (recentAppointments.length > 0) {
      patient.assignedDoctor = recentAppointments[0].doctorName
    }
  })

  return { patients, doctors, medications, appointments }
}

// Enhanced storage function with validation
export function storeFakeDataToLocalStorage(data: ReturnType<typeof generateFakeData>) {
  try {
    // Clear existing data first
    localStorage.removeItem("hms-patients")
    localStorage.removeItem("hms-doctors")
    localStorage.removeItem("hms-medications")
    localStorage.removeItem("hms-appointments")
    
    // Store new data
    localStorage.setItem("hms-patients", JSON.stringify(data.patients))
    localStorage.setItem("hms-doctors", JSON.stringify(data.doctors))
    localStorage.setItem("hms-medications", JSON.stringify(data.medications))
    localStorage.setItem("hms-appointments", JSON.stringify(data.appointments))
    
    console.log("✅ Fake data successfully stored to localStorage")
    console.log(`📊 Generated: ${data.patients.length} patients, ${data.doctors.length} doctors, ${data.medications.length} medications, ${data.appointments.length} appointments`)
    
    return {
      success: true,
      message: "Fake data generated and stored successfully",
      stats: {
        patients: data.patients.length,
        doctors: data.doctors.length,
        medications: data.medications.length,
        appointments: data.appointments.length
      }
    }
  } catch (error) {
    console.error("❌ Error storing fake data:", error)
    return {
      success: false,
      message: "Failed to store fake data",
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

// Utility to generate and store data in one call
export function generateAndStoreFakeData() {
  const data = generateFakeData()
  return storeFakeDataToLocalStorage(data)
}

// Utility to clear all HMS data
export function clearAllHMSData() {
  const keys = ["hms-patients", "hms-doctors", "hms-medications", "hms-appointments"]
  keys.forEach(key => localStorage.removeItem(key))
  console.log("🗑️ All HMS data cleared from localStorage")
}

// Alternative: Generate real pharmaceutical product images using working services
export function generateRealMedicineImages() {
  const realMedicineImages = [
    // Real pharmaceutical images from Unsplash (verified working URLs)
    { name: "Amoxicillin", imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=250&h=180&fit=crop&crop=center" },
    { name: "Azithromycin", imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=250&h=180&fit=crop&crop=center" },
    { name: "Ciprofloxacin", imageUrl: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=250&h=180&fit=crop&crop=center" },
    { name: "Ibuprofen", imageUrl: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=250&h=180&fit=crop&crop=center" },
    { name: "Paracetamol", imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=250&h=180&fit=crop&crop=center" },
    { name: "Aspirin", imageUrl: "https://images.unsplash.com/photo-1550572017-edd951aa8ca5?w=250&h=180&fit=crop&crop=center" },
    
    // Additional working image services
    { name: "Generic Tablet", imageUrl: "https://picsum.photos/250/180?random=100" },
    { name: "Generic Capsule", imageUrl: "https://picsum.photos/250/180?random=101" },
    { name: "Generic Bottle", imageUrl: "https://picsum.photos/250/180?random=102" },
    { name: "Generic Syrup", imageUrl: "https://picsum.photos/250/180?random=103" },
    { name: "Generic Vial", imageUrl: "https://picsum.photos/250/180?random=104" },
    
    // DummyImage.com alternatives
    { name: "Medicine", imageUrl: "https://dummyimage.com/250x180/4CAF50/ffffff&text=Medicine" },
    { name: "Pills", imageUrl: "https://dummyimage.com/250x180/2196F3/ffffff&text=Pills" },
    { name: "Tablets", imageUrl: "https://dummyimage.com/250x180/FF9800/ffffff&text=Tablets" },
    { name: "Capsules", imageUrl: "https://dummyimage.com/250x180/9C27B0/ffffff&text=Capsules" },
  ]
  
  return realMedicineImages
}

// Test function to verify image URLs are working
export function testImageUrls() {
  console.log("🔍 Testing image URLs...")
  
  const testUrls = [
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=250&h=180&fit=crop&crop=center",
    "https://picsum.photos/250/180?random=1",
    "https://dummyimage.com/250x180/4CAF50/ffffff&text=Medicine",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=test&backgroundColor=b6e3f4",
    "https://ui-avatars.com/api/?name=John+Doe&background=random&color=fff&size=200"
  ]
  
  testUrls.forEach((url, index) => {
    const img = new Image()
    img.onload = () => console.log(`✅ URL ${index + 1} working: ${url}`)
    img.onerror = () => console.log(`❌ URL ${index + 1} failed: ${url}`)
    img.src = url
  })
}

// Preview data without storing
export function previewFakeData() {
  const data = generateFakeData()
  console.log("📋 Preview of generated data:")
  console.log("Patients sample:", data.patients.slice(0, 3))
  console.log("Doctors sample:", data.doctors.slice(0, 3))
  console.log("Medications sample:", data.medications.slice(0, 3))
  console.log("Appointments sample:", data.appointments.slice(0, 3))
  return data
}

// Get list of all real medicines for reference
export function getRealMedicinesList() {

  return realMedicines.map(med => ({
    name: med.name,
    category: med.category,
    description: med.description,
    dosage: med.commonDosage,
    unit: med.unit
  }))
}
