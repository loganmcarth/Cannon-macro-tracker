const supabaseUrl = "https://weltxmtqzqhkupauxice.supabase.co";
const supabaseKey = "sb_publishable_rI4tnemwBdlsMECw8i7C5A_v7a8wk1g";

const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function signUp() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert(error.message);
    } else {
        alert("Account created! Check your email if confirmation is required.");
    }
}

async function signIn() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert(error.message);
    } else {
        alert("Logged in!");
    }
}

async function saveEntry(name, calories, protein) {
    const { error } = await supabaseClient
        .from("entries")
        .insert({ name, calories, protein });
    if (error) alert(error.message);
}

async function loadTodayEntries() {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabaseClient
        .from("entries")
        .select("*")
        .eq("date", today)
        .order("created_at");
    if (error) { alert(error.message); return []; }
    return data;
}

async function loadHistory() {
    const { data, error } = await supabaseClient
        .from("entries")
        .select("*")
        .order("date", { ascending: false });
    return error ? [] : data;
}