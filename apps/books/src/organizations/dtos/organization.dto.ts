import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class OrganizationPostDto {
  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  @ApiProperty({ default: '' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;
}
