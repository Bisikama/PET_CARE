import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service';
import { CreateMedicalRecordDto } from '../../dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, petId: string, dto: CreateMedicalRecordDto) {
    const pet = await this.prisma.pets.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.customer_id !== userId) {
      throw new ForbiddenException('You can only add medical records to your own pets');
    }

    const record = await this.prisma.pet_medical_records.create({
      data: {
        pet_id: petId,
        record_type: dto.recordType,
        description: dto.description,
        date: new Date(dto.date),
        attachments: dto.attachments ? dto.attachments : [],
      },
    });

    return record;
  }

  async findAllByPet(userId: string, petId: string) {
    const pet = await this.prisma.pets.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('Pet not found');
    }

    if (pet.customer_id !== userId) {
      throw new ForbiddenException('You can only view medical records of your own pets');
    }

    return this.prisma.pet_medical_records.findMany({
      where: { pet_id: petId },
      orderBy: { date: 'desc' },
    });
  }

  async delete(userId: string, recordId: string) {
    const record = await this.prisma.pet_medical_records.findUnique({
      where: { id: recordId },
      include: { pet: true },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.pet.customer_id !== userId) {
      throw new ForbiddenException('You can only delete medical records of your own pets');
    }

    await this.prisma.pet_medical_records.delete({
      where: { id: recordId },
    });

    return { message: 'Medical record deleted successfully' };
  }

  async update(userId: string, recordId: string, dto: CreateMedicalRecordDto) {
    const record = await this.prisma.pet_medical_records.findUnique({
      where: { id: recordId },
      include: { pet: true },
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    if (record.pet.customer_id !== userId) {
      throw new ForbiddenException('You can only update medical records of your own pets');
    }

    return this.prisma.pet_medical_records.update({
      where: { id: recordId },
      data: {
        record_type: dto.recordType,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
        attachments: dto.attachments !== undefined ? dto.attachments : undefined,
      },
    });
  }
}
