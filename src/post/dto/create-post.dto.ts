/* eslint-disable @typescript-eslint/ban-types */
import { IsArray, IsOptional, IsString } from 'class-validator';

export interface OutputBlockData {
  id?: string;
  type: 'paragraph' | string;
  data: any;
}

export class CreatePostDto {
  @IsString()
  title: string;

  @IsArray()
  body: OutputBlockData[];

  description: string;

  @IsOptional()
  @IsArray()
  tags: string;
}
