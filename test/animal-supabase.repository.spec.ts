import { ConfigService } from '@nestjs/config';
import { AnimalSupabaseRepository } from '../src/infrastructure/persistence/supabase/repositories/animal-supabase';

describe('AnimalSupabaseRepository', () => {
  it('excluye animales archivados del listado admin', async () => {
    const queryBuilder = {
      select: jest.fn(),
      neq: jest.fn(),
      order: jest.fn(),
      range: jest.fn(),
      returns: jest.fn(),
    };

    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.neq.mockReturnValue(queryBuilder);
    queryBuilder.order.mockReturnValue(queryBuilder);
    queryBuilder.range.mockReturnValue(queryBuilder);
    queryBuilder.returns.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    });

    const supabase = {
      from: jest.fn().mockReturnValue(queryBuilder),
    };

    const repository = new AnimalSupabaseRepository(
      supabase as never,
      new ConfigService(),
    );

    await repository.findAdminAnimals({ page: 1, limit: 10 });

    expect(supabase.from).toHaveBeenCalledWith('animals');
    expect(queryBuilder.neq).toHaveBeenCalledWith('status', 'archivado');
  });
});
