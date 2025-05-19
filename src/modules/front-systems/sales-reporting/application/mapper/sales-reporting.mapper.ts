import { SalesReportingResponseDto } from '../dto/sales-reporting-response.dto';

export function mapToSalesReportingDto(entry: any): SalesReportingResponseDto {
  return {
    saleId: entry.SALEID,
    sid: entry.SID,
    personId: entry.PERSONID_FK,
    posId: entry.POSID_FK,
    storeId: entry.STOREID_FK,
    companyId: entry.COMPANYID_FK,
    customerId: entry.CUSTOMERID_FK,
    saleDateTime: entry.SaleDateTime,
    total: entry.Total,
  };
} 