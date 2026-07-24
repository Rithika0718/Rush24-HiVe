import { CloudIncident, ServiceNode, CloudIntegration, ChaosScenario } from '../types';

export const INITIAL_INTEGRATIONS: CloudIntegration[] = [
  {
    provider: 'GCP',
    name: 'Google Cloud Platform (prod-us-central1)',
    connected: true,
    region: 'us-central1',
    resourceCount: 42,
    lastSync: 'Just now',
    credentialsConfigured: true,
  },
  {
    provider: 'AWS',
    name: 'Amazon Web Services (us-east-1)',
    connected: true,
    region: 'us-east-1',
    resourceCount: 88,
    lastSync: '1 min ago',
    credentialsConfigured: true,
  },
  {
    provider: 'Kubernetes',
    name: 'Primary EKS Cluster (k8s-prod-cluster-01)',
    connected: true,
    region: 'us-east-1',
    resourceCount: 156,
    lastSync: 'Real-time websocket',
    credentialsConfigured: true,
  },
  {
    provider: 'Azure',
    name: 'Azure Cloud (eu-west-1)',
    connected: false,
    region: 'westeurope',
    resourceCount: 0,
    lastSync: 'Disconnected',
    credentialsConfigured: false,
  }
];

export const INITIAL_NODES: ServiceNode[] = [
  {
    id: 'gateway-01',
    name: 'api-gateway-v2',
    provider: 'AWS',
    region: 'us-east-1',
    type: 'gateway',
    status: 'HEALTHY',
    cpu: 28,
    memory: 45,
    latency: 12,
    reqRate: 1450,
    dependencies: ['auth-svc', 'order-svc', 'payment-svc'],
  },
  {
    id: 'auth-svc',
    name: 'auth-service',
    provider: 'GCP',
    region: 'us-central1',
    type: 'microservice',
    status: 'HEALTHY',
    cpu: 34,
    memory: 52,
    latency: 18,
    reqRate: 890,
    dependencies: ['redis-cache', 'users-db'],
  },
  {
    id: 'order-svc',
    name: 'order-processor-v3',
    provider: 'Kubernetes',
    region: 'us-east-1',
    type: 'microservice',
    status: 'INCIDENT',
    cpu: 98,
    memory: 94,
    latency: 840,
    reqRate: 620,
    dependencies: ['postgres-orders', 'kafka-events'],
  },
  {
    id: 'payment-svc',
    name: 'stripe-payment-bridge',
    provider: 'AWS',
    region: 'us-east-1',
    type: 'microservice',
    status: 'HEALTHY',
    cpu: 22,
    memory: 38,
    latency: 45,
    reqRate: 310,
    dependencies: ['redis-cache'],
  },
  {
    id: 'redis-cache',
    name: 'redis-cluster-global',
    provider: 'AWS',
    region: 'us-east-1',
    type: 'cache',
    status: 'HEALTHY',
    cpu: 18,
    memory: 61,
    latency: 2,
    reqRate: 3400,
    dependencies: [],
  },
  {
    id: 'postgres-orders',
    name: 'rds-pg-orders-primary',
    provider: 'AWS',
    region: 'us-east-1',
    type: 'database',
    status: 'DEGRADED',
    cpu: 89,
    memory: 88,
    latency: 240,
    reqRate: 1200,
    dependencies: [],
  },
  {
    id: 'users-db',
    name: 'cloud-spanner-users',
    provider: 'GCP',
    region: 'us-central1',
    type: 'database',
    status: 'HEALTHY',
    cpu: 25,
    memory: 40,
    latency: 8,
    reqRate: 980,
    dependencies: [],
  },
  {
    id: 'kafka-events',
    name: 'msk-kafka-eventhub',
    provider: 'AWS',
    region: 'us-east-1',
    type: 'queue',
    status: 'HEALTHY',
    cpu: 41,
    memory: 59,
    latency: 14,
    reqRate: 4800,
    dependencies: [],
  }
];

export const INITIAL_INCIDENTS: CloudIncident[] = [
  {
    id: 'INC-8902',
    title: 'K8s Pod OOMKilled & Memory Leak on order-processor-v3',
    cloudProvider: 'Kubernetes',
    region: 'us-east-1',
    service: 'order-processor-v3',
    severity: 'CRITICAL',
    status: 'ANALYZING',
    detectedAt: new Date(Date.now() - 6 * 60000).toISOString(),
    metrics: {
      cpuUsagePct: 98,
      memoryUsagePct: 94,
      errorRatePct: 24.8,
      latencyMs: 840,
      requestsPerSec: 620,
    },
    rawLogs: [
      '[2026-07-24T11:33:01.120Z] [ERROR] node-04.us-east-1.compute.internal: Kernel OOM-Killer invoked on pid 29482 (node)',
      '[2026-07-24T11:33:02.400Z] [FATAL] order-processor-v3-7d89f8b4c-9x2pl memory footprint exceeded container limit of 2048MiB (Current: 2041MiB)',
      '[2026-07-24T11:33:04.890Z] [WARN] k8s-event-router: Pod order-processor-v3-7d89f8b4c-9x2pl restart count increased to 14 in last 10 minutes',
      '[2026-07-24T11:33:08.100Z] [ERROR] connection_pool.go:214: Postgres DB connection pool exhausted for rds-pg-orders-primary (Max: 100, Active: 100, Waiting: 45)',
      '[2026-07-24T11:33:12.330Z] [ERROR] HTTP 500 downstream failure from order-processor-v3: context deadline exceeded'
    ],
    agentTraces: [
      {
        id: 'tr-01',
        agentRole: 'sentinel',
        agentName: 'Aether Sentinel-Alpha',
        timestamp: new Date(Date.now() - 5 * 60000).toLocaleTimeString(),
        action: 'Anomaly Detection',
        details: 'Triggered alert: Memory usage on node k8s-prod-cluster-01 hit 94% with error rate spike to 24.8%',
        status: 'completed'
      },
      {
        id: 'tr-02',
        agentRole: 'log_investigator',
        agentName: 'Log Cortex Agent',
        timestamp: new Date(Date.now() - 4 * 60000).toLocaleTimeString(),
        action: 'Log & Stacktrace Correlation',
        details: 'Identified buffer allocation un-freed in async event listener loop in order-processor-v3 v2.4.1. Unclosed DB connections created cascading pool lock.',
        status: 'completed',
        codeSnippet: `// Leaking loop detected in order_service.ts:89
async function processOrderQueue(batch) {
  const conn = await pgPool.connect(); // missing release in error try-catch block!
  batch.forEach(order => processItem(order));
}`
      },
      {
        id: 'tr-03',
        agentRole: 'remediation_agent',
        agentName: 'Auto-Healing Agent',
        timestamp: new Date(Date.now() - 2 * 60000).toLocaleTimeString(),
        action: 'Playbook Generation',
        details: 'Formulated 3-phase remediation playbook: 1) Increase K8s memory request/limit temporarily, 2) Rollback deployment to stable tag v2.4.0, 3) Flush active hanging connection state in RDS.',
        status: 'thinking'
      }
    ],
    rootCauseAnalysis: {
      summary: 'Memory leak introduced in build v2.4.1 causes un-released PostgreSQL connection pooling and rapid container heap growth leading to Kubernetes OOMKilled crashes.',
      primaryCause: 'Unclosed DB connection pool in error handler inside `order_service.ts` async worker loop.',
      affectedComponents: ['order-processor-v3', 'rds-pg-orders-primary', 'api-gateway-v2'],
      confidenceScore: 96
    },
    playbook: {
      title: 'Emergency Container Rollback & Memory Quota Patch',
      summary: 'Safely scales memory limit to absorb traffic and rolls back order-processor-v3 to target release v2.4.0.',
      requiresHumanApproval: true,
      steps: [
        {
          id: 'step-1',
          title: 'Patch Deployment Resource Limit',
          command: 'kubectl set resources deployment/order-processor-v3 -n production --limits=memory=4096Mi --requests=memory=2096Mi',
          type: 'kubectl',
          riskLevel: 'LOW',
          status: 'pending'
        },
        {
          id: 'step-2',
          title: 'Rollback Deployment to Known Stable Image v2.4.0',
          command: 'kubectl set image deployment/order-processor-v3 order-processor=registry.cloud.net/orders:v2.4.0 -n production',
          type: 'kubectl',
          riskLevel: 'MEDIUM',
          status: 'pending'
        },
        {
          id: 'step-3',
          title: 'Reset Hanging Idle Connections on Primary RDS Instance',
          command: 'aws rds reboot-db-instance --db-instance-identifier rds-pg-orders-primary --force-failover=false',
          type: 'aws_cli',
          riskLevel: 'HIGH',
          status: 'pending'
        }
      ]
    }
  },
  {
    id: 'INC-8901',
    title: 'High CPU Spike & Connection Timeout on RDS PostgreSQL',
    cloudProvider: 'AWS',
    region: 'us-east-1',
    service: 'rds-pg-orders-primary',
    severity: 'HIGH',
    status: 'RESOLVED',
    detectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    resolvedAt: new Date(Date.now() - 32 * 60000).toISOString(),
    metrics: {
      cpuUsagePct: 15,
      memoryUsagePct: 40,
      errorRatePct: 0.1,
      latencyMs: 14,
      requestsPerSec: 1200,
    },
    rawLogs: [
      '[2026-07-24T10:55:10Z] [WARN] AWS CloudWatch: CPUUtilization > 92.5% for 3 consecutive evaluation periods',
      '[2026-07-24T10:56:02Z] [INFO] Agent Sentinel: Automated indexing suggestion executed for unindexed query on table order_items(created_at)'
    ],
    agentTraces: [],
    rootCauseAnalysis: {
      summary: 'Unindexed sequential query scan executed during scheduled inventory audit report created CPU lock.',
      primaryCause: 'Missing composite index on order_items(created_at, status).',
      affectedComponents: ['rds-pg-orders-primary'],
      confidenceScore: 98
    },
    postMortem: {
      executiveSummary: 'Automated Agent Sentinel detected CPU degradation at 10:55 UTC. Log Investigator identified missing SQL index on high-cardinality column. Remediation Agent executed concurrently created index CONCURRENTLY without downtime.',
      mttrMinutes: 13,
      impactDescription: 'Slight latency increase on checkout APIs for 12 minutes. Zero dropped orders.',
      preventionSteps: [
        'Enforce automated DDL schema index check in PR CI pipeline.',
        'Set query timeout limit to 5000ms for non-interactive reporting users.'
      ]
    }
  }
];

export const CHAOS_SCENARIOS: ChaosScenario[] = [
  {
    id: 'scenario-oom',
    title: 'Kubernetes Pod OOMKilled & Memory Pressure',
    provider: 'Kubernetes',
    service: 'order-processor-v3',
    severity: 'CRITICAL',
    description: 'Simulate a memory leak in order-processor pod causing Kubernetes worker node memory thrashing and crashlooping.',
    metrics: {
      cpuUsagePct: 96,
      memoryUsagePct: 98,
      errorRatePct: 32.4,
      latencyMs: 1250,
      requestsPerSec: 410
    },
    logs: [
      '[CHAOS_SIMULATOR] Injected heap allocation spike in order-processor pod pid 481',
      '[K8S_KERNEL] Container order-processor cgroup out of memory: Kill process 481 (node)',
      '[K8S_EVENT] Liveness probe failed: HTTP probe failed with statuscode: 503',
      '[ALARM] CPU throttling active for namespace production (88% quota exceeded)'
    ]
  },
  {
    id: 'scenario-db-deadlock',
    title: 'PostgreSQL RDS Connection Pool Exhaustion',
    provider: 'AWS',
    service: 'rds-pg-orders-primary',
    severity: 'CRITICAL',
    description: 'Simulate high concurrent lock contention on row updates leading to max connection pool limit breached.',
    metrics: {
      cpuUsagePct: 92,
      memoryUsagePct: 84,
      errorRatePct: 41.2,
      latencyMs: 3400,
      requestsPerSec: 150
    },
    logs: [
      '[POSTGRES_LOG] ERROR: deadlock detected. Process 14902 waits for ExclusiveLock on relation orders',
      '[AWS_CLOUDWATCH] DatabaseConnections metric breached threshold: 100/100 connections active',
      '[APP_GATEWAY] 504 Gateway Timeout from backend rds-pg-orders-primary',
      '[AGENT_ALERT] Cascading failure detected across 3 dependant microservices'
    ]
  },
  {
    id: 'scenario-ingress-502',
    title: 'Ingress NGINX SSL Certificate Expiry / 502 Bad Gateway',
    provider: 'GCP',
    service: 'api-gateway-v2',
    severity: 'HIGH',
    description: 'Simulate edge ingress TLS certificate validation failure rejecting incoming client HTTPS requests.',
    metrics: {
      cpuUsagePct: 18,
      memoryUsagePct: 30,
      errorRatePct: 98.9,
      latencyMs: 8,
      requestsPerSec: 0
    },
    logs: [
      '[NGINX_ERROR] 2026/07/24 11:38:00 [error] 12#12: *910242 SSL_do_handshake() failed (SSL: error:0A000086:SSL routines::certificate verify failed)',
      '[GCP_LOAD_BALANCER] Health check failed for target pool k8s-ingress-pool-us-central1',
      '[CERT_MANAGER] Certificate api.cloudplatform.internal expired at 2026-07-24T11:00:00Z',
      '[CLIENT_METRIC] 100% request drop rate on edge DNS api.company.io'
    ]
  },
  {
    id: 'scenario-cpu-spike',
    title: 'Sudden DDOS Traffic Spike & CPU Saturation',
    provider: 'AWS',
    service: 'auth-service',
    severity: 'HIGH',
    description: 'Simulate 10x ingress HTTP traffic surge overwhelming default auto-scaler policy target.',
    metrics: {
      cpuUsagePct: 99,
      memoryUsagePct: 75,
      errorRatePct: 18.5,
      latencyMs: 650,
      requestsPerSec: 12500
    },
    logs: [
      '[TRAFFIC_GUARD] Anomalous traffic pattern detected from IP range 185.220.101.0/24 (12,500 req/sec)',
      '[AUTH_SVC] bcrypt password hashing threadpool saturated (Queue depth: 4,120 jobs)',
      '[AWS_AUTO_SCALE] Max capacity (10 instances) reached for AutoScalingGroup auth-svc-asg',
      '[SENTINEL] Auto-throttle rule recommendation: Enable Cloudflare DDoS Protection & Rate Limiting'
    ]
  }
];
