import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { Repository } from 'typeorm';
import { SearchPostDto } from '../post/dto/search-post.dto';
import { SearchUserDto } from './dto/search-user.dto';
import { Comment } from 'src/comment/entities/comment.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  async findAll() {
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndMapMany(
        'u.comments',
        Comment,
        'comment',
        'comment.userId = u.id',
      )
      .loadRelationCountAndMap('u.commentsCount', 'u.comments', 'comments')
      .getMany();

    return result.map((obj) => {
      delete obj.comments;
      return obj;
    });
  }

  findById(id: number) {
    return this.usersRepository.findOne(id);
  }

  findByCond(cond: LoginUserDto) {
    return this.usersRepository.findOne(cond);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(id, updateUserDto);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async search(dto: SearchUserDto) {
    const qb = await this.usersRepository.createQueryBuilder('u');
    qb.limit(dto.limit || 10);
    qb.offset(dto.offset || 0);

    if (dto.fullName) {
      qb.andWhere(`u.fullName ILIKE :fullName`);
    }

    if (dto.email) {
      qb.andWhere(`u.email ILIKE :email`);
    }

    qb.setParameters({
      email: `%${dto.email}%`,
      fullName: `%${dto.fullName}%`,
    });
    const [users, total] = await qb.getManyAndCount();
    return { users, total };
  }
}
