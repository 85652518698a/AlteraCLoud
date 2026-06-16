package com.altera.cloud;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabsIntent;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.firebase.auth.AuthResult;
import com.google.android.gms.tasks.Task;

public class MainActivity extends AppCompatActivity {
    private static final int RC_SIGN_IN = 9001;
    private FirebaseAuth mAuth;
    private GoogleSignInClient mGoogleSignInClient;
    private Button signInButton;
    private Button openAppButton;
    private TextView statusText;
    private String firebaseIdToken;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        mAuth = FirebaseAuth.getInstance();

        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);

        signInButton = findViewById(R.id.signInButton);
        openAppButton = findViewById(R.id.openAppButton);
        statusText = findViewById(R.id.statusText);

        FirebaseUser currentUser = mAuth.getCurrentUser();
        if (currentUser != null) {
            onSignedIn(currentUser);
        }

        signInButton.setOnClickListener(v -> signIn());
        openAppButton.setOnClickListener(v -> openWebApp());
    }

    private void signIn() {
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult();
                firebaseAuthWithGoogle(account.getIdToken());
            } catch (Exception e) {
                statusText.setText("Sign-in failed: " + e.getMessage());
            }
        }
    }

    private void firebaseAuthWithGoogle(String idToken) {
        Task<AuthResult> authTask = mAuth.signInWithCredential(
                GoogleAuthProvider.getCredential(idToken, null));
        authTask.addOnCompleteListener(this, task -> {
            if (task.isSuccessful()) {
                FirebaseUser user = mAuth.getCurrentUser();
                if (user != null) {
                    user.getIdToken(false).addOnCompleteListener(tokenTask -> {
                        if (tokenTask.isSuccessful()) {
                            firebaseIdToken = tokenTask.getResult().getToken();
                        }
                        onSignedIn(user);
                    });
                }
            } else {
                statusText.setText("Firebase auth failed");
            }
        });
    }

    private void onSignedIn(FirebaseUser user) {
        signInButton.setVisibility(View.GONE);
        openAppButton.setVisibility(View.VISIBLE);
        statusText.setText("Signed in as " + user.getEmail());
    }

    private void openWebApp() {
        String url = "https://altera-cloud.vercel.app";
        if (firebaseIdToken != null) {
            url += "?token=" + firebaseIdToken;
        }
        CustomTabsIntent.Builder builder = new CustomTabsIntent.Builder();
        builder.setShowTitle(false);
        CustomTabsIntent customTabsIntent = builder.build();
        customTabsIntent.launchUrl(this, Uri.parse(url));
    }
}
