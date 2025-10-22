// src/app/admin/page.js
'use client';

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, Admin</h1>
      <p className="mt-2 text-gray-600">Here’s a quick overview of your store:</p>

      {/* You can add stats cards here */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-4 shadow rounded-xl">Products: 120</div>
        <div className="bg-white p-4 shadow rounded-xl">Orders: 45</div>
        <div className="bg-white p-4 shadow rounded-xl">Users: 350</div>
      </div>
    </div>
  );
}
