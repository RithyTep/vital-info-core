
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Users, UserCheck, Pill, FileText, LayoutDashboard, LogOut, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navigation = [
    { name: t('dashboard'), href: '/', icon: LayoutDashboard },
    { name: t('patients'), href: '/patients', icon: Users },
    { name: t('doctors'), href: '/doctors', icon: UserCheck },
    { name: t('medications'), href: '/medications', icon: Pill },
    { name: t('prescriptions'), href: '/prescriptions', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="fixed inset-y-0 z-50 flex w-72 flex-col">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-sm px-6 pb-4 shadow-xl border-r border-gray-200">
            <div className="flex h-16 shrink-0 items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  H
                </div>
                <div>
                  <h1 className="text-xl font-bold text-blue-600">HMS</h1>
                  <span className="text-xs text-gray-500">Hospital Management</span>
                </div>
              </div>
            </div>

            {/* Language Switch */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-600">Language</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={cn("text-xs", language === 'en' ? 'font-semibold text-blue-600' : 'text-gray-500')}>EN</span>
                <Switch
                  checked={language === 'km'}
                  onCheckedChange={(checked) => setLanguage(checked ? 'km' : 'en')}
                  className="data-[state=checked]:bg-blue-600"
                />
                <span className={cn("text-xs", language === 'km' ? 'font-semibold text-blue-600' : 'text-gray-500')}>ខ្មែរ</span>
              </div>
            </div>

            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-2">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={cn(
                            location.pathname === item.href
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50',
                            'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 transform hover:scale-105'
                          )}
                        >
                          <item.icon
                            className={cn(
                              location.pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-blue-600',
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
                <li className="mt-auto">
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="pl-72 w-full">
          <main className="py-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 mx-6 mb-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
