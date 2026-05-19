import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { ProfileModule } from './profile/profile.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule, ShipmentsModule, ProfileModule],
  controllers: [HealthController],
})
export class AppModule {}
