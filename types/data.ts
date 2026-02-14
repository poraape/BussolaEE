// Tipos TypeScript: espelham os schemas de categorias.json, flows.json e rede.json.
export interface AppMeta {
  name: string;
  subtitle: string;
  badge: string;
}

export interface NavigationItem {
  id: 'dashboard' | 'decisor' | 'rede' | 'busca';
  label: string;
  icon: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface CategoriasData {
  app: AppMeta;
  navigation: NavigationItem[];
  categories: Category[];
}

export interface FlowOption {
  id: string;
  label: string;
  nextStepId: string | null;
  origin_ref: string;
}

export interface FlowStep {
  id: string;
  title: string;
  text: string;
  options: FlowOption[];
}

export interface FlowUI {
  progressTemplate: string;
  invalidOptionMessage: string;
  completedMessage: string;
}

export interface Flow {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  riskLevel: string;
  ui: FlowUI;
  initialStepId: string;
  steps: FlowStep[];
}

export interface RedeContact {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
  hours: string;
  notes: string;
  lat: number;
  lng: number;
}
