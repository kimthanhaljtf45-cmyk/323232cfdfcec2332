# АТАКА Platform - Повний Технічний Аудит

**Версія:** 1.7.0  
**Дата:** Квітень 2026  
**Статус:** Production Ready (90%)

---

## 🎯 ОГЛЯД ПРОЄКТУ

**АТАКА** — це мультитенантна SaaS-платформа для управління спортивними клубами та школами бойових мистецтв. Система повністю автоматизує операційну діяльність клубу: від запису учнів до AI-driven retention marketing.

### Технічний стек
- **Backend:** NestJS (TypeScript) + MongoDB
- **Frontend:** Expo React Native (iOS/Android/Web)
- **Real-time:** Socket.io WebSockets
- **Payments:** WayForPay (Ukrainian payment gateway)
- **AI/ML:** Власний MetaBrain Engine (rule-based + predictive)

---

## 🏗️ АРХІТЕКТУРА СИСТЕМИ

### Мультитенантна модель (SaaS)
```
Platform Owner (Super Admin)
    └── Tenant 1 (Club "АТАКА Київ")
    │       ├── Locations (Halls)
    │       ├── Programs  
    │       ├── Coaches
    │       ├── Groups
    │       └── Students/Parents
    │
    └── Tenant 2 (Club "Боєць")
            └── ... (ізольовані дані)
```

### Плани підписки для клубів:
| План | Ціна/міс | Ліміти | Функції |
|------|----------|--------|---------|
| START | 990 ₴ | 50 учнів, 3 тренери | Базова CRM |
| PRO | 2490 ₴ | 200 учнів, 10 тренерів | +Competitions, Booking, Discounts |
| AI | 4990 ₴ | Unlimited | +MetaBrain, Predictive, Growth Engine |

---

## 👤 РОЛІ КОРИСТУВАЧІВ

### 1. **PARENT** (Батьки)
- Основний клієнт системи
- Реєструє та управляє профілями дітей
- Оплачує підписки та персональні тренування
- Отримує звіти про прогрес дітей
- Записує на змагання

### 2. **STUDENT** (Учень-дорослий)
- Для програм самооборони та менторства
- Самостійно управляє своїм профілем
- Бачить власний прогрес та розклад

### 3. **COACH** (Тренер)
- Веде відвідуваність групи
- Виставляє оцінки та коментарі
- Отримує AI-рекомендації по учнях (MetaBrain)
- Виконує actions (дзвінки батькам, повідомлення)
- Бачить retention-статистику своїх учнів

### 4. **ADMIN** (Адміністратор клубу)
- Повне управління клубом
- Фінансова аналітика
- Управління тарифами та знижками
- Проведення змагань
- Доступ до всіх звітів

### 5. **SUPER_ADMIN** (Власник платформи)
- Управління всіма tenants
- Біллінг клубів (B2B)
- Глобальна аналітика
- Конфігурація планів

---

## 🔐 АВТОРИЗАЦІЯ ТА БЕЗПЕКА

### Методи входу:
1. **SMS OTP** — Основний метод для України
   - Номер +380XXXXXXXXX
   - 6-значний код, діє 5 хвилин
   - Rate limit: 5 запитів/годину
   - DEV bypass: код `0000` або `000000`

2. **Google OAuth** — Альтернативний метод
   - Отримання Google ID Token
   - Автоматичне створення профілю

3. **Mock Login** — Для розробки/тестування
   - Вхід через telegramId

### Токени:
- **Access Token:** JWT, діє 7 днів
- **Refresh Token:** JWT, діє 30 днів
- Payload: `{ sub: userId, role, phone }`

---

## 📊 ОСНОВНІ МОДУЛІ

### 1. CRM Клубу

#### Children (Учні)
```typescript
Child {
  firstName, lastName
  birthDate, age
  belt: 'WHITE' | 'YELLOW' | 'ORANGE' | ... | 'BLACK'
  programType: 'KIDS' | 'SPECIAL' | 'SELF_DEFENSE' | 'MENTORSHIP'
  clubId, groupId, coachId, parentId
  monthlyGoalTarget: 12 (тренувань)
  tournamentPoints, medals (gold/silver/bronze)
}
```

#### Groups (Групи)
- Належать до програми та локації
- Мають розклад (Schedule)
- Прив'язані до тренера

#### Locations (Зали)
- Адреса, місто, район
- Максимальна місткість
- Можуть мати кілька груп

#### Programs (Програми)
```typescript
Program {
  name: "Дитяча група 5-7 років"
  type: 'KIDS' | 'SPECIAL' | 'SELF_DEFENSE' | 'MENTORSHIP' | 'CONSULTATION'
  price: 2500 (грн/міс)
  trainingsPerWeek: 3
  duration: 60 (хвилин)
  maxStudents: 15
  ageFrom, ageTo, level
}
```

---

### 2. Attendance (Відвідуваність)

#### Статуси:
- `PRESENT` — Присутній
- `ABSENT` — Відсутній
- `LATE` — Запізнився
- `WARNED` — Попереджений
- `EXCUSED` — Пропуск з причини

#### Функції:
- Тренер відмічає присутність на занятті
- Автоматичний розрахунок % відвідуваності
- Streak tracking (серія пропусків)
- Trigger для MetaBrain при пропусках

---

### 3. Progress (Прогрес учня)

#### Belt System (Пояси):
```
WHITE → YELLOW → ORANGE → GREEN → BLUE → PURPLE → BROWN → BLACK
```

#### Progress Flow:
1. Тренер ставить оцінку після кожного тренування
2. Накопичуються `progressPercent` до 100%
3. Тренер натискає "Approve for next belt"
4. Admin/Owner присвоює новий пояс

#### Tracking:
- `coachCommentSummary` — Останні коментарі тренера
- `monthlyGoalTarget` — Ціль відвідувань (12/міс)
- `progressSnapshots` — Історія прогресу

---

### 4. Billing (Фінанси)

#### Subscription (Підписка)
```typescript
Subscription {
  childId, parentId
  planName: "Місячний абонемент"
  price: 2500
  billingCycle: 'MONTHLY'
  dueDay: 1-28 (день оплати)
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED'
  nextBillingAt: Date
}
```

#### Invoice (Рахунок)
```typescript
Invoice {
  childId, parentId, subscriptionId
  amount: 2500
  currency: 'UAH'
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  dueDate: Date
  paidAt?: Date
  // WayForPay fields
  wayforpayOrderReference
  wayforpayTransactionId
  wayforpayCardPan
  finalAmount, discountAmount
}
```

#### Billing CRON Jobs:
- **Щоденно:** Генерація нових invoices для підписок
- **Щоденно:** Маркування прострочених як OVERDUE
- **Щоденно:** Нагадування про оплату

---

### 5. WayForPay Integration 💰

#### Статус: ✅ РЕАЛІЗОВАНО

#### Конфігурація:
```env
WAYFORPAY_MERCHANT_ACCOUNT=test_merch_n1
WAYFORPAY_SECRET_KEY=flk3409refn54t*FNJRET
```

#### API Endpoints:
| Endpoint | Опис |
|----------|------|
| `POST /api/wayforpay/create-payment` | Отримати дані для віджета |
| `POST /api/wayforpay/payment-url` | URL для redirect |
| `POST /api/wayforpay/callback` | Webhook від WayForPay |
| `GET /api/wayforpay/invoice/:id` | Invoice з payment data |
| `POST /api/wayforpay/simulate` | Тест-оплата (DEV) |

#### Payment Flow:
```
1. Parent → Натискає "Оплатити карткою"
2. Frontend → POST /api/wayforpay/payment-url
3. Backend → Генерує HMAC_MD5 підпис
4. Backend → Повертає URL WayForPay
5. Frontend → Відкриває URL (Linking.openURL)
6. User → Вводить дані картки на WayForPay
7. WayForPay → POST /api/wayforpay/callback
8. Backend → Верифікує підпис
9. Backend → Оновлює Invoice.status = 'PAID'
10. Backend → Надсилає push батькам та адмінам
```

#### Тестовий режим:
- Кнопка "Симулювати оплату" для тестів
- Тестова картка: 4111111111111111

---

### 6. Discounts & Promo Codes 🎁

#### Типи знижок:
| Тип | Опис | Приклад |
|-----|------|---------|
| `REFERRAL` | За запрошення друга | -50% для обох |
| `FAMILY` | Багатодітна сім'я | -10% при 2+ дітей |
| `LOYALTY` | За тривалість | -5% після 3 міс |
| `FIRST_TIME` | Перша оплата | -10% |
| `PROMO` | Промокод | WELCOME10 |
| `METABRAIN` | AI-персоналізована | Динамічно |

#### Discount Engine Rules:
1. Сортування по `priority` (менше = вище)
2. `isStackable: false` — зупиняє ланцюг
3. Максимум 50% знижки (окрім FREE_PERIOD)
4. Mutual exclusion по `group`

#### Промокоди:
```typescript
DiscountRule {
  type: 'PROMO'
  promoCode: 'WELCOME10'
  valueType: 'PERCENT' | 'FIXED' | 'FREE_PERIOD'
  value: 10
  usageLimit: 100
  perUserLimit: 1
  expiresAt: Date
}
```

---

### 7. Referral System 🔗

#### Flow:
1. **Existing User** отримує унікальний `referralCode`
2. Ділиться кодом з другом
3. **New User** реєструється з referralCode
4. Система створює `Referral` запис
5. Після першої оплати new user:
   - Inviter отримує -50% на наступний місяць
   - Invited отримує -10% на перший місяць
6. Обидва отримують push-нотифікації

#### Статуси Referral:
```
PENDING → REGISTERED → CONFIRMED → REWARDED
```

---

### 8. Booking System 📅

#### Типи бронювання:
- `PERSONAL` — Персональне тренування
- `TRIAL` — Пробне заняття
- `CONSULTATION` — Консультація

#### BookingSlot (Слоти тренера):
```typescript
BookingSlot {
  coachId, locationId
  dayOfWeek: 0-6
  startTime: "09:00"
  endTime: "10:00"
  type: 'PERSONAL' | 'TRIAL'
  price: 500
  maxBookings: 1
  isActive: true
}
```

#### Booking Flow:
1. Parent вибирає тип → тренера → слот
2. Система перевіряє доступність
3. Створюється Booking зі статусом PENDING
4. Coach підтверджує → CONFIRMED
5. Генерується Invoice для оплати
6. Після заняття → DONE або NO_SHOW

---

### 9. Competitions & Tournaments 🏆

#### Competition (Внутрішнє змагання):
```typescript
Competition {
  name: "Новорічний турнір"
  type: 'INTERNAL' | 'EXTERNAL' | 'EXAM'
  date, location
  registrationDeadline
  maxParticipants
  categories: [{ name, ageFrom, ageTo, beltFrom, beltTo }]
  status: 'DRAFT' | 'REGISTRATION' | 'ACTIVE' | 'COMPLETED'
}
```

#### Results tracking:
- `goldMedals`, `silverMedals`, `bronzeMedals` на учня
- `tournamentPoints` — накопичувані бали
- Рейтинг чемпіонів клубу

---

### 10. Messages & Notifications 💬

#### Message Types:
- Direct messages (parent ↔ coach)
- Group announcements
- System notifications

#### Push Notifications:
```typescript
Notification {
  userId, type
  title: "Нагадування про оплату"
  body: "До 5 числа потрібно оплатити..."
  data: { screen: '/billing', invoiceId }
  read: false
}
```

#### Triggers для push:
- Нове заняття в розкладі
- Нагадування про оплату
- Пропущено 3+ тренування
- Новий коментар від тренера
- Оплата підтверджена
- Знижка/акція від MetaBrain

---

## 🧠 MetaBrain AI Engine

### Призначення:
Автоматичне виявлення учнів у ризику відтоку та генерація персоналізованих retention-офферів.

### Risk Calculation:
```typescript
RiskResult {
  childId, name
  risk: 0-100  // Загальний ризик
  status: 'good' | 'warning' | 'critical'
  factors: [
    { factor: 'attendance_drop', weight: 30, score: 25 },
    { factor: 'payment_delay', weight: 25, score: 20 },
    ...
  ]
  actions: [
    { type: 'CALL', priority: 'high', message: '...' }
  ]
}
```

### Risk Factors:
| Фактор | Вага | Опис |
|--------|------|------|
| `attendance_rate` | 30% | % відвідуваності |
| `attendance_trend` | 15% | Тренд (падає/зростає) |
| `payment_status` | 25% | Оплачено/прострочено |
| `progress_rate` | 15% | Прогрес до наступного пояса |
| `absence_streak` | 15% | Пропуски поспіль |

### Segments:
- `VIP` — risk ≤ 10 (найкращі клієнти)
- `ACTIVE` — risk 11-39 (норма)
- `WARNING` — risk 40-69 (потребують уваги)
- `CHURN_RISK` — risk ≥ 70 (критичний ризик)

### MetaBrain Actions:
1. **Автоматичне створення знижки** для CHURN_RISK
2. **Генерація задачі для тренера** (зателефонувати, написати)
3. **Push-нотифікація** батькам з оффером

---

## 📈 LTV Engine (Lifetime Value)

### LTV Profile:
```typescript
LtvProfile {
  userId, tenantId
  totalPaid: 25000
  monthsActive: 10
  avgMonthly: 2500
  predictedLtv: 45000
  segment: 'GOLD' | 'SILVER' | 'BRONZE' | 'NEW'
}
```

### LTV Segments:
| Сегмент | LTV Range | Dynamic Discount |
|---------|-----------|------------------|
| GOLD | > 30000 | 10% |
| SILVER | 15000-30000 | 15% |
| BRONZE | 5000-15000 | 25% |
| NEW | < 5000 | 30% |

### LTV-based decisions:
- **isWorthSaving():** LTV < 2000 AND risk > 80 = не витрачати ресурси
- **isUpsellCandidate():** LTV > 15000 AND risk < 30 = пропонувати VIP

---

## 🔮 Predictive Engine

### Churn Prediction:
```typescript
PredictionProfile {
  userId, tenantId
  churn7d: 0.35   // 35% шанс піти за 7 днів
  churn30d: 0.55  // 55% за 30 днів
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  nextBestAction: 'DISCOUNT' | 'COACH_CALL' | 'COACH_MESSAGE' | 'NONE'
}
```

### Next Best Action Logic:
```
IF churn7d > 50% → COACH_CALL (терміново)
ELSE IF churn7d > 30% → COACH_MESSAGE
ELSE IF churn30d > 40% → DISCOUNT
ELSE → NONE
```

---

## 🚀 Growth Engine

### A/B Testing для offers:
```typescript
OfferVariant {
  tenantId, segment: 'CHURN_RISK'
  title: "Ми сумуємо!"
  description: "Поверніться зі знижкою -30%"
  discountPercent: 30
  ttlHours: 48
  views: 100, clicks: 25, conversions: 10
}
```

### Metrics:
- **CTR:** clicks / views
- **Conversion Rate:** conversions / clicks
- **pickOffer():** Вибирає найефективніший оффер

---

## 🖥️ Frontend Screens

### Auth Flow:
```
Welcome → Login (OTP) → RoleSelect → Onboarding → Dashboard
```

### Parent Flow:
```
Dashboard (tabs):
├── Home (дети, прогресс, alerts)
├── Schedule (расписание)
├── Feed (новости клуба)
└── Profile (настройки, referral)

Other screens:
├── /child/[id] — профіль дитини
├── /billing — рахунки та підписки
├── /billing/invoice/[id] — оплата через WayForPay
├── /booking — запис на персональні
├── /competitions — змагання
├── /messages — чат з тренером
├── /marketplace — пошук залів
└── /profile/referral — реферальна програма
```

### Coach Flow:
```
/coach — Dashboard
├── /coach/attendance/[scheduleId] — відмітити присутність
├── /coach/actions — MetaBrain задачі
└── Students list
```

### Admin Flow:
```
/admin — Dashboard
├── /admin/billing — всі рахунки
├── /admin/subscriptions — підписки
├── /admin/pricing — тарифи
├── /admin/competitions — змагання
├── /admin/leads — нові ліди
├── /admin/tenants — SaaS управління
└── /admin/growth — Growth Engine
```

---

## 📡 API Endpoints Summary

### Auth
- `POST /api/auth/request-otp` — Запит SMS коду
- `POST /api/auth/verify-otp` — Верифікація + login
- `POST /api/auth/google` — Google OAuth
- `POST /api/auth/refresh` — Оновити tokens
- `GET /api/auth/me` — Поточний user

### Children
- `GET /api/children` — Мої діти (parent)
- `POST /api/children` — Додати дитину
- `GET /api/children/:id` — Профіль дитини
- `PUT /api/children/:id` — Оновити
- `GET /api/children/:id/progress` — Прогрес

### Attendance
- `GET /api/attendance/schedule/:scheduleId` — Список учнів
- `POST /api/attendance` — Відмітити присутність
- `GET /api/attendance/child/:childId` — Історія

### Billing
- `GET /api/billing/invoices` — Мої рахунки
- `GET /api/billing/subscriptions` — Мої підписки
- `POST /api/billing/subscriptions` — Створити підписку
- `POST /api/billing/invoices/:id/proof` — Завантажити чек

### WayForPay
- `POST /api/wayforpay/create-payment`
- `POST /api/wayforpay/payment-url`
- `POST /api/wayforpay/callback`
- `POST /api/wayforpay/simulate`

### Booking
- `GET /api/booking/coaches` — Тренери
- `GET /api/booking/slots` — Слоти
- `POST /api/booking` — Створити бронювання
- `GET /api/booking/my` — Мої бронювання

### Discounts
- `POST /api/discounts/calculate` — Розрахувати знижку
- `POST /api/discounts/validate-promo` — Перевірити промокод

### Referrals
- `GET /api/referrals/my-code` — Мій реферальний код
- `POST /api/referrals/invite` — Запросити друга
- `GET /api/referrals/stats` — Статистика

### MetaBrain (Coach/Admin)
- `GET /api/meta-brain/child/:id` — Аналіз учня
- `GET /api/meta-brain/coach-insights` — Insights для тренера
- `GET /api/meta-brain/admin-insights` — Dashboard для admin

### Tenants (Super Admin)
- `GET /api/tenants` — Всі клуби
- `GET /api/tenants/overview` — SaaS статистика
- `POST /api/tenants` — Створити клуб
- `POST /api/tenants/:id/upgrade` — Змінити план
- `POST /api/tenants/:id/activate|deactivate`

---

## ✅ ЩО РЕАЛІЗОВАНО (90%)

### Core CRM
- [x] Реєстрація та авторизація (OTP + Google)
- [x] Управління дітьми та профілями
- [x] Групи, локації, програми
- [x] Відвідуваність з коментарями тренера
- [x] Прогрес та пояси

### Billing & Payments
- [x] Підписки з автогенерацією invoices
- [x] WayForPay інтеграція (TEST MODE)
- [x] Знижки та промокоди
- [x] Реферальна система

### Booking
- [x] Персональні тренування
- [x] Пробні заняття
- [x] Консультації
- [x] Слоти тренерів

### Competitions
- [x] Внутрішні змагання
- [x] Реєстрація учасників
- [x] Результати та медалі
- [x] Рейтинг чемпіонів

### AI/Analytics
- [x] MetaBrain risk scoring
- [x] LTV Engine
- [x] Predictive churn
- [x] Growth Engine A/B tests
- [x] Coach Actions generator

### SaaS
- [x] Multi-tenant архітектура
- [x] Плани підписки (START/PRO/AI)
- [x] Super Admin UI

---

## ⚠️ ЩО НЕ РЕАЛІЗОВАНО (10%)

### Production Ready
- [ ] WayForPay production credentials
- [ ] Real SMS provider (TurboSMS)
- [ ] Push notifications (FCM/APNs)
- [ ] Email notifications (SendGrid)

### Marketplace
- [ ] Повний каталог залів (зараз тільки базовий)
- [ ] Пошук по геолокації
- [ ] Відгуки про тренерів

### Advanced Features
- [ ] Video lessons library
- [ ] Online payments для зовнішніх змагань
- [ ] White-label mobile app per tenant
- [ ] Advanced reporting (PDF export)

---

## 🔧 КОНФІГУРАЦІЯ

### Backend .env
```env
MONGO_URL=mongodb://localhost:27017/ataka
DB_NAME=ataka
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_ACCESS_EXPIRES=7d
JWT_REFRESH_EXPIRES=30d
PORT=3001

# WayForPay (TEST)
WAYFORPAY_MERCHANT_ACCOUNT=test_merch_n1
WAYFORPAY_SECRET_KEY=flk3409refn54t*FNJRET

# SMS (TurboSMS - production)
TURBOSMS_TOKEN=xxx
TURBOSMS_SENDER=ATAKA
```

### Frontend .env
```env
EXPO_PUBLIC_API_URL=https://your-domain.com
EXPO_PUBLIC_BACKEND_URL=https://your-domain.com
```

---

## 📝 ТЕСТОВІ ОБЛІКОВІ ДАНІ

| Роль | Email/Phone | Password |
|------|-------------|----------|
| Admin | admin@ataka.com.ua | admin123456 |
| Coach | coach@ataka.com.ua | coach123456 |
| Parent | +380991234567 | OTP: 0000 |

### WayForPay Test Card
- Number: 4111111111111111
- Expiry: 12/27
- CVV: 123

---

## 🚀 NEXT STEPS ДЛЯ PRODUCTION

1. **Отримати production ключі WayForPay**
2. **Підключити TurboSMS для реальних SMS**
3. **Налаштувати Firebase для push**
4. **Знайти першого реального клієнта**
5. **Провести перший реальний платіж**

---

*Документ створено: Квітень 2026*  
*Автор: АТАКА Development Team*
