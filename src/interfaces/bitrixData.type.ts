import { IBitrixUser } from '@/interfaces/bitrixUser.type';

export interface IBitrixData {
  user: IBitrixUser | null;
  loading: boolean;
  error: string | null;
}