import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, phone } = createUserDto;
    const userExists = await this.userModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (userExists) {
      throw new BadRequestException('Email or phone already exists');
    }

    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(
    page: number,
    skip: number,
    limit: number,
    status?: string,
  ): Promise<User[]> {
    const query: any = { isDeleted: false };

    if (status && ['active', 'inactive', 'banned'].includes(status)) {
      query.status = status;
    }

    return this.userModel.find(query).skip(skip).limit(limit).exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findOne({ _id: id, isDeleted: false })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, phone } = updateUserDto;
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (email && email !== user.email) {
      const emailExists = await this.userModel.findOne({ email });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (phone && phone.toString() !== user.phone.toString()) {
      const phoneExists = await this.userModel.findOne({ phone });
      if (phoneExists) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    Object.assign(user, updateUserDto);
    return user.save();
  }

  async remove(id: string): Promise<User> {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isDeleted = true;
    return user.save();
  }
}
