import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { SearchPostDto } from './dto/search-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto, userId: number) {
    const description = createPostDto.body.find(
      (obj) => obj.type === 'paragraph',
    )?.data?.text;
    return this.postRepository.save({
      title: createPostDto.title,
      body: createPostDto.body,
      tags: createPostDto.tags,
      description: description || '',
      user: { id: userId },
    });
  }

  findAll() {
    return this.postRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ id });
    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }

    await this.postRepository
      .createQueryBuilder('posts')
      .whereInIds(id)
      .update()
      .set({ views: () => 'views + 1' })
      .execute();

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const description = updatePostDto.body.find(
      (obj) => obj.type === 'paragraph',
    )?.data?.text;
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }
    return this.postRepository.update(
      { id },
      {
        title: updatePostDto.title,
        body: updatePostDto.body,
        tags: updatePostDto.tags,
        description: description || '',
        user: { id: userId },
      },
    );
  }

  async remove(id: number, userId: number) {
    const post = await this.postRepository.findOne(id);
    if (!post) {
      throw new NotFoundException('Статья не найдена');
    }
    if (post.user.id !== userId) {
      throw new ForbiddenException('Нет доступа');
    }
    return this.postRepository.delete(id);
  }

  async getPopular() {
    const qb = await this.postRepository.createQueryBuilder('posts');
    qb.orderBy('views', 'DESC');
    qb.limit(10);
    const [posts, total] = await qb.getManyAndCount();
    return { posts, total };
  }

  async search(dto: SearchPostDto) {
    const qb = await this.postRepository.createQueryBuilder('p');
    qb.limit(dto.limit || 10);
    qb.offset(dto.offset || 0);

    if (dto.views) {
      qb.orderBy('views', dto.views);
    }

    if (dto.body) {
      qb.andWhere(`p.body ILIKE :body`);
    }

    if (dto.title) {
      qb.andWhere(`p.title ILIKE :title`);
    }

    if (dto.tag) {
      qb.andWhere(`p.tag ILIKE :tag`);
    }

    qb.setParameters({
      title: `%${dto.title}%`,
      body: `%${dto.body}%`,
      tag: `%${dto.tag}%`,
    });
    const [posts, total] = await qb.getManyAndCount();
    return { posts, total };
  }
}
