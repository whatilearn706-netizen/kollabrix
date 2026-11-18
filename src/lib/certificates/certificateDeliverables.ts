/**
 * Dynamic collegiate deliverables generator tailored to member role and project initiative.
 */
export function getRoleDeliverables(role: string, category: string, title: string): string[] {
  const r = role.toLowerCase();
  if (r.includes('lead') || r.includes('architect')) {
    return [
      `Spearheaded overall system architecture, sprint roadmaps, and technical specifications for ${title}.`,
      'Engineered core backend pipelines, database migrations, and production deployment scripts.',
      'Governed code reviews, API security contracts, and continuous verification milestones.',
    ];
  }
  if (r.includes('front') || r.includes('ui') || r.includes('design')) {
    return [
      `Architected responsive user interface and component design system for ${title}.`,
      'Implemented real-time client state synchronization, accessible UX patterns, and micro-interactions.',
      'Optimized Core Web Vitals, dynamic asset delivery, and cross-device interface fidelity.',
    ];
  }
  if (r.includes('back') || r.includes('api') || r.includes('database')) {
    return [
      `Engineered RESTful API endpoints, async webhook pipelines, and data models for ${title}.`,
      'Optimized database indexing, query execution plans, and transaction boundaries with PostgreSQL.',
      'Implemented JWT session validation, role-based access control, and edge caching policies.',
    ];
  }
  if (r.includes('ai') || r.includes('ml') || r.includes('data')) {
    return [
      `Engineered multimodal machine learning inference pipelines and feature extraction for ${title}.`,
      'Integrated OCR text extraction, localized language models, and automated data labeling loops.',
      'Optimized inference latency, evaluation accuracy thresholds, and vector embeddings.',
    ];
  }
  if (r.includes('devops') || r.includes('cloud') || r.includes('infra')) {
    return [
      `Configured Docker multi-stage container orchestration and reverse-proxy routing for ${title}.`,
      'Automated CI/CD validation pipelines, linting gates, and automated test coverage suites.',
      'Monitored service health metrics, process restarts, and zero-downtime deployments.',
    ];
  }
  return [
    `Shipped verified production features, component logic, and integration tests for ${title}.`,
    'Collaborated on sprint deliverables, peer pull requests, and automated regression suites.',
    `Demonstrated high-velocity execution in ${category} domain standards and collegiate engineering.`,
  ];
}
