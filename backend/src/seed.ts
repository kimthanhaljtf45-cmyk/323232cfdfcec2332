/**
 * Seed script for АТАКА Mini App database
 * Run: npx ts-node src/seed.ts
 */
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sports_miniapp';

async function seed() {
  console.log('Connecting to MongoDB...');
  const connection = await mongoose.createConnection(MONGO_URI).asPromise();
  const db = connection.db;
  
  if (!db) {
    throw new Error('Failed to connect to database');
  }

  console.log('Seeding database...');

  // Clear existing data
  const collections = [
    'users', 'children', 'parentchildren', 'groups', 'locations',
    'schedules', 'attendances', 'payments', 'contentposts', 'notifications',
    'achievements', 'devicetokens'
  ];

  for (const col of collections) {
    try {
      await db.collection(col).deleteMany({});
    } catch (e) {}
  }

  const now = new Date();

  // ============ LOCATIONS ============
  const locPoznyaky = await db.collection('locations').insertOne({
    name: 'Позняки',
    address: 'вул. Анни Ахматової, 13В',
    city: 'Київ',
    district: 'Дарницький',
    lat: 50.3987,
    lng: 30.6282,
    description: 'Зал на Позняках біля метро',
    createdAt: now,
    updatedAt: now,
  });

  const locVidradnyi = await db.collection('locations').insertOne({
    name: 'Відрадний',
    address: 'вул. Новопольова, 106',
    city: 'Київ',
    district: "Солом'янський",
    createdAt: now,
    updatedAt: now,
  });

  const locShalimova = await db.collection('locations').insertOne({
    name: 'Академіка Шалімова',
    address: 'вул. Академіка Шалімова, 43',
    city: 'Київ',
    createdAt: now,
    updatedAt: now,
  });

  const locSolomianka = await db.collection('locations').insertOne({
    name: "Солом'янка",
    address: 'вул. Авіаконструктора Антонова, 4',
    city: 'Київ',
    createdAt: now,
    updatedAt: now,
  });

  // ============ USERS ============
  const admin = await db.collection('users').insertOne({
    telegramId: '100000001',
    firstName: 'Адміністратор',
    lastName: 'Школи',
    username: 'school_admin',
    phone: '+380991001001',
    role: 'ADMIN',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  const coach1 = await db.collection('users').insertOne({
    telegramId: '100000002',
    firstName: 'Олександр',
    lastName: 'Петренко',
    username: 'coach_alex',
    phone: '+380991001002',
    role: 'COACH',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  const coach2 = await db.collection('users').insertOne({
    telegramId: '100000003',
    firstName: 'Марія',
    lastName: 'Іваненко',
    username: 'coach_maria',
    phone: '+380991001003',
    role: 'COACH',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  const parent1 = await db.collection('users').insertOne({
    telegramId: '100000004',
    firstName: 'Ірина',
    lastName: 'Коваленко',
    username: 'parent_iryna',
    phone: '+380991001004',
    role: 'PARENT',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  const parent2 = await db.collection('users').insertOne({
    telegramId: '100000005',
    firstName: 'Віктор',
    lastName: 'Сидоренко',
    username: 'parent_victor',
    phone: '+380991001005',
    role: 'PARENT',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  const student1 = await db.collection('users').insertOne({
    telegramId: '100000010',
    firstName: 'Артем',
    lastName: 'Коваленко',
    username: 'student_artem',
    phone: '+380991001010',
    role: 'STUDENT',
    status: 'ACTIVE',
    isOnboarded: true,
    createdAt: now,
    updatedAt: now,
  });

  // ============ GROUPS ============
  const groupPoznyaky1 = await db.collection('groups').insertOne({
    name: 'Позняки 18:30',
    ageRange: '6-12',
    level: 'Початковий',
    capacity: 15,
    description: 'Пн Ср Пт 18:30-19:30',
    coachId: coach1.insertedId.toString(),
    locationId: locPoznyaky.insertedId.toString(),
    createdAt: now,
    updatedAt: now,
  });

  const groupShalimova1 = await db.collection('groups').insertOne({
    name: 'Шалімова 17:00',
    ageRange: '6-14',
    level: 'Початковий/Середній',
    capacity: 20,
    description: 'Вт Чт 17:00-18:30',
    coachId: coach1.insertedId.toString(),
    locationId: locShalimova.insertedId.toString(),
    createdAt: now,
    updatedAt: now,
  });

  const groupSolomianka1 = await db.collection('groups').insertOne({
    name: "Солом'янка 18:30",
    ageRange: '6-12',
    level: 'Початковий',
    capacity: 15,
    description: 'Вт Чт 18:30-19:30',
    coachId: coach2.insertedId.toString(),
    locationId: locSolomianka.insertedId.toString(),
    createdAt: now,
    updatedAt: now,
  });

  // ============ SCHEDULES ============
  // dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  const schedules = [
    // Позняки - Mon Wed Fri
    { groupId: groupPoznyaky1.insertedId.toString(), dayOfWeek: 1, startTime: '18:30', endTime: '19:30', isActive: true },
    { groupId: groupPoznyaky1.insertedId.toString(), dayOfWeek: 3, startTime: '18:30', endTime: '19:30', isActive: true },
    { groupId: groupPoznyaky1.insertedId.toString(), dayOfWeek: 5, startTime: '18:30', endTime: '19:30', isActive: true },
    // Шалімова - Tue Thu
    { groupId: groupShalimova1.insertedId.toString(), dayOfWeek: 2, startTime: '17:00', endTime: '18:30', isActive: true },
    { groupId: groupShalimova1.insertedId.toString(), dayOfWeek: 4, startTime: '17:00', endTime: '18:30', isActive: true },
    // Солом'янка - Tue Thu
    { groupId: groupSolomianka1.insertedId.toString(), dayOfWeek: 2, startTime: '18:30', endTime: '19:30', isActive: true },
    { groupId: groupSolomianka1.insertedId.toString(), dayOfWeek: 4, startTime: '18:30', endTime: '19:30', isActive: true },
  ];

  for (const s of schedules) {
    await db.collection('schedules').insertOne({
      ...s,
      createdAt: now,
      updatedAt: now,
    });
  }

  // ============ CHILDREN ============
  const child1 = await db.collection('children').insertOne({
    firstName: 'Артем',
    lastName: 'Коваленко',
    birthDate: '2017-05-15',
    status: 'ACTIVE',
    note: 'Активний, любить спарінги',
    groupId: groupPoznyaky1.insertedId.toString(),
    userId: student1.insertedId.toString(),
    telegramId: '100000010',
    belt: 'WHITE',
    monthlyGoalTarget: 12,
    createdAt: now,
    updatedAt: now,
  });

  const child2 = await db.collection('children').insertOne({
    firstName: 'Софія',
    lastName: 'Коваленко',
    birthDate: '2014-09-22',
    status: 'ACTIVE',
    note: 'Готується до чемпіонату',
    groupId: groupShalimova1.insertedId.toString(),
    belt: 'YELLOW',
    monthlyGoalTarget: 12,
    createdAt: now,
    updatedAt: now,
  });

  const child3 = await db.collection('children').insertOne({
    firstName: 'Максим',
    lastName: 'Сидоренко',
    birthDate: '2010-03-10',
    status: 'ACTIVE',
    note: 'Переможець регіональних змагань',
    groupId: groupSolomianka1.insertedId.toString(),
    belt: 'GREEN',
    monthlyGoalTarget: 12,
    createdAt: now,
    updatedAt: now,
  });

  // Link parents to children
  await db.collection('parentchildren').insertMany([
    { parentId: parent1.insertedId.toString(), childId: child1.insertedId.toString(), relation: 'mother', createdAt: now },
    { parentId: parent1.insertedId.toString(), childId: child2.insertedId.toString(), relation: 'mother', createdAt: now },
    { parentId: parent2.insertedId.toString(), childId: child3.insertedId.toString(), relation: 'father', createdAt: now },
  ]);

  // ============ PAYMENTS ============
  await db.collection('payments').insertMany([
    {
      childId: child1.insertedId.toString(),
      amount: 2500,
      currency: 'UAH',
      description: 'Абонемент квітень 2026',
      status: 'PENDING',
      dueDate: '2026-04-10',
      createdAt: now,
      updatedAt: now,
    },
    {
      childId: child2.insertedId.toString(),
      amount: 3000,
      currency: 'UAH',
      description: 'Абонемент квітень 2026',
      status: 'PAID',
      paidAt: '2026-04-05T10:00:00Z',
      approvedById: admin.insertedId.toString(),
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ============ CONTENT POSTS ============
  await db.collection('contentposts').insertMany([
    {
      authorId: admin.insertedId.toString(),
      title: 'Вітаємо у новому місяці!',
      body: 'Раді повідомити про початок занять у квітні 2026 року. Бажаємо всім успіхів та нових досягнень!',
      type: 'ANNOUNCEMENT',
      visibility: 'GLOBAL',
      isPinned: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    {
      authorId: coach1.insertedId.toString(),
      title: 'Результати тренування',
      body: 'Чудове тренування сьогодні! Діти показали відмінну техніку.',
      type: 'NEWS',
      visibility: 'GROUP',
      groupId: groupPoznyaky1.insertedId.toString(),
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ============ ATTENDANCE ============
  await db.collection('attendances').insertMany([
    { childId: child1.insertedId.toString(), scheduleId: 's1', date: '2026-04-01', status: 'PRESENT', createdAt: now },
    { childId: child1.insertedId.toString(), scheduleId: 's1', date: '2026-04-03', status: 'PRESENT', createdAt: now },
    { childId: child1.insertedId.toString(), scheduleId: 's1', date: '2026-04-05', status: 'WARNED', reason: 'Хвороба', createdAt: now },
    { childId: child2.insertedId.toString(), scheduleId: 's2', date: '2026-04-02', status: 'PRESENT', createdAt: now },
    { childId: child2.insertedId.toString(), scheduleId: 's2', date: '2026-04-04', status: 'PRESENT', createdAt: now },
  ]);

  // ============ ACHIEVEMENTS ============
  await db.collection('achievements').insertMany([
    {
      childId: child1.insertedId.toString(),
      type: 'FIRST_MONTH',
      title: 'Перший місяць',
      description: 'Успішно завершив перший місяць тренувань',
      awardedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      createdAt: now,
    },
    {
      childId: child1.insertedId.toString(),
      type: 'ATTENDANCE_STREAK',
      title: 'Відмінник',
      description: '5 тренувань поспіль без пропусків',
      awardedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      createdAt: now,
    },
  ]);

  console.log('Seed completed!');
  console.log('');
  console.log('=== LOCATIONS ===');
  console.log('1. Позняки - вул. Анни Ахматової, 13В');
  console.log('2. Відрадний - вул. Новопольова, 106');
  console.log("3. Академіка Шалімова - вул. Академіка Шалімова, 43");
  console.log("4. Солом'янка - вул. Авіаконструктора Антонова, 4");
  console.log('');
  console.log('=== TEST ACCOUNTS (Phone + OTP: 0000) ===');
  console.log('- Admin:   phone=+380991001001  role=ADMIN');
  console.log('- Coach 1: phone=+380991001002  role=COACH (Олександр)');
  console.log('- Coach 2: phone=+380991001003  role=COACH (Марія)');
  console.log('- Parent 1: phone=+380991001004  role=PARENT (Ірина, 2 дитини)');
  console.log('- Parent 2: phone=+380991001005  role=PARENT (Віктор, 1 дитина)');
  console.log('- Student: phone=+380991001010  role=STUDENT (Артем)');
  console.log('');
  console.log('To login: Enter phone number, then use OTP code "0000"');

  await connection.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
