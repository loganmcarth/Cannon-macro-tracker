const supabaseUrl =
    "https://weltxmtqzqhkupauxice.supabase.co";

const supabaseKey =
    "sb_publishable_rI4tnemwBdlsMECw8i7C5A_v7a8wk1g";

const supabase =
    window.supabase.createClient(
        supabaseUrl,
        supabaseKey
    );


async function signUp() {

    const email =
        document.getElementById(
            "email"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    const { error } =
        await supabase.auth.signUp({

            email,
            password

        });

    if (error) {

        alert(error.message);

    } else {

        alert(
            "Account created!"
        );

    }
}

async function signIn() {

    const email =
        document.getElementById(
            "email"
        ).value;

    const password =
        document.getElementById(
            "password"
        ).value;

    const { error } =
        await supabase.auth.signInWithPassword({

            email,
            password

        });

    if (error) {

        alert(error.message);

    } else {

        alert(
            "Logged in!"
        );

    }
}