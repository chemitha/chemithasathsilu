import { NextResponse } from 'next/server';

// Interface matching the ProspectData structure trapped in localStorage
interface ProspectActivity {
  id: number;
  action: string;
  timestamp: string;
}

interface ProspectPayload {
  clientSlug: string;
  companyName: string;
  createdAt: string;
  activities: ProspectActivity[];
  // Optional app-specific local state (e.g., local notes, settings, drafts)
  appState?: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientSlug, companyName, createdAt, activities, appState }: ProspectPayload = body;

    // 1. Validation check
    if (!clientSlug || !companyName) {
      return NextResponse.json(
        { error: 'Missing required migration payload fields (clientSlug, companyName)' },
        { status: 400 }
      );
    }

    console.log(`[MIGRATION HANDSHAKE] Seeding DB for closed lead: ${companyName} (${clientSlug})`);

    // 2. PRODUCTION DB INSERTION / SEEDING LOGIC
    // Replace/Connect with your DB ORM (e.g., Supabase / Prisma / PostgreSQL)
    /*
      const tenant = await prisma.tenant.create({
        data: {
          slug: clientSlug,
          name: companyName,
          status: 'DEAL_CLOSED',
          trialStartedAt: new Date(createdAt),
          onboardedAt: new Date(),
          activities: {
            create: activities.map((a) => ({
              action: a.action,
              performedAt: new Date(a.timestamp),
            })),
          },
          initialState: appState || {},
        },
      });
    */

    // Simulated successful DB write confirmation
    const simulatedTenantId = `tenant_${clientSlug}_${Date.now()}`;

    // 3. Return successful handshake confirmation
    return NextResponse.json({
      success: true,
      message: `Tenant workspace provisioned and seeded successfully for ${companyName}`,
      tenantId: simulatedTenantId,
      migratedAt: new Date().toISOString(),
      migratedRecordsCount: activities?.length || 0,
    });
  } catch (error: any) {
    console.error('[MIGRATION ERROR] Handshake failed:', error);
    return NextResponse.json(
      { error: 'Failed to migrate local prospect state to production database', details: error?.message },
      { status: 500 }
    );
  }
}