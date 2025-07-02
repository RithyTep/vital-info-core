import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import MiniCalendar from './MiniCalendar';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

const LoginForm = () => {
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast({
        title: 'Success',
        description: 'Login successful',
      });
    } else {
      toast({
        title: 'Error',
        description: t('invalidPassword'),
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10 animate-fade-in bg-gradient-to-br from-blue-100 via-indigo-200 to-blue-400 transition-all duration-700"
        style={{ backgroundSize: '200% 200%', animation: 'bgMove 10s ease-in-out infinite' }}
      />
      <style>
        {`
          @keyframes bgMove {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
        `}
      </style>
      {/* MiniCalendar shown above the login card */}
      <div className="mb-6">
        <MiniCalendar />
      </div>
      <Card className="w-full max-w-md shadow-2xl animate-fade-in">
        <CardHeader className="space-y-4 text-center">


          <div className="flex items-center space-x-2 m-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
              <img
                src="https://zcp184l8mpgeuiph.public.blob.vercel-storage.com/2025-06-21%2015.41.35-2m5dg45lCYTP9CDPO5n4GTsGeDQaao.jpg"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-nowrap text-[16px] font-bold text-blue-600">{t('appShortName')}</h1>
              <span className="text-xs text-gray-500">{t('hospitalManagementSubtitle')}</span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-600">{t('language')}</span>
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'km')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={t('language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="km">ខ្មែរ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('password')}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                autoComplete="current-password"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              {t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
