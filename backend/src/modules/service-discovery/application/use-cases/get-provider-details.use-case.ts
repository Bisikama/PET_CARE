import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';

@Injectable()
export class GetProviderDetailsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(providerId: string) {
    const provider = await this.prisma.provider_profiles.findUnique({
      where: {
        id: providerId,
      },
      include: {
        users: {
          select: {
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Không tìm thấy thông tin đối tác');
    }

    // Safely query services, working days, and badges if models exist
    const [services, workingDays, trustBadges] = await Promise.all([
      this.prisma.provider_services?.findMany
        ? this.prisma.provider_services.findMany({
            where: { provider_id: provider.id, is_active: true },
            include: { services: true },
          }).catch(() => [])
        : Promise.resolve([]),
      this.prisma.provider_working_days?.findMany
        ? this.prisma.provider_working_days.findMany({
            where: { provider_id: provider.id },
            include: { provider_working_slots: { include: { time_slots: true } } },
            orderBy: { work_date: 'asc' },
            take: 7,
          }).catch(() => [])
        : Promise.resolve([]),
      this.prisma.provider_trust_badges?.findMany
        ? this.prisma.provider_trust_badges.findMany({
            where: { provider_id: provider.id },
            include: { trust_badges: true },
          }).catch(() => [])
        : Promise.resolve([]),
    ]);

    return {
      id: provider.id,
      userId: provider.user_id,
      fullName: (provider.users as any)?.fullName || 'Chuyên viên PetCare',
      avatarUrl: (provider.users as any)?.avatarUrl || null,
      coverUrl: null,
      bio: provider.bio || 'Chuyên viên chăm sóc thú cưng tận tâm và chuyên nghiệp.',
      rating: provider.rating_avg ? Number(provider.rating_avg) : 5.0,
      totalReviews: provider.total_reviews || 0,
      baseAddress: provider.base_formatted || provider.base_address_line || 'TP. Hồ Chí Minh',
      yearsExperience: provider.experience_years || 2,
      completedJobs: provider.total_completed_bookings || 0,
      trustScore: provider.trust_score || 100,
      providerType: provider.provider_type,
      services: (services || []).map((ps: any) => ({
        id: ps.id,
        serviceId: ps.service_id,
        name: ps.services?.name || 'Dịch vụ chăm sóc',
        category: ps.services?.category || 'Chăm sóc',
        price: Number(ps.price),
        petSpecies: ps.pet_species,
        minWeight: ps.min_weight ? Number(ps.min_weight) : 0,
        maxWeight: ps.max_weight ? Number(ps.max_weight) : 100,
        customDescription: ps.custom_description,
      })),
      workingDays: (workingDays || []).map((wd: any) => {
        const dateObj = new Date(wd.work_date);
        const dayOfWeek = isNaN(dateObj.getDay()) ? 1 : dateObj.getDay();
        const slots = (wd.provider_working_slots || [])
          .map((slot: any) => ({
            id: slot.id,
            startTime: slot.time_slots?.start_time || '08:00',
            endTime: slot.time_slots?.end_time || '18:00',
            status: slot.status,
          }))
          .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
        return {
          dayOfWeek,
          isActive: slots.length > 0,
          slots,
        };
      }),
      trustBadges: (trustBadges || []).map((tb: any) => ({
        id: tb.id,
        badgeName: tb.trust_badges?.name || 'Chứng nhận an toàn',
        badgeIcon: tb.trust_badges?.code || 'SHIELD',
      })),
    };
  }
}

