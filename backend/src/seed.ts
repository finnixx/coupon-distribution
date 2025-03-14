import { PrismaClient } from "@prisma/client";
import voucher_codes from "voucher-code-generator";

const prisma = new PrismaClient();


async function main() {
  const coupons = voucher_codes.generate({
    length: 5,
    count: 10,
    charset: voucher_codes.charset("alphabetic")
  });

  for (const code of coupons) {
    await prisma.coupon.create({ data: { code } });
  }

  console.log("Coupons generated and saved!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
