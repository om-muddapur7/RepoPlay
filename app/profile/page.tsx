export default function Profile() {
  return <main className="shell studio"><header><h1>Your profile</h1><p id="profile-status" role="status">Checking your account…</p></header>
    <section id="profile-details" hidden className="landing-card"><h2>Free trial</h2><p>Current plan · Two website previews, ten minutes each. Trial limits are planned.</p><div className="landing-actions"><a href="/plans" className="button">Compare plans</a><a href="/workspace#gallery" className="quiet-button">Your projects</a></div></section>
    <a href="/signin" className="button" hidden id="profile-login">Sign in with Google</a></main>
}
