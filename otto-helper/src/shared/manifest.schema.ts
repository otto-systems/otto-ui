import { ZodError, type ZodIssue, z } from 'zod';

import type { ReleaseManifest } from './manifest';

const versionInfoSchema = z.object({
  semver: z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/),
  build: z.string().min(1).max(128),
  major: z.number().int().min(0),
  minor: z.number().int().min(0),
  patch: z.number().int().min(0),
  prerelease: z.string().min(1).max(128).nullable().optional(),
});

const artifactSchema = z.object({
  artifact_id: z.string().min(1).max(128),
  platform: z.enum(['linux', 'macos', 'windows']),
  arch: z.enum(['x64', 'arm64', 'x86']),
  url: z.string().url(),
  sha256: z.string().regex(/^[A-Fa-f0-9]{64}$/),
  size_bytes: z.number().int().min(1),
  signature: z.string().min(8),
  notes: z.string().max(512).nullable().optional(),
});

const releaseNotesSchema = z.object({
  summary: z.string().min(1).max(4096),
  highlights: z.array(z.string().min(1).max(512)),
  breaking_changes: z.array(z.string().min(1).max(512)),
  url: z.string().url().nullable().optional(),
});

const rolloutSchema = z.object({
  strategy: z.enum(['immediate', 'staged', 'canary']),
  staged_percentage: z.number().int().min(0).max(100),
  canary_groups: z.array(z.string().min(1).max(128)),
  start_at: z.iso.datetime(),
});

const dependencySchema = z.object({
  name: z.string().min(1).max(128),
  constraint: z.string().min(1).max(128),
});

const revocationSchema = z.object({
  reason: z.string().min(1).max(1024),
  revoked_at: z.iso.datetime(),
  revoked_by: z.string().min(1).max(128),
});

export const releaseManifestSchema = z.object({
  schema_version: z.string().regex(/^\d+\.\d+$/),
  manifest_id: z.uuid(),
  product: z.string().min(1).max(64),
  channel: z.enum(['stable', 'beta', 'canary', 'lts']),
  released_at: z.iso.datetime(),
  expires_at: z.iso.datetime().nullable(),
  version: versionInfoSchema,
  artifacts: z.array(artifactSchema).min(1),
  release_notes: releaseNotesSchema,
  rollout: rolloutSchema,
  dependencies: z.array(dependencySchema).nullable(),
  revoked: z.boolean().default(false),
  revocation: revocationSchema.nullable(),
}).strict();

export interface ManifestParseIssue {
  path: string;
  message: string;
  code: string;
}

export class ManifestParseError extends Error {
  public readonly issues: ManifestParseIssue[];

  constructor(message: string, issues: ManifestParseIssue[]) {
    super(message);
    this.name = 'ManifestParseError';
    this.issues = issues;
  }
}

function mapIssue(issue: ZodIssue): ManifestParseIssue {
  return {
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  };
}

function parseIssues(error: ZodError): ManifestParseIssue[] {
  return error.issues.map(mapIssue);
}

export function parseManifest(json: unknown): ReleaseManifest {
  const result = releaseManifestSchema.safeParse(json);

  if (!result.success) {
    throw new ManifestParseError('Invalid release manifest payload', parseIssues(result.error));
  }

  return result.data;
}

export function isValidManifest(json: unknown): json is ReleaseManifest {
  return releaseManifestSchema.safeParse(json).success;
}
