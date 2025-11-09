import { CustomerTypes, GSTTreatmentOptions, SalutationOptions } from '@app/core';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AddressPostDto {
  @ApiProperty({ default: 'Mr. John Doe' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  attention?: string | null;

  @ApiProperty({ default: '123, Main Street' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  street1?: string | null;

  @ApiProperty({ default: 'Apt 4B' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  street2?: string | null;

  @ApiProperty({ default: 'New York' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  city?: string | null;

  @ApiProperty({ default: 'NY' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  state?: string | null;

  @ApiProperty({ default: 'USA' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  country?: string | null;

  @ApiProperty({ default: '10001' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  pinCode?: string | null;

  @ApiProperty({ default: '+1-123-456-7890' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  faxNumber?: string | null;
}

export class ClientContactPersonPostDto {
  @ApiProperty({ default: '' })
  @IsString()
  @IsOptional()
  id?: string | null;

  @ApiProperty({ default: '' })
  @IsIn(Object.values(SalutationOptions))
  @IsString()
  salutation: string;

  @ApiProperty({ default: 'John' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ default: 'Doe' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({ default: 'john.doe@example.com' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({ default: 'IN' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  mobileCountryCode?: string | null;

  @ApiProperty({ default: '9876543210' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  mobile?: string | null;

  @ApiProperty({ default: 'IN' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  workPhoneCountryCode?: string | null;

  @ApiProperty({ default: '0123456789' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  workPhone?: string | null;

  @ApiProperty({ default: false })
  @IsBoolean()
  @IsNotEmpty()
  isPrimaryContact: boolean;

  @ApiProperty({ default: 'Manager' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  designation?: string | null;

  @ApiProperty({ default: 'Manager' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  department?: string | null;
}

export class ClientPostDto {
  @ApiProperty({ default: CustomerTypes.BUSINESS })
  @IsIn(Object.values(CustomerTypes))
  @IsString()
  @IsNotEmpty()
  customerType: string;

  @ApiProperty({ default: 'TATA Groups' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ default: 'TATA Groups' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ default: 'info@tata.com' })
  @Transform(({ value }: { value?: string | null }) => value?.toLowerCase()?.trim())
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({ default: 'IN' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  mobileCountryCode?: string | null;

  @ApiProperty({ default: '9876543210' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  mobile?: string | null;

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty({ default: GSTTreatmentOptions.REGISTERED_BUSINESS_REGULAR.key })
  @IsIn(Object.keys(GSTTreatmentOptions))
  @IsString()
  @IsNotEmpty()
  treatmentOption: string;

  @ApiProperty({ default: '22AAAAA0000A1Z5' })
  @Transform(({ value }: { value?: string | null }) => value?.toUpperCase()?.trim())
  @IsString()
  @IsOptional()
  gstin?: string | null;

  @ApiProperty({ default: 'AAAAA0000A' })
  @Transform(({ value }: { value?: string | null }) => value?.toUpperCase()?.trim())
  @IsString()
  @IsOptional()
  pan?: string | null;

  @ApiProperty({ default: 'TS' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  placeOfSupply?: string | null;

  @ApiProperty({ default: 'TATA Sons Pvt Ltd' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  businessLegalName?: string | null;

  @ApiProperty({ default: 'TATA' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  businessTradeName?: string | null;

  @ApiProperty({ default: 'This is a good client' })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  remarks?: string | null;

  @ApiProperty({ type: AddressPostDto, required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressPostDto)
  billingAddress: AddressPostDto;

  @ApiProperty({ type: AddressPostDto, required: true })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressPostDto)
  shippingAddress: AddressPostDto;

  @ApiProperty({ type: [ClientContactPersonPostDto] })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ClientContactPersonPostDto)
  contactPersons: ClientContactPersonPostDto[];
}

export class GetClientsDto {
  @ApiProperty({ required: false })
  @Transform(({ value }: { value?: string | null }) => value?.trim())
  @IsString()
  @IsOptional()
  search?: string | null;

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
