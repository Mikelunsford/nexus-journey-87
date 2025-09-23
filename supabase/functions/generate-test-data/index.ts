import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { type, customerId, projectId } = await req.json();

    // Get user profile to determine org_id
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      return new Response(JSON.stringify({ error: 'No organization found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result = {};

    switch (type) {
      case 'project':
        result = await generateTestProject(supabaseClient, profile.org_id, customerId);
        break;
      case 'quote':
        result = await generateTestQuote(supabaseClient, profile.org_id, customerId);
        break;
      case 'shipment':
        result = await generateTestShipment(supabaseClient, profile.org_id, customerId, projectId);
        break;
      case 'message':
        result = await generateTestMessage(supabaseClient, profile.org_id, customerId);
        break;
      case 'document':
        result = await generateTestDocument(supabaseClient, profile.org_id, customerId, projectId);
        break;
      default:
        throw new Error(`Unknown test data type: ${type}`);
    }

    console.log(`Generated test ${type}:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating test data:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateTestProject(supabaseClient: any, orgId: string, customerId?: string) {
  // Get a customer if not provided
  let customerIdToUse = customerId;
  if (!customerIdToUse) {
    const { data: customers } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);
    customerIdToUse = customers?.[0]?.id;
  }

  if (!customerIdToUse) {
    throw new Error('No customer found for test project');
  }

  const testProject = {
    org_id: orgId,
    customer_id: customerIdToUse,
    title: `Test Project - ${new Date().toLocaleDateString()} (Test)`,
    description: 'This is a test project generated for demonstration purposes. It includes sample milestones and tasks.',
    status: 'active',
    priority: 'high',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    budget: 15000.00,
    progress: 25,
    is_test: true,
    metadata: {
      test_generated: true,
      generated_at: new Date().toISOString(),
      milestones: [
        { name: 'Project Kickoff', due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
        { name: 'Design Phase', due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'in_progress' },
        { name: 'Development Phase', due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
        { name: 'Testing & Launch', due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' }
      ]
    }
  };

  const { data, error } = await supabaseClient
    .from('projects')
    .insert(testProject)
    .select()
    .single();

  if (error) throw error;

  // Generate a test work order for this project
  const testWorkOrder = {
    org_id: orgId,
    project_id: data.id,
    title: `Test Work Order - Design Review (Test)`,
    description: 'Review and approve initial design concepts for the test project.',
    status: 'in_progress',
    priority: 'high',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    actual_hours: 3,
    is_test: true
  };

  await supabaseClient
    .from('work_orders')
    .insert(testWorkOrder);

  return { project: data, type: 'project' };
}

async function generateTestQuote(supabaseClient: any, orgId: string, customerId?: string) {
  // Get a customer if not provided
  let customerIdToUse = customerId;
  if (!customerIdToUse) {
    const { data: customers } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);
    customerIdToUse = customers?.[0]?.id;
  }

  if (!customerIdToUse) {
    throw new Error('No customer found for test quote');
  }

  const testQuote = {
    org_id: orgId,
    customer_id: customerIdToUse,
    status: 'draft',
    total: 12500.00,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'This is a test quote generated for demonstration purposes.',
    is_test: true,
    line_items: [
      {
        description: 'Website Design & Development',
        quantity: 1,
        unit_price: 8000.00,
        total: 8000.00
      },
      {
        description: 'Content Management System Setup',
        quantity: 1,
        unit_price: 3000.00,
        total: 3000.00
      },
      {
        description: 'SEO Optimization Package',
        quantity: 1,
        unit_price: 1500.00,
        total: 1500.00
      }
    ]
  };

  const { data, error } = await supabaseClient
    .from('quotes')
    .insert(testQuote)
    .select()
    .single();

  if (error) throw error;

  return { quote: data, type: 'quote' };
}

async function generateTestShipment(supabaseClient: any, orgId: string, customerId?: string, projectId?: string) {
  let projectIdToUse = projectId;
  if (!projectIdToUse) {
    const { data: projects } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);
    projectIdToUse = projects?.[0]?.id;
  }

  const testShipment = {
    org_id: orgId,
    project_id: projectIdToUse,
    status: 'in_transit',
    tracking_number: `TEST${Date.now()}`,
    carrier: 'FedEx',
    address: '123 Test Street, Demo City, DC 12345',
    shipped_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    is_test: true,
    items: [
      {
        name: 'Hardware Components',
        quantity: 5,
        weight: '2.5 lbs'
      },
      {
        name: 'Installation Guide',
        quantity: 1,
        weight: '0.2 lbs'
      }
    ],
    metadata: {
      test_generated: true,
      estimated_delivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  const { data, error } = await supabaseClient
    .from('shipments')
    .insert(testShipment)
    .select()
    .single();

  if (error) throw error;

  return { shipment: data, type: 'shipment' };
}

async function generateTestMessage(supabaseClient: any, orgId: string, customerId?: string) {
  const testMessage = {
    org_id: orgId,
    customer_id: customerId,
    type: 'email',
    subject: 'Test Message - Project Update (Test)',
    body: 'This is a test message generated for demonstration purposes. It contains sample project updates and attachments.',
    from_email: 'test@example.com',
    to_emails: ['customer@example.com'],
    status: 'sent',
    sent_at: new Date().toISOString(),
    is_test: true,
    data: {
      test_generated: true,
      attachments: [
        { name: 'project_update.pdf', size: '1.2MB' },
        { name: 'timeline.jpg', size: '450KB' }
      ]
    }
  };

  const { data, error } = await supabaseClient
    .from('messages')
    .insert(testMessage)
    .select()
    .single();

  if (error) throw error;

  return { message: data, type: 'message' };
}

async function generateTestDocument(supabaseClient: any, orgId: string, customerId?: string, projectId?: string) {
  let entityId = projectId;
  let entityType = 'project';
  
  if (!entityId) {
    // Try to find a quote or project to link to
    const { data: projects } = await supabaseClient
      .from('projects')
      .select('id')
      .eq('org_id', orgId)
      .limit(1);
    
    if (projects?.[0]) {
      entityId = projects[0].id;
    } else {
      const { data: quotes } = await supabaseClient
        .from('quotes')
        .select('id')
        .eq('org_id', orgId)
        .limit(1);
      
      if (quotes?.[0]) {
        entityId = quotes[0].id;
        entityType = 'quote';
      }
    }
  }

  const testDocument = {
    org_id: orgId,
    entity_type: entityType,
    entity_id: entityId,
    name: `Test Document - ${entityType} Specs (Test)`,
    original_name: `test_${entityType}_specifications.pdf`,
    mime_type: 'application/pdf',
    size_bytes: 245760, // ~240KB
    url: '/test/sample-document.pdf',
    storage_path: 'test/documents/sample.pdf',
    is_test: true,
    tags: ['test', 'specifications', entityType],
    metadata: {
      test_generated: true,
      generated_at: new Date().toISOString(),
      description: `Sample ${entityType} specifications and requirements document`
    }
  };

  const { data, error } = await supabaseClient
    .from('documents')
    .insert(testDocument)
    .select()
    .single();

  if (error) throw error;

  return { document: data, type: 'document' };
}