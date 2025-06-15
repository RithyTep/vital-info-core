
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, UserCheck, Pill, FileText, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Doctors', href: '/doctors', icon: UserCheck },
    { name: 'Medications', href: '/medications', icon: Pill },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-lg">
            <div className="flex h-16 shrink-0 items-center">
              <h1 className="text-xl font-bold text-blue-600">HMS</h1>
              <span className="ml-2 text-sm text-gray-600">Hospital Management</span>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            location.pathname === item.href
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors duration-200'
                          )}
                        >
                          <item.icon
                            className={cn(
                              location.pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                              'h-6 w-6 shrink-0'
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-72 w-full">
          <main className="py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
