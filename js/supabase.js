const SUPABASE_URL = "https://mldhvtivrpdimtzdgiin.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dzSNDnPU8FZa2Zy7nxj_pQ_J8lV4dQ2";

let supabaseClient = null;

function initializeSupabase() {
  // Check credentials first
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn(
      "LEXON AI: Supabase credentials have not been configured yet."
    );

    return null;
  }

  // Check Supabase library
  if (
    typeof window.supabase === "undefined" ||
    typeof window.supabase.createClient !== "function"
  ) {
    console.error(
      "LEXON AI: Supabase library is not loaded."
    );

    return null;
  }

  // Return existing client
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log("LEXON AI: Supabase initialized successfully.");

    return supabaseClient;
  } catch (error) {
    console.error(
      "LEXON AI: Failed to initialize Supabase.",
      error
    );

    return null;
  }
}

/* =========================================================
   GET SUPABASE CLIENT
   ========================================================= */

function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  return initializeSupabase();
}

/* =========================================================
   GET CURRENT USER
   ========================================================= */

async function getCurrentUser() {
  const client = getSupabase();

  if (!client) {
    return null;
  }

  try {
    const result = await client.auth.getUser();

    if (result.error) {
      console.warn(
        "LEXON AI: Could not get current user.",
        result.error
      );

      return null;
    }

    return result.data?.user || null;
  } catch (error) {
    console.error(
      "LEXON AI: User lookup failed.",
      error
    );

    return null;
  }
}

/* =========================================================
   GET CURRENT SESSION
   ========================================================= */

async function getCurrentSession() {
  const client = getSupabase();

  if (!client) {
    return null;
  }

  try {
    const result = await client.auth.getSession();

    if (result.error) {
      console.warn(
        "LEXON AI: Could not get session.",
        result.error
      );

      return null;
    }

    return result.data?.session || null;
  } catch (error) {
    console.error(
      "LEXON AI: Session lookup failed.",
      error
    );

    return null;
  }
}

/* =========================================================
   SIGN OUT
   ========================================================= */

async function signOutUser() {
  const client = getSupabase();

  if (!client) {
    return {
      success: false,
      error: "Supabase is not configured."
    };
  }

  try {
    const result = await client.auth.signOut();

    if (result.error) {
      return {
        success: false,
        error: result.error.message || result.error
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error: error?.message || "Unable to sign out."
    };
  }
}

/* =========================================================
   AUTH STATE CHANGE
   ========================================================= */

function onAuthStateChange(callback) {
  const client = getSupabase();

  if (!client || typeof callback !== "function") {
    return null;
  }

  try {
    return client.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );
  } catch (error) {
    console.error(
      "LEXON AI: Auth listener failed.",
      error
    );

    return null;
  }
}

/* =========================================================
   PUBLIC API
   ========================================================= */

window.LexonSupabase = {
  client: getSupabase,
  getCurrentUser: getCurrentUser,
  getCurrentSession: getCurrentSession,
  signOut: signOutUser,
  onAuthStateChange: onAuthStateChange
};

/* =========================================================
   INITIALIZE
   ========================================================= */

initializeSupabase();