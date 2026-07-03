export interface ReleaseManifest {
  schema_version: string;
  manifest_id: string;
  product: string;
  channel: 'stable' | 'beta' | 'canary' | 'lts';
  released_at: string;
  expires_at: string | null;
  version: VersionInfo;
  artifacts: Artifact[];
  release_notes: ReleaseNotes;
  rollout: Rollout;
  dependencies: Dependency[] | null;
  revoked: boolean;
  revocation: Revocation | null;
}

export interface VersionInfo {
  semver: string;
  build: string;
  major: number;
  minor: number;
  patch: number;
  prerelease?: string | null;
}

export interface Artifact {
  artifact_id: string;
  platform: 'linux' | 'macos' | 'windows';
  arch: 'x64' | 'arm64' | 'x86';
  url: string;
  sha256: string;
  size_bytes: number;
  signature: string;
  notes?: string | null;
}

export interface ReleaseNotes {
  summary: string;
  highlights: string[];
  breaking_changes: string[];
  url?: string | null;
}

export interface Rollout {
  strategy: 'immediate' | 'staged' | 'canary';
  staged_percentage: number;
  canary_groups: string[];
  start_at: string;
}

export interface Dependency {
  name: string;
  constraint: string;
}

export interface Revocation {
  reason: string;
  revoked_at: string;
  revoked_by: string;
}
