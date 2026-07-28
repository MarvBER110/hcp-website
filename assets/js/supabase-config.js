/* Supabase-Konfiguration + Client-Factory für die statische Site.
   Der anon key ist bewusst öffentlich (Browser-Client) und über
   Row-Level-Security in Supabase abgesichert. */
window.HCP_SUPABASE = {
  url: "https://ifbikoulgenpjzkscosa.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmYmlrb3VsZ2VucGp6a3Njb3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzY4NjYsImV4cCI6MjA5NzIxMjg2Nn0.GhUo5H0WxqwkQXMrJCQ5Rd8oesGQdTW6uuR3Aqz_Gu0",
  bucket: "bewerbungen"
};

/* Liefert einen (einmalig erzeugten) Supabase-Client.
   Setzt voraus, dass das CDN-Script @supabase/supabase-js bereits geladen ist. */
window.hcpSupabase = (function () {
  var client = null;
  return function () {
    if (client) return client;
    if (!window.supabase || !window.supabase.createClient) {
      console.error("Supabase-JS (CDN) nicht geladen.");
      return null;
    }
    client = window.supabase.createClient(window.HCP_SUPABASE.url, window.HCP_SUPABASE.anonKey);
    return client;
  };
})();
