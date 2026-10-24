export default function HomePage() {
  return (
    <main style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
      <iframe
        title="Kilari EV charging application"
        src="/kilari.html"
        style={{ display: 'block', width: '100%', height: '100%', border: 0 }}
        allow="geolocation"
      />
    </main>
  );
}
