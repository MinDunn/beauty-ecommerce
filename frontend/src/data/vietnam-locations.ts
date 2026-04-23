export interface Location {
  id: string;
  name: string;
  type: 'CITY' | 'PROVINCE';
}

export const VIETNAM_LOCATIONS: Location[] = [
  // 6 Thành phố trực thuộc Trung ương
  { id: 'HN', name: 'Thành phố Hà Nội', type: 'CITY' },
  { id: 'HCM', name: 'Thành phố Hồ Chí Minh', type: 'CITY' },
  { id: 'HP', name: 'Thành phố Hải Phòng', type: 'CITY' },
  { id: 'DN', name: 'Thành phố Đà Nẵng', type: 'CITY' },
  { id: 'CT', name: 'Thành phố Cần Thơ', type: 'CITY' },
  { id: 'HUE', name: 'Thành phố Huế', type: 'CITY' },

  // 28 Tỉnh sau sáp nhập 2025
  { id: 'CB', name: 'Tỉnh Cao Bằng', type: 'PROVINCE' },
  { id: 'DB', name: 'Tỉnh Điện Biên', type: 'PROVINCE' },
  { id: 'HT', name: 'Tỉnh Hà Tĩnh', type: 'PROVINCE' },
  { id: 'LC', name: 'Tỉnh Lai Châu', type: 'PROVINCE' },
  { id: 'LS', name: 'Tỉnh Lạng Sơn', type: 'PROVINCE' },
  { id: 'NA', name: 'Tỉnh Nghệ An', type: 'PROVINCE' },
  { id: 'QN', name: 'Tỉnh Quảng Ninh', type: 'PROVINCE' },
  { id: 'SL', name: 'Tỉnh Sơn La', type: 'PROVINCE' },
  { id: 'TH', name: 'Tỉnh Thanh Hóa', type: 'PROVINCE' },
  { id: 'TQ', name: 'Tỉnh Tuyên Quang', type: 'PROVINCE' },
  { id: 'LCA', name: 'Tỉnh Lào Cai', type: 'PROVINCE' },
  { id: 'TN', name: 'Tỉnh Thái Nguyên', type: 'PROVINCE' },
  { id: 'PT', name: 'Tỉnh Phú Thọ', type: 'PROVINCE' },
  { id: 'BN', name: 'Tỉnh Bắc Ninh', type: 'PROVINCE' },
  { id: 'HY', name: 'Tỉnh Hưng Yên', type: 'PROVINCE' },
  { id: 'NB', name: 'Tỉnh Ninh Bình', type: 'PROVINCE' },
  { id: 'QT', name: 'Tỉnh Quảng Trị', type: 'PROVINCE' },
  { id: 'QNG', name: 'Tỉnh Quảng Ngãi', type: 'PROVINCE' },
  { id: 'GL', name: 'Tỉnh Gia Lai', type: 'PROVINCE' },
  { id: 'KH', name: 'Tỉnh Khánh Hòa', type: 'PROVINCE' },
  { id: 'LD', name: 'Tỉnh Lâm Đồng', type: 'PROVINCE' },
  { id: 'DL', name: 'Tỉnh Đắk Lắk', type: 'PROVINCE' },
  { id: 'DON', name: 'Tỉnh Đồng Nai', type: 'PROVINCE' },
  { id: 'TNIN', name: 'Tỉnh Tây Ninh', type: 'PROVINCE' },
  { id: 'VL', name: 'Tỉnh Vĩnh Long', type: 'PROVINCE' },
  { id: 'DT', name: 'Tỉnh Đồng Tháp', type: 'PROVINCE' },
  { id: 'CM', name: 'Tỉnh Cà Mau', type: 'PROVINCE' },
  { id: 'AG', name: 'Tỉnh An Giang', type: 'PROVINCE' }
];
