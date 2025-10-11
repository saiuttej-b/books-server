import { AdvanceTaxTypeOptions, InvoiceItemTaxRates } from '@app/core';
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

export class InvoiceItemPostDto {
  @ApiProperty({ default: 'Sample item details' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: '1234567890' })
  @Transform(({ value }: { value?: string | null }) => (value ? value.trim() : ''))
  @IsString()
  @IsOptional()
  sacNo?: string;

  @ApiProperty({ default: 1 })
  @Min(1)
  @IsNumber()
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
  @IsIn(Object.values(InvoiceItemTaxRates).map((rate) => rate.key))
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

export class InvoicePostDto {
  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  projectId?: string | null;

  @ApiProperty({ default: '' })
  @IsString()
  @IsNotEmpty()
  invoiceNo: string;

  @ApiProperty({ default: '2025-01-01' })
  @IsString()
  @IsNotEmpty()
  invoiceDate: string;

  @ApiProperty({ default: '2025-01-31' })
  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ default: AdvanceTaxTypeOptions.TDS })
  @IsIn(Object.values(AdvanceTaxTypeOptions))
  @IsString()
  @IsOptional()
  advanceTaxType?: string | null;

  @ValidateIf((o) => o.taxType)
  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  advanceTaxSubType?: string | null;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  advanceTaxRate: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  advanceTaxAmount: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  subTotal: number;

  @ApiProperty({ default: 0 })
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  totalAmount: number;

  @ApiProperty({ default: null })
  @IsString()
  @IsOptional()
  termsAndConditions?: string | null;

  @ApiProperty({ type: [InvoiceItemPostDto], default: [] })
  @IsNotEmpty({ each: true })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemPostDto)
  items: InvoiceItemPostDto[];

  @ApiProperty({ default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  contactPersonIds: string[];
}
