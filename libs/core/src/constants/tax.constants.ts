export const GSTTreatmentOptions = {
  REGISTERED_BUSINESS_REGULAR: {
    key: 'REGISTERED_BUSINESS_REGULAR',
    name: 'Registered Business - Regular',
    description: 'Business that is registered under GST',
  },
  REGISTERED_BUSINESS_COMPOSITION: {
    key: 'REGISTERED_BUSINESS_COMPOSITION',
    name: 'Registered Business - Composition',
    description: 'Business that is registered under composition scheme under GST',
  },
  UNREGISTERED_BUSINESS: {
    key: 'UNREGISTERED_BUSINESS',
    name: 'Unregistered Business',
    description: 'Business that is not registered under GST',
  },
  CONSUMER: {
    key: 'CONSUMER',
    name: 'Consumer',
    description: 'Consumer who is a regular end customer',
  },
  OVERSEAS: {
    key: 'OVERSEAS',
    name: 'Overseas',
    description: 'Customer from outside India',
  },
};

export const AdvanceTaxTypeOptions = {
  TDS: 'TDS',
  TCS: 'TCS',
};

export const AdvanceTaxSubTypeOptions = [
  {
    key: 'PROFESSIONAL_FEES_10',
    name: 'Professional Fees [10%]',
    rate: 10,
    type: AdvanceTaxTypeOptions.TDS,
  },
];

export type InvoiceItemTaxRateType = {
  key: string;
  name: string;
  description?: string;
  rate: number;
  group?: string;
};

export const InvoiceItemTaxRates = {
  NON_TAXABLE: {
    key: 'NON_TAXABLE',
    name: 'Non-Taxable',
    rate: 0,
  },
  OUT_OF_SCOPE: {
    key: 'OUT_OF_SCOPE',
    name: 'Out of Scope',
    description: "Supplies on which you don't charge any GST or include them in returns",
    rate: 0,
  },
  NON_GST_SUPPLY: {
    key: 'NON_GST_SUPPLY',
    name: 'Non-GST Supply',
    description: 'Supplies which do not come under GST such as Petroleum products and Liquor',
    rate: 0,
  },
  GST_0: {
    key: 'GST_0',
    name: 'GST0 [0%]',
    rate: 0,
    group: 'Tax Group',
  },
  GST_5: {
    key: 'GST_5',
    name: 'GST5 [5%]',
    rate: 5,
    group: 'Tax Group',
  },
  GST_12: {
    key: 'GST_12',
    name: 'GST12 [12%]',
    rate: 12,
    group: 'Tax Group',
  },
  GST_18: {
    key: 'GST_18',
    name: 'GST18 [18%]',
    rate: 18,
    group: 'Tax Group',
  },
  GST_28: {
    key: 'GST_28',
    name: 'GST28 [28%]',
    rate: 28,
    group: 'Tax Group',
  },
};
