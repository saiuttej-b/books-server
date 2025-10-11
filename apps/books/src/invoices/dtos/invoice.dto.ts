import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InvoicesGetDto {
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
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  projectId?: string | null;

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
