import { Prisma, Role } from '@prisma/client';

export type UserSearchParams = {
  skip?: number;
  take?: number;
  cursor?: Prisma.UserWhereUniqueInput;
  where?: Prisma.UserWhereInput;
  orderBy?: Prisma.UserOrderByWithRelationInput;
};

export class UserDTO {
  id?: number;
  name: string;
  email: string;
  role: Role;
}

export class ActivityDTO {
  id?: number;
  title: string;
  details?: string;
  timestamp: Date;
  type: string;
  user: UserDTO;
  createdAt: Date;
  updatedAt: Date;
}
