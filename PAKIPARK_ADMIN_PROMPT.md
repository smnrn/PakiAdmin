# 🚀 PakiPark Admin Panel — Full Development Prompt

> **Architecture**: Next.js 15 (App Router) + **NestJS Backend** (Sequelize + raw SQL) — matching the current PakiPark stack  
> **Database**: Supabase PostgreSQL (shared DB)  
> **⚠️ STRICT**: Use ONLY domain schemas (`account`, `teller`, `parking_lot`, `reservation`, `partner`, `payment`). **NEVER use `public` schema.**  
> **⚠️ STRICT**: Do NOT create new tables or schemas. Use only what already exists.

---

## 📋 Overview

Build the **PakiPark Admin Panel** — the super-admin dashboard for the PakiPark smart parking franchise system. The current system already has tabs: **Dashboard, Parking Management, Bookings, Locations, Analytics, Settings**. Extend it with:

1. **Document Review** — Review/approve/reject customer vehicle OR/CR documents
2. **Account Management** — Create teller & business partner accounts, assign them to locations
3. **Add New Parking Lot Location** — Create franchise parking lots with auto-generated slots
4. **Parking Lot Franchise Management** — Assign lots to business partners

---

## 🏗️ Tech Stack (Matches Current PakiPark)

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Styling | PakiPark design system (`#1e3d5a` navy, `#ee6b20` orange) |
| Backend | **NestJS** + **Sequelize** (models with `@Table({ schema })`) + raw SQL via injected `Sequelize` |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth JWT + `JwtAuthGuard` (global, already configured) |
| Icons | Lucide React |

### NestJS Patterns Already in Use

```ts
// Models use Sequelize decorators with explicit schema:
@Table({ tableName: 'profiles', schema: 'account', timestamps: false })
export class UserModel extends Model { ... }

// Services that need raw SQL inject Sequelize directly:
constructor(private sequelize: Sequelize) {}
await this.sequelize.query(`INSERT INTO partner.activity_logs ...`, { replacements: {...} });

// Global JWT guard applied via APP_GUARD — all routes protected by default
// Use @Public() decorator to exempt specific endpoints
```

---

## 🗄️ Existing Tables — Verified from Live Supabase DB

> All IDs are **UUID**. Row counts are current as of verification.

### `account.profiles` (19 rows, RLS on) — User profiles

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | `gen_random_uuid()` |
| full_name | VARCHAR | |
| email | VARCHAR | Unique |
| phone | VARCHAR | Nullable |
| dob | DATE | Nullable |
| role | VARCHAR | `'customer'`, `'partner'`, `'teller'` |
| address | TEXT | Nullable |
| city / province | VARCHAR | Nullable |
| profile_picture | TEXT | Nullable |
| is_verified | BOOLEAN | Default false |
| documents | JSONB | Default `[]` |
| two_factor_enabled | BOOLEAN | Default false |
| notification_preferences | JSONB | Default `{}` |
| created_at | TIMESTAMPTZ | `now()` |
| **location_id** | **UUID** | **Nullable — FK → `parking_lot.locations.id`** |

> **Important**: `location_id` is used to assign a user (teller/partner) to a specific parking lot. This is how location assignment works — **NOT** via JSONB hacks.

### `account.admin_accounts` (0 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| profile_id | UUID | FK → `account.profiles.id` |
| admin_role | VARCHAR | `'super_admin'`, `'pakipark_admin'` |
| permissions | JSONB | Default `{}` |
| is_active | BOOLEAN | Default true |
| last_login_at | TIMESTAMPTZ | Nullable |
| created_at | TIMESTAMPTZ | |

### `account.document_verifications` (0 rows, RLS on) — Doc review audit

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| profile_id | UUID | FK → customer profile |
| document_type | VARCHAR | `'or'`, `'cr'`, `'license'` |
| file_url | TEXT | |
| status | VARCHAR | Default `'pending'` → `'approved'` / `'rejected'` |
| rejection_reason | TEXT | Nullable |
| reviewed_by | UUID | Admin UUID |
| reviewed_at | TIMESTAMPTZ | Nullable |

### `teller.vehicles` (5 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID | FK → owner |
| brand / model | VARCHAR | |
| color | VARCHAR | Nullable |
| plate_number | VARCHAR | |
| type | VARCHAR | Nullable |
| or_doc | TEXT | Nullable — OR document URL |
| cr_doc | TEXT | Nullable — CR document URL |
| is_default | BOOLEAN | Default false |
| created_at / updated_at | TIMESTAMPTZ | |

### `teller.uploads` (0 rows, RLS on) — Upload records

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID | |
| entity_id | UUID | Related vehicle id |
| entity_type | VARCHAR | `'vehicle_or'`, `'vehicle_cr'` |
| url | TEXT | |
| created_at | TIMESTAMPTZ | |

### `teller.settings` (0 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| key | VARCHAR | Unique |
| value | JSONB | Default `{}` |
| updated_at | TIMESTAMPTZ | |

### `parking_lot.locations` (6 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT | Not null |
| address | TEXT | Not null |
| lat / lng | FLOAT | Nullable |
| amenities | TEXT[] | Default `[]` |
| total_spots | INTEGER | Default 100 |
| available_spots | INTEGER | Default 100 |
| pricePerHour | NUMERIC | Default 50 |
| status | TEXT | Default `'active'` (enum: active/inactive/maintenance/closed) |
| operatingHours | JSONB | `{ mon: { open, close, closed }, ... }` |
| owner_id | UUID | Nullable — FK → business partner profile |
| coordinates | JSONB | Default `{}` |
| image_url | TEXT | Nullable |
| is_active | BOOLEAN | Default true |
| created_at | TIMESTAMPTZ | |
| updatedAt | TIMESTAMPTZ | |

### `parking_lot.parking_slots` (427 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| location_id | UUID | FK → location |
| label | TEXT | e.g. `'A-1'` |
| section | TEXT | e.g. `'A'` |
| floor | TEXT | Default `'1'` |
| type | TEXT | Nullable |
| status | TEXT | Default `'available'` |

### `parking_lot.parking_rates` (4 rows, RLS on)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| location_id | UUID | |
| type | TEXT | Vehicle type |
| rate | NUMERIC | |
| createdAt / updatedAt | TIMESTAMPTZ | |

### `reservation.bookings` (18 rows, RLS on) — Read-only

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id / vehicle_id / location_id / parking_slot_id | UUID | |
| reference / barcode / spot | VARCHAR | |
| date | DATE | |
| timeSlot / type | VARCHAR | |
| amount | NUMERIC | |
| status | VARCHAR | Default `'PENDING'` |
| paymentMethod / paymentStatus | VARCHAR | |
| checkedInByTeller | BOOLEAN | Default false |
| checkInAt / checkOutAt | TIMESTAMPTZ | |
| vehiclePlate / vehicleType / vehicleColor | VARCHAR | |
| locationName / locationAddress | VARCHAR | |
| createdAt / updatedAt | TIMESTAMPTZ | |
| payment_session_id | VARCHAR | Nullable |

### `reservation.transaction_logs` (5 rows, RLS on) — Read-only

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| booking_id / user_id | UUID | |
| type | TEXT | |
| amount | NUMERIC | |
| details | JSONB | |
| created_at / updated_at | TIMESTAMPTZ | |

### `partner.activity_logs` — Admin audit trail

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| admin_id | UUID | Not null |
| action | VARCHAR | e.g. `'APPROVE_DOC'`, `'CREATE_TELLER'` |
| target_type | VARCHAR | e.g. `'Vehicle'`, `'User'`, `'Location'` |
| target_id | UUID | |
| details | JSONB | Default `{}` |
| created_at | TIMESTAMPTZ | |

### `partner.reviews` — Read-only

### `payment.payment_transactions` / `payment.escrow_holds` / `payment.refunds` — Read-only

---

## 🔧 NestJS Backend Structure

Add a new **AdminModule** alongside existing modules:

```
src/Backend/nestjs-backend/src/
├── admin/                                # NEW MODULE
│   ├── admin.module.ts                   # Imports AdminDocumentModule, AdminAccountModule, etc.
│   ├── document/
│   │   ├── admin-document.module.ts
│   │   ├── admin-document.controller.ts  # /api/admin/documents
│   │   └── admin-document.service.ts     # Raw SQL queries on teller.vehicles, account.document_verifications
│   ├── account/
│   │   ├── admin-account.module.ts
│   │   ├── admin-account.controller.ts   # /api/admin/accounts
│   │   └── admin-account.service.ts      # Raw SQL on account.profiles
│   ├── location/
│   │   ├── admin-location.module.ts
│   │   ├── admin-location.controller.ts  # /api/admin/locations
│   │   └── admin-location.service.ts     # Raw SQL on parking_lot.locations, parking_lot.parking_slots
│   └── dashboard/
│       ├── admin-dashboard.module.ts
│       ├── admin-dashboard.controller.ts # /api/admin/dashboard
│       └── admin-dashboard.service.ts    # Aggregated stats queries
├── models/
│   └── (existing models — no new models needed)
└── app.module.ts                         # Add: AdminModule to imports
```

### Register in `app.module.ts`:

```ts
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // ... existing modules
    AdminModule,  // ADD THIS
  ],
})
```

### Admin Guard (role check):

```ts
// admin/guards/admin-role.guard.ts
@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    // req.user is set by JwtAuthGuard (already global)
    return req.user?.role === 'admin' || req.user?.role === 'super_admin';
  }
}

// Usage on controllers:
@Controller('admin/documents')
@UseGuards(AdminRoleGuard)
export class AdminDocumentController { ... }
```

### Example Service — `admin-document.service.ts`:

```ts
@Injectable()
export class AdminDocumentService {
  constructor(
    private sequelize: Sequelize,
    private logService: LogService,
  ) {}

  async getVehiclesWithDocs(filter?: string) {
    const [rows] = await this.sequelize.query(`
      SELECT v.id, v.brand, v.model, v.color, v.plate_number, v.type,
             v.or_doc, v.cr_doc, v.created_at,
             p.full_name, p.email, p.phone, p.is_verified
      FROM teller.vehicles v
      JOIN account.profiles p ON p.id = v.user_id
      WHERE v.or_doc IS NOT NULL OR v.cr_doc IS NOT NULL
      ORDER BY v.created_at DESC
    `);
    return rows;
  }

  async approveDocument(vehicleId: string, adminId: string) {
    const [vehicles] = await this.sequelize.query(
      `SELECT v.*, p.id as profile_id FROM teller.vehicles v
       JOIN account.profiles p ON p.id = v.user_id WHERE v.id = :vehicleId`,
      { replacements: { vehicleId } },
    );
    const vehicle = (vehicles as any[])[0];
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    // Insert verification record
    await this.sequelize.query(`
      INSERT INTO account.document_verifications (profile_id, document_type, file_url, status, reviewed_by, reviewed_at)
      VALUES (:profileId, 'or_cr', :fileUrl, 'approved', :adminId, NOW())
    `, { replacements: { profileId: vehicle.profile_id, fileUrl: vehicle.or_doc || vehicle.cr_doc, adminId } });

    // Update profile verification
    await this.sequelize.query(
      `UPDATE account.profiles SET is_verified = true WHERE id = :profileId`,
      { replacements: { profileId: vehicle.profile_id } },
    );

    // Log activity
    await this.logService.logActivity({
      userId: adminId, action: 'APPROVE_DOC', targetType: 'Vehicle', targetId: vehicleId,
      details: { plateNumber: vehicle.plate_number, owner: vehicle.full_name },
    });
  }
}
```

### Example Service — `admin-account.service.ts`:

```ts
@Injectable()
export class AdminAccountService {
  constructor(private sequelize: Sequelize, private logService: LogService) {}

  async createAccount(dto: { fullName: string; email: string; phone: string; role: 'driver' | 'operator'; locationId?: string }) {
    const [rows] = await this.sequelize.query(`
      INSERT INTO account.profiles (full_name, email, phone, role, is_verified, location_id, created_at)
      VALUES (:fullName, :email, :phone, :role, true, :locationId, NOW())
      RETURNING id, full_name, email, phone, role, location_id, created_at
    `, { replacements: { ...dto, locationId: dto.locationId || null } });

    // If operator (business partner) + locationId → update location owner
    if (dto.role === 'operator' && dto.locationId) {
      await this.sequelize.query(
        `UPDATE parking_lot.locations SET owner_id = :profileId, "updatedAt" = NOW() WHERE id = :locationId`,
        { replacements: { profileId: (rows as any[])[0].id, locationId: dto.locationId } },
      );
    }

    return (rows as any[])[0];
  }

  async assignLocation(profileId: string, locationId: string) {
    await this.sequelize.query(
      `UPDATE account.profiles SET location_id = :locationId WHERE id = :profileId`,
      { replacements: { profileId, locationId } },
    );
  }

  async getStaffAccounts() {
    const [rows] = await this.sequelize.query(`
      SELECT p.id, p.full_name, p.email, p.phone, p.role, p.is_verified,
             p.location_id, p.created_at,
             l.name as location_name, l.address as location_address
      FROM account.profiles p
      LEFT JOIN parking_lot.locations l ON l.id = p.location_id
      WHERE p.role IN ('operator', 'driver')
      ORDER BY p.created_at DESC
    `);
    return rows;
  }
}
```

### Example Service — `admin-location.service.ts`:

```ts
@Injectable()
export class AdminLocationService {
  constructor(private sequelize: Sequelize, private logService: LogService) {}

  async createLocation(dto: {
    name: string; address: string; lat?: number; lng?: number;
    totalSpots: number; pricePerHour: number; amenities?: string[];
    ownerId?: string; operatingHours?: object;
  }) {
    const [rows] = await this.sequelize.query(`
      INSERT INTO parking_lot.locations
        (name, address, lat, lng, total_spots, available_spots, "pricePerHour",
         amenities, owner_id, "operatingHours", status, is_active, created_at, "updatedAt")
      VALUES (:name, :address, :lat, :lng, :totalSpots, :totalSpots, :pricePerHour,
              ARRAY[:amenities]::text[], :ownerId, :operatingHours::jsonb,
              'active', true, NOW(), NOW())
      RETURNING *
    `, { replacements: {
      ...dto, lat: dto.lat || null, lng: dto.lng || null,
      amenities: dto.amenities || [], ownerId: dto.ownerId || null,
      operatingHours: JSON.stringify(dto.operatingHours || {}),
    }});
    return (rows as any[])[0];
  }

  async generateSlots(locationId: string, floors: number, sections: number, slotsPerSection: number) {
    const [rows] = await this.sequelize.query(`
      INSERT INTO parking_lot.parking_slots (location_id, label, section, floor, type, status)
      SELECT :locationId::uuid, section || '-' || slot_num, section, floor_num::text, 'regular', 'available'
      FROM generate_series(1, :floors) AS floor_num,
           (SELECT unnest(ARRAY['A','B','C','D','E','F','G','H']) AS section LIMIT :sections) s,
           generate_series(1, :slotsPerSection) AS slot_num
      RETURNING *
    `, { replacements: { locationId, floors, sections, slotsPerSection } });

    const count = (rows as any[]).length;
    await this.sequelize.query(
      `UPDATE parking_lot.locations SET total_spots = :count, available_spots = :count, "updatedAt" = NOW() WHERE id = :locationId`,
      { replacements: { count, locationId } },
    );
    return { generated: count };
  }
}
```

---

## 🛣️ API Routes — `/api/admin/*`

### Document Review

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/documents` | List vehicles with docs |
| GET | `/admin/documents/:vehicleId` | Detail + uploads |
| PUT | `/admin/documents/:vehicleId/approve` | Approve |
| PUT | `/admin/documents/:vehicleId/reject` | Reject `{ reason }` |

### Account Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/accounts` | List tellers & partners |
| POST | `/admin/accounts/teller` | Create teller (role=`driver`) |
| POST | `/admin/accounts/business-partner` | Create partner (role=`operator`) |
| PUT | `/admin/accounts/:id/assign-location` | Assign `{ locationId }` |
| DELETE | `/admin/accounts/:id` | Deactivate |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/locations` | List with owner |
| POST | `/admin/locations` | **Add new parking lot** |
| GET | `/admin/locations/:id` | Detail + slots |
| PUT | `/admin/locations/:id` | Update |
| PATCH | `/admin/locations/:id/hours` | Set operating hours |
| PATCH | `/admin/locations/:id/price` | Set pricing |
| POST | `/admin/locations/:id/slots/generate` | Generate slots |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Aggregated stats |

---

## 🖥️ Frontend — Tab-Based (Matches Current PakiPark)

### Add new tab components at `src/Frontend/src/app/admin/home/tabs/`:

- `AdminDocumentsView.tsx` — Document review table + approve/reject modals
- `AdminAccountsView.tsx` — Staff account CRUD + location assignment

### Update menu in `page.tsx`:

```tsx
import { FileCheck, UserPlus } from 'lucide-react';  // add imports

const allMenuItems = [
  { id: 'dashboard',  label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'parking',    label: 'Parking Management', icon: Car },
  { id: 'bookings',   label: 'Booking Management', icon: List },
  { id: 'documents',  label: 'Document Review',    icon: FileCheck },   // NEW
  { id: 'accounts',   label: 'Account Management', icon: UserPlus },    // NEW
  { id: 'locations',  label: 'Locations',           icon: MapPin },
  { id: 'analytics',  label: 'Analytics',           icon: TrendingUp },
  { id: 'settings',   label: 'Settings',            icon: Settings },
];

// In render:
{activeTab === 'documents' && <AdminDocumentsView />}
{activeTab === 'accounts'  && <AdminAccountsView />}
```

---

## 🔄 Business Logic Flows

### Flow 1: Document Review
```
Customer uploads OR/CR → teller.vehicles (or_doc, cr_doc) + teller.uploads
  ↓
Admin: Documents tab → GET teller.vehicles JOIN account.profiles
  ↓
Approve → INSERT account.document_verifications (status='approved')
          UPDATE account.profiles SET is_verified = true
          INSERT partner.activity_logs (action='APPROVE_DOC')
  OR
Reject  → INSERT account.document_verifications (status='rejected', rejection_reason)
          INSERT partner.activity_logs (action='REJECT_DOC')
```

### Flow 2: Create Teller / Business Partner
```
Admin: Accounts tab → Create Account modal
  ↓
INSERT account.profiles (role='driver' or 'operator', location_id=selected)
  ↓
If operator → UPDATE parking_lot.locations SET owner_id = new profile id
INSERT partner.activity_logs (action='CREATE_TELLER' or 'CREATE_PARTNER')
```

### Flow 3: Add New Parking Lot Location
```
Admin: Locations tab → "Add Location" button → form
  ↓
INSERT parking_lot.locations (name, address, lat, lng, pricePerHour, amenities, owner_id)
  ↓
Slot config: floors × sections × slots per section
  ↓
Bulk INSERT parking_lot.parking_slots (auto-generated labels: A-1, A-2, B-1, etc.)
  ↓
UPDATE parking_lot.locations SET total_spots, available_spots
INSERT partner.activity_logs (action='CREATE_LOCATION')
```

---

## ✅ Acceptance Criteria

1. **NestJS backend** — new `AdminModule` with services using injected `Sequelize` + raw SQL
2. **No `public` schema** — strictly `account`, `teller`, `parking_lot`, `reservation`, `partner`
3. **No new tables** — use only existing tables listed above
4. **Location assignment via `account.profiles.location_id`** — not JSONB
5. Admin can review/approve/reject vehicle documents (OR/CR)
6. Admin can create teller (`driver`) and business partner (`operator`) accounts
7. Admin can **add new parking lot locations** with slot auto-generation
8. Admin can assign a parking lot to a franchise business partner
9. Activity logged in `partner.activity_logs` via existing `LogService`
10. Follows PakiPark design system (`#1e3d5a`, `#ee6b20`, Lucide icons)
11. Tab-based integration in existing admin layout

---

> **KEY RULE**: Schemas: `account.*` (profiles, admin_accounts, document_verifications), `teller.*` (vehicles, uploads, settings), `parking_lot.*` (locations, parking_slots, parking_rates), `reservation.*` (bookings, transaction_logs), `partner.*` (activity_logs, reviews), `payment.*` (payment_transactions, escrow_holds, refunds). **NEVER `public.*`**. NestJS + Sequelize models + raw SQL. Zero new tables.
