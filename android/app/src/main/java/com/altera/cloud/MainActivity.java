package com.altera.cloud;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.JavascriptInterface;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
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
    private WebView webView;
    private View loginView;
    private String firebaseIdToken;
    private String userEmail;
    private String userName;

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

        loginView = findViewById(R.id.loginView);
        webView = findViewById(R.id.webView);
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
                userEmail = account.getEmail();
                userName = account.getDisplayName();
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
        loginView.setVisibility(View.GONE);
        webView.setVisibility(View.VISIBLE);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setLayoutAlgorithm(WebSettings.LayoutAlgorithm.NARROW_COLUMNS);

        webView.addJavascriptInterface(new WebAppInterface(), "AndroidNative");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectAuth();
            }
        });

        webView.loadUrl("https://altera-cloud.vercel.app");
    }

    private class WebAppInterface {
        @JavascriptInterface
        public String getFirebaseToken() {
            return firebaseIdToken != null ? firebaseIdToken : "";
        }
        @JavascriptInterface
        public String getUserEmail() {
            return userEmail != null ? userEmail : "";
        }
        @JavascriptInterface
        public String getUserName() {
            return userName != null ? userName : "";
        }
        @JavascriptInterface
        public void signOut() {
            runOnUiThread(() -> {
                mAuth.signOut();
                mGoogleSignInClient.signOut();
                firebaseIdToken = null;
                userEmail = null;
                userName = null;
                webView.setVisibility(View.GONE);
                webView.removeAllViews();
                webView.loadUrl("about:blank");
                loginView.setVisibility(View.VISIBLE);
                signInButton.setVisibility(View.VISIBLE);
                openAppButton.setVisibility(View.GONE);
                statusText.setText("");
            });
        }
    }

    private void injectAuth() {
        String js = "javascript:(function() {" +
            "var token = AndroidNative.getFirebaseToken();" +
            "var email = AndroidNative.getUserEmail();" +
            "var name = AndroidNative.getUserName();" +
            "if (token && token.length > 0) {" +
            "  window.__ANDROID_FIREBASE_TOKEN = token;" +
            "  window.__ANDROID_USER_EMAIL = email;" +
            "  window.__ANDROID_USER_NAME = name;" +
            "  var evt = new CustomEvent('androidAuthReady', { detail: { token: token, email: email, name: name } });" +
            "  window.dispatchEvent(evt);" +
            "}" +
            "})()";
        webView.evaluateJavascript(js, null);
    }

    @Override
    public void onBackPressed() {
        if (webView.getVisibility() == View.VISIBLE && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
