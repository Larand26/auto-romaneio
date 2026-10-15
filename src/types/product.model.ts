export interface Product {
  manufacturer_code: string;
  color_code: string;
  barcode: string;
  name: string;
  success?: boolean;
  position?: string;
  photo?: Buffer;
}
