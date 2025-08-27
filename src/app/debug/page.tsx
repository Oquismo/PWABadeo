import PushNotificationTest from '@/components/home/PushNotificationTest';

export default function Debug() {
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Debug Page</h1>
      <p>Si puedes ver esta página, el routing de Next.js funciona correctamente.</p>

      <h2>🔔 Test de Notificaciones Push</h2>
      <PushNotificationTest />

      <h2>📝 Test Manual de APIs</h2>
      <p>Copia y pega estos comandos en la consola del navegador:</p>

      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🔔 Test Push Notification:</h3>
        <code>
          fetch('/api/send-notification', &#123;<br/>
          &nbsp;&nbsp;method: 'POST',<br/>
          &nbsp;&nbsp;headers: &#123;'Content-Type': 'application/json'&#125;,<br/>
          &nbsp;&nbsp;body: JSON.stringify(&#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;title: 'Test desde Consola',<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;body: 'Esta es una notificación de prueba'<br/>
          &nbsp;&nbsp;&#125;)<br/>
          &#125;).then(r =&gt; r.json()).then(console.log)
        </code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🔔 Test Push to Specific User:</h3>
        <code>
          fetch('/api/send-notification', &#123;<br/>
          &nbsp;&nbsp;method: 'POST',<br/>
          &nbsp;&nbsp;headers: &#123;'Content-Type': 'application/json'&#125;,<br/>
          &nbsp;&nbsp;body: JSON.stringify(&#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;title: 'Mensaje Personal',<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;body: 'Notificación para usuario específico',<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;userId: 'ID_DEL_USUARIO'<br/>
          &nbsp;&nbsp;&#125;)<br/>
          &#125;).then(r =&gt; r.json()).then(console.log)
        </code>
      </div>      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🧪 Test Database:</h3>
        <code>
          fetch('/api/test-db').then(r =&gt; r.json()).then(console.log)
        </code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🔐 Test Login (hardcoded):</h3>
        <code>
          fetch('/api/auth/login-test', &#123;<br/>
          &nbsp;&nbsp;method: 'POST',<br/>
          &nbsp;&nbsp;headers: &#123;'Content-Type': 'application/json'&#125;,<br/>
          &nbsp;&nbsp;body: JSON.stringify(&#123;email: 'admin@badeo.com', password: 'admin123'&#125;)<br/>
          &#125;).then(r =&gt; r.json()).then(console.log)
        </code>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', margin: '10px 0', borderRadius: '5px' }}>
        <h3>🔄 Test Login con reintentos:</h3>
        <code>
          fetch('/api/auth/login-retry', &#123;<br/>
          &nbsp;&nbsp;method: 'POST',<br/>
          &nbsp;&nbsp;headers: &#123;'Content-Type': 'application/json'&#125;,<br/>
          &nbsp;&nbsp;body: JSON.stringify(&#123;email: 'TU_EMAIL', password: 'TU_PASSWORD'&#125;)<br/>
          &#125;).then(r =&gt; r.json()).then(console.log)
        </code>
      </div>

      <h2>🌐 Enlaces directos:</h2>
      <ul>
        <li><a href="/api/status">/api/status</a></li>
        <li><a href="/api/test-db">/api/test-db</a></li>
        <li><a href="/">/</a> - Página principal</li>
        <li><a href="/login">/login</a> - Página de login</li>
      </ul>
    </div>
  );
}
