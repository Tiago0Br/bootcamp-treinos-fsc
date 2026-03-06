import { prisma } from '../lib/prisma.js'

interface InputDto {
  userId: string
}

interface OutputDto {
  userId: string
  userName: string
  weightInGrams: number
  heightInCentimeters: number
  age: number
  bodyFatPercentage: number
}

export class GetUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto | null> {
    const data = await prisma.userTrainData.findUnique({
      where: { userId: dto.userId },
      include: { user: true }
    })

    if (!data) return null

    return {
      userId: data.userId,
      userName: data.user.name,
      weightInGrams: data.weightInGrams,
      heightInCentimeters: data.heightInCentimeters,
      age: data.age,
      bodyFatPercentage: data.bodyFatPercentage
    }
  }
}
