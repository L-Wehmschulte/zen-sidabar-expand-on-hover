/** Custom CLI args passed to rollup */
export type RollupArgs = Partial<{
  "config-mode": "development" | "production";
  "config-branch": "main";
  "config-assetSource": "local" | "github";
  "config-suffix": string;
}>;
