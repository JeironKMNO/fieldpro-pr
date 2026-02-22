import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Find existing org and user
  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error("No organization found. Log in to the app first.");
    process.exit(1);
  }
  console.log(`Organization: ${org.name} (${org.id})`);

  const user = await prisma.user.findFirst({
    where: { organizationId: org.id },
  });
  if (!user) {
    console.error("No user found.");
    process.exit(1);
  }
  console.log(`User: ${user.firstName} ${user.lastName} (${user.id})`);

  // 2. Create a test client
  const client = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: "Carlos Rivera — Residencia Dorado",
      email: "carlos.rivera@email.com",
      phone: "787-555-0142",
      type: "RESIDENTIAL",
      status: "ACTIVE",
      addresses: {
        create: {
          street: "123 Calle Palma Real",
          city: "Dorado",
          state: "PR",
          zipCode: "00646",
          country: "US",
        },
      },
    },
  });
  console.log(`Client created: ${client.name} (${client.id})`);

  // 3. Get or create categories
  const categoryNames = [
    "Demolicion",
    "Estructura",
    "Plomeria",
    "Electrico",
    "Piso",
    "Pintura",
  ];

  const categories: Record<string, string> = {};
  for (const name of categoryNames) {
    const cat = await prisma.quoteCategory.upsert({
      where: {
        organizationId_name: { organizationId: org.id, name },
      },
      update: {},
      create: {
        organizationId: org.id,
        name,
        sortOrder: categoryNames.indexOf(name),
      },
    });
    categories[name] = cat.id;
  }
  console.log(`Categories ready: ${Object.keys(categories).join(", ")}`);

  // 4. Create quote with counter
  const counter = await prisma.quoteCounter.upsert({
    where: { organizationId: org.id },
    update: { lastNumber: { increment: 1 } },
    create: { organizationId: org.id, lastNumber: 1 },
  });
  const quoteNumber = `QT-${String(counter.lastNumber).padStart(3, "0")}`;

  const quote = await prisma.quote.create({
    data: {
      organizationId: org.id,
      clientId: client.id,
      createdById: user.id,
      quoteNumber,
      title: "Remodelación Terraza y Patio — Residencia Dorado",
      taxRate: 0.115,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes:
        "Proyecto incluye demolición de terraza existente, nueva losa de concreto, instalación de piso porcelánico, plomería para fregadero exterior, iluminación LED y pintura completa.",
    },
  });
  console.log(`Quote created: ${quoteNumber} (${quote.id})`);

  // 5. Add sections and items
  const sections = [
    {
      category: "Demolicion",
      items: [
        {
          description: "Demolición de losa existente (terraza)",
          unitType: "SQ_FT" as const,
          length: 20,
          width: 15,
          quantity: 300,
          unitPrice: 3.5,
          markupPct: 25,
        },
        {
          description: "Remoción de escombros y disposición",
          unitType: "LUMP_SUM" as const,
          quantity: 1,
          unitPrice: 450,
          markupPct: 20,
        },
      ],
    },
    {
      category: "Estructura",
      items: [
        {
          description: "Losa de concreto 4\" con malla electrosoldada",
          unitType: "SQ_FT" as const,
          length: 20,
          width: 15,
          quantity: 300,
          unitPrice: 12.5,
          markupPct: 20,
        },
        {
          description: "Columnas de soporte 6x6 concreto (4 unidades)",
          unitType: "UNIT" as const,
          quantity: 4,
          unitPrice: 350,
          markupPct: 25,
        },
        {
          description: "Techo de pérgola aluminio 20x12",
          unitType: "SQ_FT" as const,
          length: 20,
          width: 12,
          quantity: 240,
          unitPrice: 18,
          markupPct: 15,
        },
      ],
    },
    {
      category: "Plomeria",
      items: [
        {
          description: "Instalación fregadero exterior con línea de agua",
          unitType: "LUMP_SUM" as const,
          quantity: 1,
          unitPrice: 850,
          markupPct: 20,
        },
        {
          description: "Drenaje pluvial PVC 4\" con trampa de grasa",
          unitType: "LINEAR_FT" as const,
          quantity: 25,
          unitPrice: 15,
          markupPct: 20,
        },
      ],
    },
    {
      category: "Electrico",
      items: [
        {
          description: "Panel sub-eléctrico 100A para terraza",
          unitType: "UNIT" as const,
          quantity: 1,
          unitPrice: 650,
          markupPct: 20,
        },
        {
          description: "Iluminación LED empotrada (8 luminarias)",
          unitType: "UNIT" as const,
          quantity: 8,
          unitPrice: 85,
          markupPct: 15,
        },
        {
          description: "Tomacorrientes GFCI exteriores",
          unitType: "UNIT" as const,
          quantity: 4,
          unitPrice: 125,
          markupPct: 20,
        },
      ],
    },
    {
      category: "Piso",
      items: [
        {
          description: "Piso porcelánico antideslizante 18x18 (gris slate)",
          unitType: "SQ_FT" as const,
          length: 20,
          width: 15,
          quantity: 300,
          unitPrice: 8.5,
          markupPct: 15,
        },
        {
          description: "Instalación de piso con mortero y grout",
          unitType: "SQ_FT" as const,
          quantity: 300,
          unitPrice: 6,
          markupPct: 25,
        },
      ],
    },
    {
      category: "Pintura",
      items: [
        {
          description: "Pintura exterior paredes (Sherwin-Williams Duration)",
          unitType: "SQ_FT" as const,
          quantity: 450,
          unitPrice: 2.75,
          markupPct: 20,
        },
        {
          description: "Sellador impermeabilizante para losa",
          unitType: "SQ_FT" as const,
          quantity: 300,
          unitPrice: 1.5,
          markupPct: 15,
        },
      ],
    },
  ];

  let subtotal = 0;

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const categoryId = categories[sec.category];

    const section = await prisma.quoteSection.create({
      data: {
        quoteId: quote.id,
        categoryId,
        sortOrder: si,
      },
    });

    let sectionSubtotal = 0;

    for (let ii = 0; ii < sec.items.length; ii++) {
      const item = sec.items[ii];
      const qty = item.length && item.width ? item.length * item.width : item.quantity;
      const total = qty * item.unitPrice * (1 + item.markupPct / 100);

      await prisma.quoteItem.create({
        data: {
          sectionId: section.id,
          description: item.description,
          unitType: item.unitType,
          length: item.length ?? null,
          width: item.width ?? null,
          quantity: qty,
          unitPrice: item.unitPrice,
          markupPct: item.markupPct,
          total,
          sortOrder: ii,
        },
      });

      sectionSubtotal += total;
    }

    await prisma.quoteSection.update({
      where: { id: section.id },
      data: { subtotal: sectionSubtotal },
    });

    subtotal += sectionSubtotal;
  }

  // Update quote totals
  const taxAmount = subtotal * 0.115;
  const total = subtotal + taxAmount;

  await prisma.quote.update({
    where: { id: quote.id },
    data: { subtotal, taxAmount, total, status: "ACCEPTED", respondedAt: new Date() },
  });

  console.log(
    `Quote totals — Subtotal: $${subtotal.toFixed(2)}, Tax: $${taxAmount.toFixed(2)}, Total: $${total.toFixed(2)}`
  );

  // 6. Create job from the quote
  const jobCounter = await prisma.jobCounter.upsert({
    where: { organizationId: org.id },
    update: { lastNumber: { increment: 1 } },
    create: { organizationId: org.id, lastNumber: 1 },
  });
  const jobNumber = `JB-${String(jobCounter.lastNumber).padStart(3, "0")}`;

  const job = await prisma.job.create({
    data: {
      organizationId: org.id,
      clientId: client.id,
      quoteId: quote.id,
      createdById: user.id,
      jobNumber,
      title: "Remodelación Terraza — Dorado",
      status: "IN_PROGRESS",
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startedAt: new Date(),
      value: total,
      notes: "Proyecto en progreso. Demolición completada, trabajando en la losa nueva.",
    },
  });

  console.log(`Job created: ${jobNumber} (${job.id})`);
  console.log("\n✅ Test data created successfully!");
  console.log(`\nURLs to test:`);
  console.log(`  Client:  http://localhost:3000/clients/${client.id}`);
  console.log(`  Quote:   http://localhost:3000/quotes/${quote.id}`);
  console.log(`  Job:     http://localhost:3000/jobs/${job.id}`);
  console.log(`\n→ Go to the Job page and click "Generate Shopping List" to test AI material extraction.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
