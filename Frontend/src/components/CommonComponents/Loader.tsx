export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50" role="status" aria-label="Loading">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent border-t-primary" />
    </div>
  );
}
