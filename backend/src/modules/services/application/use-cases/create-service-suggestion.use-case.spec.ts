import { Test, TestingModule } from '@nestjs/testing';
import { CreateServiceSuggestionUseCase } from './create-service-suggestion.use-case';
import { PrismaService } from '../../../../database/prisma.service';
import { support_ticket_category } from '@prisma/client';

describe('CreateServiceSuggestionUseCase', () => {
  let useCase: CreateServiceSuggestionUseCase;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateServiceSuggestionUseCase,
        {
          provide: PrismaService,
          useValue: {
            support_tickets: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateServiceSuggestionUseCase>(CreateServiceSuggestionUseCase);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a support ticket for service suggestion (Happy Path)', async () => {
    const userId = 'user-1';
    const dto = {
      serviceName: 'Snake Grooming',
      description: 'Grooming for my snake',
    };

    (prismaService.support_tickets.create as jest.Mock).mockResolvedValue({ id: 'ticket-1' });

    const result = await useCase.execute(userId, dto);

    expect(prismaService.support_tickets.create).toHaveBeenCalledWith({
      data: {
        user_id: userId,
        category: support_ticket_category.SERVICE_SUGGESTION,
        title: `Service Suggestion: ${dto.serviceName}`,
        description: `Suggested Service: ${dto.serviceName}\nDescription: ${dto.description}`,
      },
    });

    expect(result).toEqual({
      message: 'Thank you for your suggestion! We have recorded it as a support ticket.',
      ticketId: 'ticket-1',
    });
  });
});
