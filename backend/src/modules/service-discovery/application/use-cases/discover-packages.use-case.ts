import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { SERVICE_DISCOVERY_REPOSITORY } from '../../service-discovery.tokens';
import type {
  IServiceDiscoveryRepository,
  DiscoveredPackage,
} from '../ports/service-discovery.repository.port';

export interface DiscoverPackagesInput {
  species?: string;
  weight?: number;
}

@Injectable()
export class DiscoverPackagesUseCase {
  constructor(
    @Inject(SERVICE_DISCOVERY_REPOSITORY)
    private readonly discoveryRepository: IServiceDiscoveryRepository,
  ) {}

  async execute(input: DiscoverPackagesInput): Promise<DiscoveredPackage[]> {
    const species = input.species || 'Dog';
    const weight = input.weight !== undefined ? Number(input.weight) : 5.0;

    if (species.toLowerCase() !== 'dog' && species.toLowerCase() !== 'cat') {
      throw new BadRequestException('Loại thú cưng phải là Dog hoặc Cat.');
    }

    return this.discoveryRepository.findAvailablePackages(species, weight);
  }
}
