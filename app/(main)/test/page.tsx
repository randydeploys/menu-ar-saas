// page test

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Test Environment</h1>
          <p className="text-muted-foreground">
            Use this page to verify components and application state during development.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 border rounded-xl bg-card shadow-sm">
            <h2 className="font-semibold mb-2">System Status</h2>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
              Operational
            </div>
          </div>
          
          <div className="p-6 border rounded-xl bg-card shadow-sm">
            <h2 className="font-semibold mb-2">Runtime Info</h2>
            <p className="text-xs font-mono text-muted-foreground">
              Node: {process.env.NODE_ENV}<br />
              Time: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="p-6 border rounded-xl bg-muted/50">
          <h2 className="font-semibold mb-4">Debug Console</h2>
          <pre className="text-xs overflow-auto p-4 bg-background rounded border">
            {JSON.stringify({
              headers: "Client-side render",
              location: "/test",
              ready: true
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
