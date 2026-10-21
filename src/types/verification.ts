export interface StudentIdVerification {
  id: string; // e.g. 'sid-1729500000000-abcd'
  userId: string;
  username: string;
  displayName: string;
  email: string;
  collegeName: string;
  studentRollNumber: string;
  idCardImage: string; // Compressed Base64 data URL or public URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO string
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface StudentIdVerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
