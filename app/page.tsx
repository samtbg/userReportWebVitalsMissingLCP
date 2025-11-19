// app/page.tsx

export default function HomePage() {
  return (
    <main>
      <div style={{ padding: '20px' }}>
        <h1>Next.js LCP Reporting Bug Reproduction</h1>
        <p>This app tracks LCP, FCP, and TTFB using custom OpenTelemetry instrumentation.</p>
        
        <h2>Reproduction Steps:</h2>
        <ol>
          <li>Open DevTools console and clear it.</li>
          <li>**Scenario 1 (FAIL - Idle User):** Reload the page. You should immediately see **TTFB** and **FCP** metrics recorded. Wait **12 seconds** without moving or clicking the mouse. The console will show the "10-second timer fired" message. The OTel flush will run, and the log will show **TTFB and FCP sent, but LCP missing.**</li>
          <li>**Scenario 2 (SUCCESS - Interactive User):** Reload the page. Wait **5 seconds** (LCP element is visible). **Click once anywhere on the white space.** The console should show the LCP metric recorded. Wait for the 10-second timer to fire (5 more seconds). The console will successfully show **TTFB, FCP, and LCP** being sent.</li>
        </ol>
        
        <div style={{ 
          width: '90%', 
          height: '60vh', 
          backgroundColor: '#0070f3',
          marginTop: '30px', 
          fontSize: '32px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          LARGEST CONTENTFUL PAINT CANDIDATE
        </div>
      </div>
    </main>
  );
}
