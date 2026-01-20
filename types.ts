
export interface W9Data {
  fileName: string;
  businessName: string;
  disregardedEntityName: string;
  taxClassification: string;
  otherClassification: string;
  address: string;
  cityStateZip: string;
  tin: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  total: number;
  results: W9Data[];
}
