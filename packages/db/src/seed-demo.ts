import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("demo12345", 12);

  const owner = await prisma.user.create({
    data: { name: "Jamie Rivera", email: "demo@booksy.app", password },
  });

  const business = await prisma.business.create({
    data: { name: "Luna Hair & Beauty Studio", slug: "luna-hair-beauty-demo", type: "SALON" },
  });

  await prisma.businessMember.create({
    data: { userId: owner.id, businessId: business.id, role: "OWNER" },
  });

  const mainLocation = await prisma.location.create({
    data: {
      businessId: business.id,
      name: "Downtown Studio",
      address: "123 Queen St W",
      city: "Toronto",
      province: "ON",
      postalCode: "M5H 2M9",
      phone: "416-555-0101",
      email: "downtown@lunahair.demo",
    },
  });

  const uptownLocation = await prisma.location.create({
    data: {
      businessId: business.id,
      name: "Uptown Studio",
      address: "456 Yonge St",
      city: "Toronto",
      province: "ON",
      postalCode: "M4Y 1X3",
      phone: "416-555-0102",
      email: "uptown@lunahair.demo",
    },
  });

  const services = await Promise.all(
    [
      { name: "Haircut & Style", category: "Hair", duration: 45, price: "65.00" },
      { name: "Color & Highlights", category: "Hair", duration: 120, price: "180.00" },
      { name: "Blowout", category: "Hair", duration: 30, price: "45.00" },
      { name: "Classic Manicure", category: "Nails", duration: 40, price: "35.00" },
      { name: "Gel Pedicure", category: "Nails", duration: 50, price: "55.00" },
      { name: "Deep Tissue Massage", category: "Spa", duration: 60, price: "95.00" },
      { name: "Express Facial", category: "Spa", duration: 30, price: "60.00", isActive: false },
    ].map((s) =>
      prisma.service.create({
        data: { businessId: business.id, ...s },
      })
    )
  );

  const staffUsers = await Promise.all(
    [
      { name: "Avery Chen", email: "avery@lunahair.demo", bio: "Senior colorist, 8 years experience." },
      { name: "Morgan Lee", email: "morgan@lunahair.demo", bio: "Specializes in cuts and styling." },
      { name: "Sasha Patel", email: "sasha@lunahair.demo", bio: "Nail technician and spa specialist.", isActive: false },
    ].map(async (s) => {
      const user = await prisma.user.create({
        data: { name: s.name, email: s.email, password },
      });
      await prisma.businessMember.create({
        data: { userId: user.id, businessId: business.id, role: "STAFF" },
      });
      const staff = await prisma.staff.create({
        data: {
          userId: user.id,
          businessId: business.id,
          locationId: mainLocation.id,
          bio: s.bio,
          isActive: s.isActive ?? true,
        },
      });
      return { user, staff };
    })
  );

  const customers = await Promise.all(
    [
      { name: "Taylor Smith", email: "taylor.smith@example.com", phone: "416-555-0111" },
      { name: "Jordan Brooks", email: "jordan.brooks@example.com", phone: "416-555-0112" },
      { name: "Riley Nguyen", email: "riley.nguyen@example.com", phone: "416-555-0113", notes: "Prefers afternoon appointments" },
      { name: "Casey Martin", email: "casey.martin@example.com", phone: "416-555-0114" },
      { name: "Dana Wright", email: "dana.wright@example.com", phone: "416-555-0115", notes: "Allergic to certain hair dyes" },
    ].map((c) => prisma.customer.create({ data: { businessId: business.id, ...c } }))
  );

  const statuses = ["CONFIRMED", "PENDING", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const customer = customers[i % customers.length];
    const service = services[i % (services.length - 1)];
    const staffPick = staffUsers[i % staffUsers.length];
    const status = statuses[i % statuses.length];
    const dayOffset = i - 5;
    const startTime = new Date(now);
    startTime.setDate(startTime.getDate() + dayOffset);
    startTime.setHours(9 + (i % 8), i % 2 === 0 ? 0 : 30, 0, 0);
    const endTime = new Date(startTime.getTime() + service.duration * 60000);

    await prisma.appointment.create({
      data: {
        businessId: business.id,
        customerId: customer.id,
        serviceId: service.id,
        staffId: staffPick.staff.id,
        locationId: i % 3 === 0 ? uptownLocation.id : mainLocation.id,
        startTime,
        endTime,
        status,
        notes: i % 4 === 0 ? "First-time client" : null,
      },
    });
  }

  console.log("Demo business ID:", business.id);
  console.log("Demo login: demo@booksy.app / demo12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
