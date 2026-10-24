import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Kilari EV marketplace data...');

  // 1. Admin User
  const admin = await prisma.user.upsert({
    where: { phone: '9999900001' },
    update: {},
    create: {
      phone: '9999900001',
      role: 'ADMIN',
      profile: {
        create: {
          fullName: 'Kilari Admin',
          city: 'Pune',
          kycStatus: 'VERIFIED',
        },
      },
    },
  });

  // 2. Demo Host: Priya Sharma
  const host = await prisma.user.upsert({
    where: { phone: '9876500001' },
    update: {},
    create: {
      phone: '9876500001',
      role: 'HOST',
      profile: {
        create: {
          fullName: 'Priya Sharma',
          city: 'Pune',
          kycStatus: 'VERIFIED',
        },
      },
    },
  });

  // 3. Demo Driver: Honey Kumar
  const driver = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      role: 'DRIVER',
      profile: {
        create: {
          fullName: 'Honey Kumar',
          city: 'Pune',
          kycStatus: 'VERIFIED',
        },
      },
      vehicles: {
        create: {
          makeModel: 'Tata Nexon EV',
          vehicleType: '4-wheeler',
          connector: 'Type 2',
          registration: 'MH 12 AB 1234',
          batteryKwh: 30.2,
          isDefault: true,
        },
      },
    },
    include: { vehicles: true },
  });

  // 4. Seed Chargers in Pune
  const charger1 = await prisma.charger.create({
    data: {
      ownerId: host.id,
      title: 'Green Hive Society',
      description: 'Gated residential community charger with dedicated guest parking bay and 24/7 security guard.',
      type: 'Society',
      currentType: 'AC',
      powerKw: 11.0,
      connectorType: 'Type 2',
      pricePerKwh: 1400, // Rs 14
      city: 'Pune',
      areaLabel: 'Baner',
      approxLat: 18.559,
      approxLng: 73.786,
      exactAddress: 'Flat 402, Tower B, Green Hive Society, Pancard Club Road, Baner, Pune 411045',
      rules: 'Keep within marked guest bay. Follow security guard directions.',
      parkingNotes: 'Designated EV guest parking near Clubhouse. Cable provided.',
      accessNotes: 'Show your Kilari gate pass QR to the security guard at Gate 1.',
      status: 'ACTIVE',
      healthScore: 96,
      avgRating: 4.9,
      availability: {
        create: [
          { slotType: 'overnight', startTime: '22:00', endTime: '06:00' },
          { slotType: 'daytime', startTime: '10:00', endTime: '18:00' },
        ],
      },
    },
  });

  const charger2 = await prisma.charger.create({
    data: {
      ownerId: host.id,
      title: 'Skyline Residency',
      description: 'Convenient apartment charger in Aundh with sheltered parking.',
      type: 'Society',
      currentType: 'AC',
      powerKw: 7.4,
      connectorType: 'Type 2',
      pricePerKwh: 1400,
      city: 'Pune',
      areaLabel: 'Aundh',
      approxLat: 18.562,
      approxLng: 73.805,
      exactAddress: 'Wing A, Skyline Residency, ITI Road, Aundh, Pune 411007',
      rules: 'Quiet hours after 10 PM. Please disconnect promptly once charged.',
      parkingNotes: 'Ground floor visitor parking slot V-04.',
      accessNotes: 'Automatic boom barrier; guard will scan your pass.',
      status: 'ACTIVE',
      healthScore: 91,
      avgRating: 4.7,
      availability: {
        create: [
          { slotType: 'both', startTime: '00:00', endTime: '23:59' },
        ],
      },
    },
  });

  const charger3 = await prisma.charger.create({
    data: {
      ownerId: host.id,
      title: 'Balewadi Business Hub',
      description: 'High-power commercial charger near Balewadi High Street.',
      type: 'Business',
      currentType: 'DC',
      powerKw: 22.0,
      connectorType: 'CCS2',
      pricePerKwh: 1400,
      city: 'Pune',
      areaLabel: 'Balewadi',
      approxLat: 18.575,
      approxLng: 73.773,
      exactAddress: 'Podium Level P1, Balewadi Business Hub, High Street, Balewadi, Pune 411045',
      rules: 'Commercial building visitor parking rules apply.',
      parkingNotes: 'Entry via Ramp 2, reserved EV bays E1 and E2.',
      accessNotes: 'Security desk scans gate pass QR.',
      status: 'ACTIVE',
      healthScore: 88,
      avgRating: 4.6,
      availability: {
        create: [
          { slotType: 'daytime', startTime: '08:00', endTime: '20:00' },
        ],
      },
    },
  });

  // 5. Seed a Sample Completed Booking and Session
  const sampleBooking = await prisma.booking.create({
    data: {
      chargerId: charger1.id,
      driverId: driver.id,
      hostId: host.id,
      vehicleId: driver.vehicles[0]?.id,
      windowStart: new Date(Date.now() - 24 * 60 * 60 * 1000),
      windowEnd: new Date(Date.now() - 16 * 60 * 60 * 1000),
      estKwh: 12.4,
      quotedAmountPaise: 17360, // 12.4 * 1400
      status: 'COMPLETED',
      paymentStatus: 'PAID',
      paidAmountPaise: 17360,
      chargingSession: {
        create: {
          startReadingKwh: 120.0,
          endReadingKwh: 132.4,
          kwhDelivered: 12.4,
          grossPaise: 17360,
          platformFeePaise: 1736,
          hostEarningsPaise: 15624,
          status: 'COMPLETED',
          endedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
        },
      },
      chatThread: {
        create: {
          status: 'OPEN',
          messages: {
            create: [
              {
                senderRole: 'ASSISTANT',
                isAi: true,
                content: 'Welcome to Kilari! Your booking for Green Hive Society is confirmed.',
              },
              {
                senderId: driver.id,
                senderRole: 'DRIVER',
                content: 'Hi Priya, I will be arriving around 10:15 PM.',
              },
              {
                senderId: host.id,
                senderRole: 'HOST',
                content: 'Welcome Honey! Security has been informed. Please use visitor bay V-1.',
              },
            ],
          },
        },
      },
    },
  });

  // 6. Seed an Upcoming Approved Booking (Ready for payment & gatepass)
  const approvedBooking = await prisma.booking.create({
    data: {
      chargerId: charger1.id,
      driverId: driver.id,
      hostId: host.id,
      vehicleId: driver.vehicles[0]?.id,
      windowStart: new Date(Date.now() + 4 * 60 * 60 * 1000),
      windowEnd: new Date(Date.now() + 12 * 60 * 60 * 1000),
      estKwh: 10.0,
      quotedAmountPaise: 14000,
      status: 'APPROVED',
      paymentStatus: 'UNPAID',
      chatThread: {
        create: {
          status: 'OPEN',
          messages: {
            create: {
              senderRole: 'ASSISTANT',
              isAi: true,
              content: 'Your request was approved by Priya Sharma. Complete payment to generate your access gate pass.',
            },
          },
        },
      },
    },
  });

  // 7. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: driver.id,
        type: 'BOOKING_APPROVED',
        title: 'Booking Approved',
        body: 'Priya Sharma approved your request for Green Hive Society. Complete payment to access your gate pass.',
      },
      {
        userId: host.id,
        type: 'BOOKING_REQUESTED',
        title: 'New Booking Request',
        body: 'Honey Kumar requested an overnight slot for Green Hive Society.',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
