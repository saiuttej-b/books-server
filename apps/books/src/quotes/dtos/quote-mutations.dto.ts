import { InvoiceItemTaxRates, TaxTypeOptions } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class QuoteItemPostDto {
  @ApiProperty({ default: 'Sample item details' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: '1234567890' })
  @Transform(({ value }: { value?: string | null }) => (value ? value.trim() : null))
  @IsString()
  @IsOptional()
  sacNo?: string | null;

  @ApiProperty({ default: 1 })
  @Min(1)
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ default: 100.0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  unitPrice: number;

  @ApiProperty({ default: 100.0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  price: number;

  @ApiProperty({ default: InvoiceItemTaxRates.GST_18.key })
  @IsIn(Object.keys(InvoiceItemTaxRates))
  @IsString()
  @IsNotEmpty()
  taxRate: string;

  @ApiProperty({ default: 18 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  taxRateValue: number;

  @ApiProperty({ default: 18 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  taxAmount: number;

  @ApiProperty({ default: 118.0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalAmount: number;
}

export class QuotePostDto {
  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  quoteNo: string;

  @ApiProperty({ default: '2025-01-01' })
  @IsString()
  @IsNotEmpty()
  issueDate: string;

  @ApiProperty({ default: '2025-01-31' })
  @IsString()
  @IsOptional()
  expiryDate?: string | null;

  @ApiProperty({ default: TaxTypeOptions.TDS })
  @IsIn(Object.values(TaxTypeOptions))
  @IsString()
  @IsOptional()
  taxType?: string | null;

  @ValidateIf((o) => o.taxType)
  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  taxSubType?: string | null;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  taxRate: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  taxAmount: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  termsAndConditions?: string | null;

  @ApiProperty({ type: [QuoteItemPostDto], default: [] })
  @IsNotEmpty({ each: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => QuoteItemPostDto)
  items: QuoteItemPostDto[];

  @ApiProperty({ default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  contactPersonIds: string[];
}
