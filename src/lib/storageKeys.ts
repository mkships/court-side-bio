// Browser storage keys shared between the landing page, studio and public profile.
export const WORKSPACE_KEY = "courtside:workspace:v1";
export const CLAIM_KEY = "courtside:claim";
export const LAUNCH_KEY = "courtside:launched";

// Same character rule the onboarding username field applies while typing.
export const cleanUsername = (value: string) => value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24);

// Runs from <head> before first paint: once the intro has played this session, CSS hides it immediately.
export const launchGateScript = `try{if(sessionStorage.getItem("${LAUNCH_KEY}"))document.documentElement.dataset.launched="1"}catch(e){}`;
