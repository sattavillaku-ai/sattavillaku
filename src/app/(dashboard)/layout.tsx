export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4">
      {/* பயனர் டாஷ்போர்டு (User Dashboard) */}
      <h2 className="text-xl font-bold mb-4 border-b pb-2">பயனர் டாஷ்போர்டு (User Dashboard)</h2>
      {children}
    </div>
  );
}