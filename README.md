# АТАКА - Sports Club Management Platform 🥋

> Мультитенантна SaaS-платформа для управління спортивними клубами та школами бойових мистецтв

[![Made in Ukraine](https://img.shields.io/badge/Made%20in-Ukraine-yellow?style=flat-square)](https://github.com/kimthanhaljtf45-cmyk/576767ghghg767)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)

## 📋 Огляд

**АТАКА** — це повнофункціональна система управління спортивним клубом, яка включає:

- 🏢 **Multi-tenant SaaS** — Кожен клуб ізольований, з власними даними та брендингом
- 📱 **Mobile-first** — Native додаток для iOS, Android та Web
- 💳 **WayForPay** — Інтеграція українського платіжного шлюзу
- 🧠 **MetaBrain AI** — Автоматичне виявлення ризику відтоку клієнтів
- 📊 **Analytics** — LTV, churn prediction, growth engine

## 🚀 Статус реалізації

| Модуль | Статус | Опис |
|--------|--------|------|
| CRM клубу | ✅ 100% | Учні, групи, тренери, розклад |
| Attendance | ✅ 100% | Відвідуваність з коментарями |
| Progress | ✅ 100% | Пояси, прогрес, досягнення |
| Billing | ✅ 100% | Підписки, invoices, авто-генерація |
| WayForPay | ✅ 100% | Онлайн оплата карткою |
| Discounts | ✅ 100% | Промокоди, сімейні, loyalty |
| Referrals | ✅ 100% | Реферальна програма |
| Booking | ✅ 100% | Персональні тренування |
| Competitions | ✅ 100% | Змагання, медалі, рейтинг |
| MetaBrain | ✅ 100% | AI risk scoring |
| LTV Engine | ✅ 100% | Lifetime value аналітика |
| Tenants | ✅ 100% | SaaS управління клубами |
| Marketplace | ✅ 80% | Пошук залів для батьків |

## 🏗️ Архітектура

```
┌─────────────────────────────────────────────┐
│           Expo Mobile App                   │
│  (React Native - iOS/Android/Web)           │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          FastAPI Proxy (8001)               │
│     /api/* → NestJS (3001)                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│          NestJS Backend (3001)              │
│   ┌─────────────────────────────────────┐   │
│   │ Modules:                            │   │
│   │ • Auth (OTP + Google)               │   │
│   │ • Children, Groups, Programs        │   │
│   │ • Attendance, Progress              │   │
│   │ • Billing, WayForPay                │   │
│   │ • Discounts, Referrals              │   │
│   │ • Booking, Competitions             │   │
│   │ • MetaBrain, LTV, Predictive        │   │
│   │ • Tenants (SaaS)                    │   │
│   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│              MongoDB                        │
└─────────────────────────────────────────────┘
```

## 👥 Ролі користувачів

| Роль | Опис |
|------|------|
| **PARENT** | Батьки — записують дітей, оплачують, бачать прогрес |
| **STUDENT** | Дорослі учні — самооборона, менторство |
| **COACH** | Тренери — відвідуваність, прогрес, MetaBrain actions |
| **ADMIN** | Адмін клубу — повне управління |
| **SUPER_ADMIN** | Власник платформи — SaaS, tenants |

## 💰 Billing Flow

```
Subscription created → Invoice generated (1st of month)
                              ↓
                    Parent opens Invoice
                              ↓
                    Clicks "Pay with card"
                              ↓
                    WayForPay payment page
                              ↓
                    Payment completed
                              ↓
                    Webhook → Invoice.status = PAID
                              ↓
                    Push notification to parent & admin
```

## 🧠 MetaBrain AI

MetaBrain автоматично аналізує кожного учня та виявляє ризики відтоку:

**Risk Factors:**
- 📉 Падіння відвідуваності
- 💸 Прострочені платежі
- ⏸️ Серія пропусків
- 📊 Відсутність прогресу

**Actions:**
- 🎁 Автоматична персональна знижка
- 📱 Задача тренеру зателефонувати
- 🔔 Push-нотифікація батькам

## 🛠️ Встановлення

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Yarn

### Backend
```bash
cd backend
npm install
npm run build
npm run start:dev
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 📱 Тестування

### Test Credentials
```
Admin: admin@ataka.com.ua / admin123456
Coach: coach@ataka.com.ua / coach123456
Parent OTP: +380991234567 → code: 0000 (dev mode)
```

### WayForPay Test Card
```
Number: 4111111111111111
Expiry: 12/27
CVV: 123
```

## 📁 Структура проєкту

```
/app
├── backend/
│   ├── src/
│   │   ├── modules/          # NestJS модулі
│   │   │   ├── auth/
│   │   │   ├── billing/
│   │   │   ├── wayforpay/
│   │   │   ├── discounts/
│   │   │   ├── meta-brain/
│   │   │   └── ...
│   │   ├── schemas/          # MongoDB schemas
│   │   └── common/           # Guards, decorators
│   └── package.json
│
├── frontend/
│   ├── app/                  # Expo Router screens
│   │   ├── (auth)/           # Login, onboarding
│   │   ├── (tabs)/           # Main tabs
│   │   ├── admin/            # Admin screens
│   │   ├── billing/          # Payment screens
│   │   └── ...
│   ├── src/
│   │   ├── lib/api.ts        # API client
│   │   └── components/       # Reusable components
│   └── package.json
│
├── memory/
│   ├── PRD.md                # Product Requirements
│   └── test_credentials.md
│
└── FULL_AUDIT.md             # This document
```

## 📖 Документація

- [Повний технічний аудит](./FULL_AUDIT.md)
- [PRD (Product Requirements)](./memory/PRD.md)
- [API Endpoints](./FULL_AUDIT.md#-api-endpoints-summary)

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/ataka
JWT_ACCESS_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
WAYFORPAY_MERCHANT_ACCOUNT=test_merch_n1
WAYFORPAY_SECRET_KEY=flk3409refn54t*FNJRET
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=https://your-domain.com
EXPO_PUBLIC_BACKEND_URL=https://your-domain.com
```

## 🚀 Production Deployment

1. Отримати production ключі WayForPay
2. Налаштувати TurboSMS для реальних SMS
3. Налаштувати Firebase для push notifications
4. Змінити JWT secrets
5. Налаштувати MongoDB Atlas

## 📄 License

Private - All rights reserved

---

Built with ❤️ in Ukraine 🇺🇦
