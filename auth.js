const supabaseUrl =
    "YOUR_PROJECT_URL";

const supabaseKey =
    "YOUR_ANON_KEY";

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