import { BadRequestException } from "@nestjs/common";

export function parseBigIntId(value: string, fieldName = "id") {
  if (!/^\d+$/.test(value)) {
    throw new BadRequestException(`${fieldName} 格式无效`);
  }

  return BigInt(value);
}

