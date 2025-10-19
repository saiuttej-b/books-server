import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ExpenseTypePostDto {
  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
