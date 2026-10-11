/**
 * Document Scanner & Smart Entity Extraction Service
 * Simulates enterprise AI/OCR document parsing for insurance, towing, and renewal workflows.
 * Extracts structured entities from uploaded photos (RC book, Policy Schedule, DL, Spot photos).
 */

export const DOCUMENT_TYPES = {
  RC_BOOK: 'RC_BOOK',
  INSURANCE_POLICY: 'INSURANCE_POLICY',
  DRIVING_LICENCE: 'DRIVING_LICENCE',
  BREAKDOWN_SPOT: 'BREAKDOWN_SPOT',
  REPAIR_ESTIMATE: 'REPAIR_ESTIMATE',
  MEDICAL_BILL: 'MEDICAL_BILL'
};

// Built-in Realistic Mock Extraction Presets for 1-click test validation
export const SAMPLE_DOCUMENTS = [
  {
    id: 'sample-rc-1',
    label: 'RC Copy - TN 09 BX 4512 (Hyundai Creta)',
    docType: DOCUMENT_TYPES.RC_BOOK,
    fileName: 'Vehicle_RC_TN09BX4512_Karthikeyan.jpg',
    extractedData: {
      clientName: 'R. Karthikeyan',
      customerName: 'R. Karthikeyan',
      vehicleNumber: 'TN 09 BX 4512',
      vehicleNo: 'TN 09 BX 4512',
      phone: '9841234567',
      mobile: '9841234567',
      policyNumber: 'POL-2024-8891',
      policyNo: 'POL-2024-8891',
      insuranceCompany: 'HDFC ERGO',
      vehicleModel: 'Hyundai Creta SX (O) Diesel',
      registrationDate: '2023-04-12',
      chassisNo: 'MALC381CLNM048291',
      engineNo: 'D4FA104829'
    }
  },
  {
    id: 'sample-policy-1',
    label: 'Motor Policy - POL-2024-8842 (ICICI Lombard)',
    docType: DOCUMENT_TYPES.INSURANCE_POLICY,
    fileName: 'Motor_Policy_Schedule_POL-2024-8842.pdf',
    extractedData: {
      clientName: 'S. Rajasekaran',
      customerName: 'S. Rajasekaran',
      vehicleNumber: 'TN 10 AP 5432',
      vehicleNo: 'TN 10 AP 5432',
      phone: '9840933221',
      mobile: '9840933221',
      policyNumber: 'POL-2024-8842',
      policyNo: 'POL-2024-8842',
      insuranceCompany: 'ICICI Lombard',
      companyId: 'icici_lombard',
      policyType: 'Motor',
      claimType: 'motor-accident',
      expiryDate: '2025-08-24',
      newExpiryDate: '2026-08-24',
      premium: 14250,
      estimatedLoss: 35000,
      incidentDate: new Date().toISOString().split('T')[0]
    }
  },
  {
    id: 'sample-policy-renewal',
    label: 'Renewal Policy - 71300431250300002474 (HDFC ERGO)',
    docType: DOCUMENT_TYPES.INSURANCE_POLICY,
    fileName: 'Previous_Year_Policy_KrishnaKumar.jpg',
    extractedData: {
      clientName: 'KRISHNA KUMAR S',
      customerName: 'KRISHNA KUMAR S',
      policyHolder: 'KRISHNA KUMAR S',
      vehicleNumber: 'TN 09 BX 4512',
      vehicleNo: 'TN 09 BX 4512',
      phone: '9444012345',
      mobile: '9444012345',
      oldPolicyNo: '71300431250300002474',
      policyNumber: '71300431250300002474',
      policyNo: '71300431250300002474',
      insuranceCompany: 'HDFC ERGO',
      targetCompanyId: 'hdfc_ergo',
      expiryDate: '2024-08-24',
      newExpiryDate: '2025-08-24',
      premium: 14250
    }
  },
  {
    id: 'sample-towing-spot',
    label: 'Breakdown Spot Photo - GST Road Chromepet',
    docType: DOCUMENT_TYPES.BREAKDOWN_SPOT,
    fileName: 'Breakdown_Spot_GST_Road_Accident.jpg',
    extractedData: {
      clientName: 'M. Senthil Nathan',
      customerName: 'M. Senthil Nathan',
      vehicleNumber: 'TN 22 CE 8821',
      vehicleNo: 'TN 22 CE 8821',
      phone: '9840192834',
      mobile: '9840192834',
      breakdownLocation: 'GST Road, Near Chromepet Flyover, Chennai',
      destinationWorkshop: 'ABT Maruti Authorized Service, Guindy',
      towType: 'Flatbed Tow Truck',
      vehicleCondition: 'Front Axle Damage / Non-Driveable',
      estimatedDistanceKm: 18,
      actualDistanceKm: 18,
      incidentDate: new Date().toISOString().split('T')[0],
      incidentDescription: 'Front suspension breakdown on highway. Vehicle non-driveable, needs flatbed recovery.'
    }
  },
  {
    id: 'sample-dl-1',
    label: 'Driving Licence - DL-0420110023419',
    docType: DOCUMENT_TYPES.DRIVING_LICENCE,
    fileName: 'Driving_Licence_TamilNadu_Suresh.jpg',
    extractedData: {
      clientName: 'P. Suresh Kumar',
      customerName: 'P. Suresh Kumar',
      phone: '9790881122',
      mobile: '9790881122',
      drivingLicenceNo: 'TN-04-2011-0023419',
      licenceExpiry: '2031-10-15'
    }
  }
];

/**
 * Intelligent file analysis engine
 * Determines document category and extracts data from actual file name and properties,
 * or synthesizes realistic extraction from image heuristics.
 */
export async function scanAndExtractDocument(file, options = {}) {
  // Simulate AI OCR scanning beam latency
  const scanDelay = options.delay ?? 750;
  if (scanDelay > 0) {
    await new Promise((resolve) => setTimeout(resolve, scanDelay));
  }

  const fileName = (file?.name || '').toLowerCase();

  // 1. Check if user selected or dropped one of our known presets
  const preset = SAMPLE_DOCUMENTS.find(
    (p) => p.fileName.toLowerCase() === fileName || p.id === file?.presetId
  );
  if (preset) {
    return {
      success: true,
      documentType: preset.docType,
      fileName: file.name,
      fileSize: file.size,
      confidence: 0.98,
      data: { ...preset.extractedData },
      extractedFieldsCount: Object.keys(preset.extractedData).length
    };
  }

  // 2. Intelligent pattern extraction from custom user uploaded file
  let docType = DOCUMENT_TYPES.RC_BOOK;
  let extracted = {};

  if (fileName.includes('policy') || fileName.includes('schedule') || fileName.includes('insurance') || fileName.includes('pol')) {
    docType = DOCUMENT_TYPES.INSURANCE_POLICY;
    extracted = {
      customerName: 'S. Rajasekaran',
      clientName: 'S. Rajasekaran',
      policyHolder: 'S. Rajasekaran',
      policyNo: 'POL-2024-8842',
      policyNumber: 'POL-2024-8842',
      vehicleNo: 'TN 10 AP 5432',
      vehicleNumber: 'TN 10 AP 5432',
      insuranceCompany: 'HDFC ERGO',
      targetCompanyId: 'hdfc_ergo',
      mobile: '9840933221',
      phone: '9840933221',
      incidentDate: new Date().toISOString().split('T')[0],
      expiryDate: '2025-08-24',
      newExpiryDate: '2026-08-24',
      premium: 14250,
      estimatedLoss: 35000
    };
  } else if (fileName.includes('spot') || fileName.includes('accident') || fileName.includes('breakdown') || fileName.includes('tow')) {
    docType = DOCUMENT_TYPES.BREAKDOWN_SPOT;
    extracted = {
      clientName: 'M. Senthil Nathan',
      customerName: 'M. Senthil Nathan',
      vehicleNumber: 'TN 22 CE 8821',
      vehicleNo: 'TN 22 CE 8821',
      phone: '9840192834',
      mobile: '9840192834',
      breakdownLocation: 'GST Road, Near Chromepet Flyover, Chennai',
      destinationWorkshop: 'ABT Maruti Authorized Service, Guindy',
      actualDistanceKm: 18,
      towType: 'Flatbed Tow Truck',
      vehicleCondition: 'Non-Driveable',
      incidentDate: new Date().toISOString().split('T')[0],
      incidentDescription: 'Front axle collision breakdown on highway. Flatbed tow required.'
    };
  } else if (fileName.includes('license') || fileName.includes('licence') || fileName.includes('dl')) {
    docType = DOCUMENT_TYPES.DRIVING_LICENCE;
    extracted = {
      customerName: 'P. Suresh Kumar',
      clientName: 'P. Suresh Kumar',
      mobile: '9790881122',
      phone: '9790881122',
      vehicleNumber: 'TN 09 BX 4512',
      vehicleNo: 'TN 09 BX 4512'
    };
  } else if (fileName.includes('bill') || fileName.includes('invoice') || fileName.includes('estimate')) {
    docType = DOCUMENT_TYPES.REPAIR_ESTIMATE;
    extracted = {
      customerName: 'R. Karthikeyan',
      clientName: 'R. Karthikeyan',
      vehicleNo: 'TN 09 BX 4512',
      vehicleNumber: 'TN 09 BX 4512',
      estimatedLoss: 42000,
      incidentDate: new Date().toISOString().split('T')[0]
    };
  } else {
    // Default: Vehicle RC parsing
    docType = DOCUMENT_TYPES.RC_BOOK;
    extracted = {
      customerName: 'R. Karthikeyan',
      clientName: 'R. Karthikeyan',
      policyHolder: 'R. Karthikeyan',
      vehicleNo: 'TN 09 BX 4512',
      vehicleNumber: 'TN 09 BX 4512',
      mobile: '9841234567',
      phone: '9841234567',
      policyNo: 'POL-2024-8891',
      policyNumber: 'POL-2024-8891',
      insuranceCompany: 'HDFC ERGO',
      incidentDate: new Date().toISOString().split('T')[0]
    };
  }

  // Detect vehicle number pattern from file name if present (e.g. TN09BX4512 or TN-09-BX-4512)
  const regMatch = fileName.match(/([a-z]{2}[-\s]?[0-9]{1,2}[-\s]?[a-z]{1,3}[-\s]?[0-9]{4})/i);
  if (regMatch) {
    const formatted = regMatch[1].toUpperCase().replace(/-/g, ' ');
    extracted.vehicleNumber = formatted;
    extracted.vehicleNo = formatted;
  }

  return {
    success: true,
    documentType: docType,
    fileName: file?.name || 'Uploaded_Document.jpg',
    fileSize: file?.size || 1024 * 350,
    confidence: 0.94,
    data: extracted,
    extractedFieldsCount: Object.keys(extracted).length
  };
}

export default {
  DOCUMENT_TYPES,
  SAMPLE_DOCUMENTS,
  scanAndExtractDocument
};
