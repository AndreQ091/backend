import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  create(createCommentDto: CreateCommentDto, userId: number) {
    return this.commentRepository.save({
      text: createCommentDto.text,
      post: { id: createCommentDto.postId },
      user: { id: userId },
    });
  }

  async findAll(postId: number) {
    const qb = this.commentRepository.createQueryBuilder('c');
    if (postId) {
      qb.where('c.postId = :postId', { postId });
    }
    const result = await qb
      .leftJoinAndSelect('c.post', 'post')
      .leftJoinAndSelect('c.user', 'user')
      .getMany();

    return result.map((obj) => {
      return {
        ...obj,
        post: { id: obj.post.id, title: obj.post.title },
      };
    });
  }

  findOne(id: number) {
    return this.commentRepository.findOne(id);
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return this.commentRepository.update(id, updateCommentDto);
  }

  remove(id: number) {
    return this.commentRepository.delete(id);
  }
}
