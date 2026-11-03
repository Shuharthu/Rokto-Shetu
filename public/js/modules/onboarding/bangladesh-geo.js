/**
 * @file bangladesh-geo.js
 * @description Administrative divisions, districts, and upazilas of Bangladesh.
 */

export const BANGLADESH_DIVISIONS = [
  { id: 'chattogram', nameEN: 'Chattogram', nameBN: 'চট্টগ্রাম' },
  { id: 'dhaka', nameEN: 'Dhaka', nameBN: 'ঢাকা' },
  { id: 'rajshahi', nameEN: 'Rajshahi', nameBN: 'রাজশাহী' },
  { id: 'khulna', nameEN: 'Khulna', nameBN: 'খুলনা' },
  { id: 'barishal', nameEN: 'Barishal', nameBN: 'বরিশাল' },
  { id: 'sylhet', nameEN: 'Sylhet', nameBN: 'সিলেট' },
  { id: 'rangpur', nameEN: 'Rangpur', nameBN: 'রংপুর' },
  { id: 'mymensingh', nameEN: 'Mymensingh', nameBN: 'ময়মনসিংহ' }
];

export const BANGLADESH_DISTRICTS = {
  chattogram: [
    { id: 'ctg', nameEN: 'Chattogram', nameBN: 'চট্টগ্রাম' },
    { id: 'cox', nameEN: "Cox's Bazar", nameBN: 'কক্সবাজার' },
    { id: 'cumilla', nameEN: 'Cumilla', nameBN: 'কুমিল্লা' },
    { id: 'feni', nameEN: 'Feni', nameBN: 'ফেনী' },
    { id: 'noakhali', nameEN: 'Noakhali', nameBN: 'নোয়াখালী' },
    { id: 'brahmanbaria', nameEN: 'Brahmanbaria', nameBN: 'ব্রাহ্মণবাড়িয়া' }
  ],
  dhaka: [
    { id: 'dhaka', nameEN: 'Dhaka', nameBN: 'ঢাকা' },
    { id: 'gazipur', nameEN: 'Gazipur', nameBN: 'গাজীপুর' },
    { id: 'narayanganj', nameEN: 'Narayanganj', nameBN: 'নারায়ণগঞ্জ' },
    { id: 'tangail', nameEN: 'Tangail', nameBN: 'টাঙ্গাইল' },
    { id: 'faridpur', nameEN: 'Faridpur', nameBN: 'ফরিদপুর' }
  ],
  rajshahi: [
    { id: 'rajshahi', nameEN: 'Rajshahi', nameBN: 'রাজশাহী' },
    { id: 'bogura', nameEN: 'Bogura', nameBN: 'বগুড়া' },
    { id: 'pabna', nameEN: 'Pabna', nameBN: 'পাবনা' }
  ],
  khulna: [
    { id: 'khulna', nameEN: 'Khulna', nameBN: 'খুলনা' },
    { id: 'jashore', nameEN: 'Jashore', nameBN: 'যশোর' },
    { id: 'kushtia', nameEN: 'Kushtia', nameBN: 'কুষ্টিয়া' }
  ],
  barishal: [
    { id: 'barishal', nameEN: 'Barishal', nameBN: 'বরিশাল' },
    { id: 'patuakhali', nameEN: 'Patuakhali', nameBN: 'পটুয়াখালী' }
  ],
  sylhet: [
    { id: 'sylhet', nameEN: 'Sylhet', nameBN: 'সিলেট' },
    { id: 'moulvibazar', nameEN: 'Moulvibazar', nameBN: 'মৌলভীবাজার' },
    { id: 'habiganj', nameEN: 'Habiganj', nameBN: 'হবিগঞ্জ' }
  ],
  rangpur: [
    { id: 'rangpur', nameEN: 'Rangpur', nameBN: 'রংপুর' },
    { id: 'dinajpur', nameEN: 'Dinajpur', nameBN: 'দিনাজপুর' }
  ],
  mymensingh: [
    { id: 'mymensingh', nameEN: 'Mymensingh', nameBN: 'ময়মনসিংহ' },
    { id: 'jamalpur', nameEN: 'Jamalpur', nameBN: 'জামালপুর' }
  ]
};

export const BANGLADESH_UPAZILAS = {
  ctg: [
    { id: 'panchlaish', nameEN: 'Panchlaish', nameBN: 'পাঁচলাইশ' },
    { id: 'kotwali_ctg', nameEN: 'Kotwali', nameBN: 'কোতোয়ালী' },
    { id: 'halishahar', nameEN: 'Halishahar', nameBN: 'হালিশহর' },
    { id: 'chandgaon', nameEN: 'Chandgaon', nameBN: 'চান্দগাঁও' },
    { id: 'hathazari', nameEN: 'Hathazari', nameBN: 'হাটহাজারী' },
    { id: 'sitakunda', nameEN: 'Sitakunda', nameBN: 'সীতাকুণ্ড' }
  ],
  dhaka: [
    { id: 'dhanmondi', nameEN: 'Dhanmondi', nameBN: 'ধানমন্ডি' },
    { id: 'gulshan', nameEN: 'Gulshan', nameBN: 'গুলশান' },
    { id: 'mirpur', nameEN: 'Mirpur', nameBN: 'মিরপুর' },
    { id: 'uttara', nameEN: 'Uttara', nameBN: 'উত্তরা' },
    { id: 'motijheel', nameEN: 'Motijheel', nameBN: 'মতিঝিল' },
    { id: 'mohammadpur', nameEN: 'Mohammadpur', nameBN: 'মোহাম্মদপুর' }
  ]
};
