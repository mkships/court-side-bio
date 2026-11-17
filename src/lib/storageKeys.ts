// Browser storage keys shared between the landing page, studio and public profile.
export const WORKSPACE_KEY = "courtside:workspace:v1";
export const CLAIM_KEY = "courtside:claim";

// Same character rule the onboarding username field applies while typing.
export const cleanUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);

