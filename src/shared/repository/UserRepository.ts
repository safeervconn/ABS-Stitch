import { BaseRepository } from './BaseRepository';
import { supabase } from '../../lib/supabase';

export interface User {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  phone?: string;
  created_at: string;
}

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    return { data, error };
  }

  async findByRole(role: string) {
    return this.findWhere('role', role, {
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async updateRole(id: string, role: string) {
    return this.update(id, { role } as Partial<User>);
  }

  async updateProfile(id: string, profile: Partial<User>) {
    return this.update(id, profile);
  }

  async countByRole(role: string) {
    return this.count({ field: 'role', value: role });
  }
}

export const userRepository = new UserRepository();
