export type UserStatus =
  | 'filled'
  | 'vacant'
  | 'recruiting';

export type User = {
  id: string;
  name: string;
  role: string;
  image?: string;

  occupied: number;
  total: number;

  status?: UserStatus;

  department?: string;
  location?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  dateOfJoining?: string;
  reportsTo?: string;
  employmentType?: string;

  position?: {
    x: number;
    y: number;
  };

  onClick?: (user: User) => void;
};