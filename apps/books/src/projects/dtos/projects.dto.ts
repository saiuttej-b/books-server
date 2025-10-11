import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ProjectUpdateDto {
  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}

export class ProjectCreateDto extends ProjectUpdateDto {
  @ApiProperty({ default: null })
  @IsString()
  @IsNotEmpty()
  clientId: string;
}

export class ProjectsGetDto {
  @ApiProperty({ required: false })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  search?: string | null;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean | null;

  @ApiProperty({ required: false })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  clientId?: string | null;

  @ApiProperty({ required: false })
  @Min(1)
  @IsNumber()
  @IsOptional()
  limit?: number | null;

  @ApiProperty({ required: false })
  @Min(0)
  @IsNumber()
  @IsOptional()
  skip?: number | null;
}
